import env from "./env";
import LoginID from "@loginid/sdk";
import { randomPassword } from "./random";
import { getValues } from "./elements";
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  CognitoUserSession,
  IAuthenticationDetailsData,
  ICognitoUserData,
  ISignUpResult,
} from "amazon-cognito-identity-js";

const {
  COGNITO_CLIENT_ID,
  COGNITO_USER_POOL_ID,
  LOGINID_BASE_URL,
  LOGINID_CLIENT_ID,
} = env;

const loginid = new LoginID(LOGINID_BASE_URL, LOGINID_CLIENT_ID);
const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_USER_POOL_ID,
  ClientId: COGNITO_CLIENT_ID,
});

export const userSignup = (
  username: string,
  attributes: CognitoUserAttribute[],
  validations: CognitoUserAttribute[]
): Promise<ISignUpResult> => {
  return new Promise((res, rej) => {
    userPool.signUp(
      username,
      randomPassword(),
      attributes,
      validations,
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

export const initiateAuthFIDO2 = (
  username: string
): Promise<CognitoUserSession> => {
  return new Promise((res, rej) => {
    const authenticationData: IAuthenticationDetailsData = {
      Username: username,
    };
    const userData: ICognitoUserData = {
      Username: username,
      Pool: userPool,
    };

    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const user = new CognitoUser(userData);

    user.setAuthenticationFlowType("CUSTOM_AUTH");
    user.initiateAuth(authenticationDetails, {
      customChallenge: async function () {
        const { username } = getValues();

        const { jwt, credential } = await loginid.authenticateWithFido2(
          username
        );
        user.sendCustomChallengeAnswer(
          JSON.stringify({ credentialUUID: credential?.uuid, jwt }),
          this
        );
      },

      onSuccess: function (result) {
        res(result);
      },

      onFailure: function (err) {
        rej(err);
      },
    });
  });
};
