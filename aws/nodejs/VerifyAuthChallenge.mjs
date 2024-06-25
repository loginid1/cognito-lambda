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
import { Buffer } from "buffer";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

const LOGINID_BASE_URL = process.env.LOGINID_BASE_URL || "";
const LOGINID_SECRET_NAME = process.env.LOGINID_SECRET_NAME || "";

const secretsmanager = new SecretsManagerClient();

export const handler = async (event) => {
  console.log(event);
  const { request, response } = event;
  const { clientMetadata, challengeAnswer } = request;
  const { authentication_type: authenticationType } = clientMetadata;

  // if authentication type is empty throw error
  if (!authenticationType) {
    throw new Error("Authentication type not found");
  }

  // pass for next round to obtain authentication type
  if (challengeAnswer === "AUTH_PARAMS") {
    response.answerCorrect = false;
    return event;
  }

  try {
    switch (authenticationType) {
      case "FIDO2_CREATE":
      case "FIDO2_GET":
      case "JWT_ACCESS":
        // parse JWT token
        const payload = parseJwt(challengeAnswer);

        if (payload.aud !== getLoginIdAppId()) {
          throw new Error("Invalid JWT token");
        }
        if (payload.username !== event.userName) {
          throw new Error("Invalid JWT token");
        }

        await verifyJwtAccessToken(challengeAnswer);
        break;

      case "EMAIL_OTP":
        // get otp from private challenge parameters
        const otp = request?.privateChallengeParameters?.otp;
        if (otp !== challengeAnswer) {
          throw new Error("Invalid OTP");
        }
        break;

      default:
        throw new Error("Invalid authentication type");
    }

    response.answerCorrect = true;
    return event;
  } catch (e) {
    console.log(e);
    response.answerCorrect = false;
    return event;
  }
};

const getKeyId = async () => {
  const secret = await secretsmanager.send(
    new GetSecretValueCommand({ SecretId: LOGINID_SECRET_NAME })
  );
  return secret.SecretString;
};

const getLoginIdAppId = () => {
  const pattern = /https:\/\/([0-9a-fA-F-]+)\.api\.(.*\.)?loginid\.io/;
  const match = LOGINID_BASE_URL.match(pattern);

  if (match) {
    return match[1];
  } else {
    throw new Error("Invalid LoginID base URL");
  }
};

const verifyJwtAccessToken = async (token) => {
  const url = `${LOGINID_BASE_URL}/fido2/v2/mgmt/token/verify`;
  const payload = JSON.stringify({ jwtAccess: token });

  const keyId = await getKeyId();
  const credentials = `${keyId}:`;
  const encodedCredentials = Buffer.from(credentials).toString("base64");
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${encodedCredentials}`,
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        if (res.statusCode === 204) {
          resolve();
        } else {
          console.log("Error response:", data);
          reject(new Error("Invalid JWT token"));
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    req.write(payload);
    req.end();
  });
};

const parseJwt = (token) => {
  const [_, payload] = token.split(".");
  const decodedPayload = Buffer.from(payload, "base64").toString("utf-8");
  return JSON.parse(decodedPayload);
};
