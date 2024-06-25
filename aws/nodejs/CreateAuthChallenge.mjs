/**
 * Copyright 2024 LoginID
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import https from "https";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import { Buffer } from "buffer";
import { randomBytes } from "crypto";
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

const LOGINID_BASE_URL = process.env.LOGINID_BASE_URL || "";
const LOGINID_SECRET_NAME = process.env.LOGINID_SECRET_NAME || "";
const SES_SENDER_EMAIL = process.env.SES_SENDER_EMAIL || "";

const secretsmanager = new SecretsManagerClient();
const ses = new SESClient();

export const handler = async (event) => {
  console.log(event);

  const { request, response } = event;
  const { session = [], clientMetadata } = request;
  const username = event.userName;

  if (session.length === 0) {
    response.challengeMetadata = "AUTH_PARAMS";
    response.privateChallengeParameters = { challenge: "AUTH_PARAMS" };
    response.publicChallengeParameters = { challenge: "AUTH_PARAMS" };
    return event;
  }

  if (!clientMetadata) {
    throw new Error("ClientMetadata is required");
  }

  let initRes;
  let publicKey;

  switch (clientMetadata.authentication_type) {
    case "FIDO2_CREATE":
      const optionsCreate = JSON.parse(clientMetadata.options || "{}");
      await verifyCognitoIdToken(event, optionsCreate.idToken);
      initRes = await registerWithPasskeyInit(username, optionsCreate);
      publicKey = JSON.stringify(initRes);

      response.privateChallengeParameters = { public_key: publicKey };
      response.publicChallengeParameters = { public_key: publicKey };
      return event;

    case "EMAIL_OTP":
      if (session.length === 1) {
        const otp = generateOtp();
        await sendOtpEmail(username, otp);

        response.privateChallengeParameters = {
          challenge: "EMAIL_OTP",
          otp: otp,
        };
        response.publicChallengeParameters = { challenge: "EMAIL_OTP" };
        response.challengeMetadata = otp;
      } else {
        const latestSession = session[session.length - 1];
        const otp = latestSession.challengeMetadata;

        response.privateChallengeParameters = {
          challenge: "EMAIL_OTP",
          otp: otp,
        };
        response.publicChallengeParameters = { challenge: "EMAIL_OTP" };
        response.challengeMetadata = otp;
      }
      return event;

    default:
      throw new Error("Authentication type not supported");
  }
};

const getKeyId = async () => {
  const secret = await secretsmanager.send(
    new GetSecretValueCommand({ SecretId: LOGINID_SECRET_NAME })
  );
  return secret.SecretString;
};

const generateManagementToken = async (username) => {
  const url = `${LOGINID_BASE_URL}/fido2/v2/mgmt/grant`;
  const headers = { "Content-Type": "application/json" };
  const payload = JSON.stringify({
    grants: ["passkey:read", "passkey:write"],
    username: username,
  });

  const keyId = await getKeyId();
  const credentials = `${keyId}:`;
  const encodedCredentials = Buffer.from(credentials).toString("base64");

  headers["Authorization"] = `Basic ${encodedCredentials}`;

  const data = await httpRequest(url, "POST", payload, headers);
  return JSON.parse(data).token;
};

const registerWithPasskeyInit = async (username, options) => {
  const appId = getLoginIdAppId();
  const managementToken = await generateManagementToken(username);

  const url = `${LOGINID_BASE_URL}/fido2/v2/reg/init`;
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${managementToken}`,
    ...(options.userAgent && { "User-Agent": options.userAgent }),
  };
  const payload = {
    app: { id: appId },
    deviceInfo: {},
    user: { username: username, usernameType: "email" },
  };

  deepUpdate(payload, cleanLoginidOptions(options));

  const data = await httpRequest(url, "POST", JSON.stringify(payload), headers);
  return JSON.parse(data);
};

const authenticateWithPasskeyInit = async (username, options) => {
  const appId = getLoginIdAppId();

  const url = `${LOGINID_BASE_URL}/fido2/v2/auth/init`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.userAgent && { "User-Agent": options.userAgent }),
  };
  const payload = {
    app: { id: appId },
    deviceInfo: {},
    user: { username: username, usernameType: "email" },
  };

  deepUpdate(payload, cleanLoginidOptions(options));

  const data = await httpRequest(url, "POST", JSON.stringify(payload), headers);
  return JSON.parse(data);
};

const getLoginIdAppId = () => {
  const regex = /https:\/\/([0-9a-fA-F-]+)\.api\..*\.loginid\.io/;
  const match = LOGINID_BASE_URL.match(regex);

  if (!match) {
    throw new Error("Invalid LoginID base URL");
  }

  return match[1];
};

const cleanLoginidOptions = (options) => {
  if (options.user?.username) {
    delete options.user.username;
  }

  if (options.app?.id) {
    delete options.app.id;
  }

  return options;
};

const deepUpdate = (original, update) => {
  for (const key in update) {
    if (Array.isArray(update[key])) {
      original[key] = update[key];
    } else if (typeof update[key] === "object" && update[key] !== null) {
      original[key] = deepUpdate(original[key] || {}, update[key]);
    } else {
      original[key] = update[key];
    }
  }
  return original;
};

const verifyCognitoIdToken = async (event, token) => {
  if (!token) {
    throw new Error("id_token is missing");
  }

  const { region, userPoolId, userName: username, callerContext } = event;
  const clientId = callerContext?.clientId;

  const issuer = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`;
  const jwksUrl = `${issuer}/.well-known/jwks.json`;

  const signingKey = await getSigningKey(jwksUrl, token);
  const pem = jwkToPem(signingKey);

  const decoded = jwt.verify(token, pem, {
    algorithms: ["RS256"],
    audience: clientId,
    issuer: issuer,
  });

  if (decoded["cognito:username"] !== username) {
    throw new Error("username claim mismatch");
  }
};

const sendOtpEmail = async (email, otp) => {
  const input = {
    Source: SES_SENDER_EMAIL,
    Destination: { ToAddresses: [email] },
    Message: {
      Subject: { Data: "Your verification code", Charset: "UTF-8" },
      Body: {
        Text: { Data: `Your confirmation code is ${otp}`, Charset: "UTF-8" },
      },
    },
  };

  await ses.send(new SendEmailCommand(input));
};

const generateOtp = () => {
  return Array.from(randomBytes(6))
    .map((byte) => (byte % 10).toString())
    .join("");
};

const httpRequest = (url, method, data, headers) => {
  return new Promise((resolve, reject) => {
    const options = {
      method: method,
      headers: headers,
    };

    const req = https.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          reject(
            new Error(
              `Request failed with status code ${res.statusCode}: ${body}`
            )
          );
        } else {
          resolve(body);
        }
      });
    });

    req.on("error", reject);
    req.write(data);
    req.end();
  });
};

const getSigningKey = async (jwksUrl, token) => {
  const res = await httpRequest(jwksUrl, "GET", "", {});
  const { keys } = JSON.parse(res);

  const kid = jwt.decode(token, { complete: true }).header.kid;
  const signingKey = keys.find((key) => key.kid === kid);

  if (!signingKey) {
    throw new Error("No matching key found in JWKS");
  }

  return signingKey;
};
