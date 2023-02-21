import env from "./env";
import { randomPassword } from "./random";
import { base64ToBuffer, bufferToBase64 } from "./encoding";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  IAuthenticationCallback,
  IAuthenticationDetailsData,
  ICognitoUserData,
  ISignUpResult,
} from "amazon-cognito-identity-js";

const { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID } = env;

export const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_USER_POOL_ID,
  ClientId: COGNITO_CLIENT_ID,
});

export const userSignup = (
  username: string,
  password: string,
  attributes: CognitoUserAttribute[]
): Promise<ISignUpResult> => {
  return new Promise((res, rej) => {
    userPool.signUp(
      username,
      //if password is set, it is password user, if not it is FIDO2
      password || randomPassword(),
      attributes,
      [],
      (err, result) => {
        if (err) {
          rej(err);
        } else if (!result) {
          rej(new Error("Result was not found"));
        } else {
          res(result);
        }
      }
    );
  });
};

export const confirmationCode = (user: CognitoUser, code: string) => {
  return new Promise((res, rej) => {
    user.confirmRegistration(code, true, (err, result) => {
      if (err) {
        rej(err);
      } else {
        res(result);
      }
    });
  });
};

export const initiateFIDO2 = (
  username: string,
  password: string,
  type: string
): Promise<CognitoUserSession> => {
  return new Promise((res, rej) => {
    const authenticationData: IAuthenticationDetailsData = {
      Username: username,
      Password: password,
    };
    const userData: ICognitoUserData = {
      Username: username,
      Pool: userPool,
    };

    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const user = new CognitoUser(userData);

    const callbackObj: IAuthenticationCallback = {
      customChallenge: async function (challengParams: any) {
        const publicKey = JSON.parse(challengParams.public_key);

        publicKey.challenge = base64ToBuffer(publicKey.challenge);

        if (publicKey.allowCredentials) {
          for (const credential of publicKey.allowCredentials) {
            credential.id = base64ToBuffer(credential.id);
          }
        }

        const credential = (await navigator.credentials.get({
          publicKey,
        })) as PublicKeyCredential;

        if (!credential) {
          throw new Error("Failed to authenticate credential");
        }

        const response = credential.response as AuthenticatorAssertionResponse;

        const assertion = {
          credential_id: bufferToBase64(credential.rawId),
          client_data: bufferToBase64(response.clientDataJSON),
          authenticator_data: bufferToBase64(response.authenticatorData),
          signature: bufferToBase64(response.signature),
        };

        user.sendCustomChallengeAnswer(JSON.stringify({ assertion }), this);
      },

      onSuccess: function (result) {
        res(result);
      },

      onFailure: function (err) {
        rej(err);
      },
    };

    switch (type) {
      case "FIDO2": {
        user.setAuthenticationFlowType("CUSTOM_AUTH");
        user.initiateAuth(authenticationDetails, callbackObj);
        break;
      }

      case "PASSWORD": {
        user.authenticateUser(authenticationDetails, callbackObj);
        break;
      }
    }
  });
};
