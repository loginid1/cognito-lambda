import env from "./env";
import { base64ToBuffer, bufferToBase64 } from "./encoding";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserSession,
  IAuthenticationCallback,
  IAuthenticationDetailsData,
  ICognitoUserData,
} from "amazon-cognito-identity-js";

const { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID } = env;

export const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_USER_POOL_ID,
  ClientId: COGNITO_CLIENT_ID,
});

export const authenticate = (
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
