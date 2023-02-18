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
  IAuthenticationCallback,
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

export const initiateAuthFIDO2 = (
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
        console.log(challengParams);
        const { jwt, credential } = await loginid.authenticateWithFido2(
          username
        );

        //TODO:validate jwt with local server

        user.sendCustomChallengeAnswer(
          JSON.stringify({ credentialUUID: credential?.uuid }),
          this
        );
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

      //we want to change the defaulted customChallenge to register a user on LoginID instead
      //since a user is already found on Cognito but not on LoginID
      case "ADD-FIDO2": {
        callbackObj.customChallenge = async () => {
          const { jwt, credential } = await loginid.registerWithFido2(username);

          //TODO:validate jwt with local server

          user.sendCustomChallengeAnswer(
            JSON.stringify({ credentialUUID: credential?.uuid }),
            this!
          );
        };

        user.setAuthenticationFlowType("CUSTOM_AUTH");
        user.initiateAuth(authenticationDetails, callbackObj);
        break;
      }
    }
  });
};
