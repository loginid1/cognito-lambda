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
import LoginIDCognitoWebSDK from "../LoginIDCognitoSDK/";

import { config } from "../utils/env";

const { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID } = config;

const userPool = new CognitoUserPool({
  UserPoolId: COGNITO_USER_POOL_ID,
  ClientId: COGNITO_CLIENT_ID,
});

export const Loginid = new LoginIDCognitoWebSDK(
  COGNITO_USER_POOL_ID,
  COGNITO_CLIENT_ID
);

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

export const getUserAttributes = async (
  user: CognitoUser | null
): Promise<CognitoUserAttribute[]> => {
  return new Promise((res, rej) => {
    if (!user) {
      rej("No user found");
    } else {
      user.getUserAttributes((err, attributes) => {
        if (err) {
          rej(err);
        } else {
          res(attributes || []);
        }
      });
    }
  });
};

export const updateUserAttributes = async (
  user: CognitoUser | null,
  attributes: CognitoUserAttribute[]
) => {
  return new Promise((res, rej) => {
    user?.updateAttributes(attributes, (err, result) => {
      if (err) {
        rej(err);
      } else {
        res(result);
      }
    });
  });
};

export const deleteUserAttributes = async (
  user: CognitoUser | null,
  attributes: string[]
) => {
  return new Promise((res, rej) => {
    user?.deleteAttributes(attributes, (err, result) => {
      if (err) {
        rej(err);
      } else {
        res(result);
      }
    });
  });
};

//is global sign out
export const signOutUser = (user: CognitoUser | null) => {
  return new Promise((res, rej) => {
    user?.globalSignOut({
      onSuccess(msg) {
        console.log(msg);
        res(msg);
      },
      onFailure(err) {
        rej(err);
      },
    });
  });
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
  answer: string,
  type: string
): Promise<CognitoUser> => {
  return new Promise((res, rej) => {
    const authenticationData: IAuthenticationDetailsData = {
      Username: username,
      //could be password
      Password: answer,
    };
    const userData: ICognitoUserData = {
      Username: username,
      Pool: userPool,
    };

    const authenticationDetails = new AuthenticationDetails(authenticationData);
    const user = new CognitoUser(userData);

    const callbackCreateObj: IAuthenticationCallback = {
      customChallenge: async function (challengParams: any) {
        const clientMetadata = {
          authentication_type: "FIDO2_CREATE",
        };

        if (challengParams?.challenge === "AUTH_PARAMS") {
          user.sendCustomChallengeAnswer("AUTH_PARAMS", this, clientMetadata);
          return;
        }

        //get idtoken from cognito
        const token = await getUserIDToken(null);

        const publicKey = JSON.parse(challengParams.public_key);
        const result = await webauthn.create(publicKey);
        user.sendCustomChallengeAnswer(
          JSON.stringify({ ...result, id_token: token }),
          this,
          clientMetadata
        );
      },

      onSuccess: function (_) {
        console.log(_);
        res(user);
      },

      onFailure: function (err) {
        rej(err);
      },
    };

    const callbackGetObj: IAuthenticationCallback = {
      customChallenge: async function (challengParams: any) {
        const clientMetadata = {
          authentication_type: "FIDO2_GET",
        };

        if (challengParams?.challenge === "AUTH_PARAMS") {
          user.sendCustomChallengeAnswer("AUTH_PARAMS", this, clientMetadata);
          return;
        }
        const publicKey = JSON.parse(challengParams.public_key);
        const result = await webauthn.get(publicKey);
        user.sendCustomChallengeAnswer(
          JSON.stringify({ ...result }),
          this,
          clientMetadata
        );
      },

      onSuccess: function (_) {
        console.log(_);
        res(user);
      },

      onFailure: function (err) {
        rej(err);
      },
    };

    switch (type) {
      case "FIDO2_CREATE": {
        user.setAuthenticationFlowType("CUSTOM_AUTH");
        user.initiateAuth(authenticationDetails, callbackCreateObj);
        break;
      }

      case "FIDO2_GET": {
        user.setAuthenticationFlowType("CUSTOM_AUTH");
        user.initiateAuth(authenticationDetails, callbackGetObj);
        break;
      }

      case "PASSWORD": {
        user.authenticateUser(authenticationDetails, callbackGetObj);
        break;
      }
    }
  });
};

export const respondToAuthChallenge = async (
  user: CognitoUser,
  authentication_type: string,
  challengeResponse: any
): Promise<CognitoUser | null> => {
  return new Promise((res, rej) => {
    const clientMetadata = {
      authentication_type,
    };

    user.setAuthenticationFlowType("CUSTOM_AUTH");
    user.sendCustomChallengeAnswer(
      challengeResponse,
      {
        customChallenge: async function (_: any) {
          console.log("Retry...");
          res(null);
        },

        onSuccess: function (_) {
          res(user);
        },

        onFailure: function (err) {
          rej(err);
        },
      },
      clientMetadata
    );
  });
};
