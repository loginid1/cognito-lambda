import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
  CognitoUserAttribute,
  CognitoUserSession,
  IAuthenticationCallback,
  IAuthenticationDetailsData,
  ICognitoUserData,
} from "amazon-cognito-identity-js";
import * as webauthn from "../webauthn/";

import { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID } from "../environment/";

export const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_USER_POOL_ID,
  ClientId: COGNITO_CLIENT_ID,
});

export const getCurrentUser = (): CognitoUser | null => {
  const user = userPool.getCurrentUser();
  return user;
};

export const getUserSession = (
  user: CognitoUser | null
): Promise<CognitoUserSession> => {
  if (!user) {
    user = getCurrentUser();
  }

  return new Promise((res, rej) => {
    if (!user) {
      rej("No user found");
    } else {
      user.getSession((err: any, session: CognitoUserSession) => {
        if (err) {
          rej(err);
        } else {
          res(session);
        }
      });
    }
  });
};

export const getUserIDToken = async (
  user: CognitoUser | null
): Promise<string> => {
  const session = await getUserSession(user);
  return session.getIdToken().getJwtToken();
};

export const signUp = (
  username: string,
  email: string,
  password: string
): Promise<CognitoUser> => {
  return new Promise((res, rej) => {
    const attributeList = [];
    const dataEmail = {
      Name: "email",
      Value: email,
    };
    const attributeEmail = new CognitoUserAttribute(dataEmail);

    attributeList.push(attributeEmail);

    userPool.signUp(
      username.toLowerCase(),
      password,
      attributeList,
      [],
      (err, result) => {
        if (err) {
          rej(err);
        } else {
          res(result!.user);
        }
      }
    );
  });
};

export const confirmSignUp = (
  username: string,
  code: string
): Promise<CognitoUser> => {
  const userData = {
    Username: username,
    Pool: userPool,
  };
  const cognitoUser = new CognitoUser(userData);
  return new Promise((res, rej) => {
    cognitoUser.confirmRegistration(code, true, (err, _) => {
      if (err) {
        rej(err);
      } else {
        res(cognitoUser);
      }
    });
  });
};

export const authenticate = (
  username: string,
  password: string,
  type: string
): Promise<CognitoUser> => {
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
        const result = await webauthn.get(publicKey);
        const assertion = {
          ...result.assertion_payload,
        };
        user.sendCustomChallengeAnswer(JSON.stringify({ assertion }), this);
      },

      onSuccess: function (_) {
        res(user);
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
