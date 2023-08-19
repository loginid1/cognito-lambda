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

import configURL from "../config/main.json";

//this is needed because a new config file will be placed in the build folder and is unique to each deployment
let userPool: CognitoUserPool;
export const initalLoad = async () => {
  return fetch(configURL)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      throw new Error("Failed to fetch config");
    })
    .then((config) => {
      userPool = new CognitoUserPool({
        UserPoolId: config.COGNITO_USER_POOL_ID,
        ClientId: config.COGNITO_CLIENT_ID,
      });
    });
};

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
        //dummy response to select FIDO2 authentication
        const clientMetadata = {
          authentication_type: "FIDO2",
        };
        if (challengParams?.challenge === "AUTH_PARAMS") {
          user.sendCustomChallengeAnswer("AUTH_PARAMS", this, clientMetadata);
          return;
        }

        //FIDO2 authentication
        const publicKey = JSON.parse(challengParams.public_key);
        const result = await webauthn.get(publicKey);
        const assertion = {
          ...result.assertion_payload,
        };
        user.sendCustomChallengeAnswer(
          JSON.stringify({ assertion }),
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

    //still in development do not use
    const callbackphoneOTPObj: IAuthenticationCallback = {
      customChallenge: async function (challengParams: any) {
        //dummy response to select FIDO2 authentication
        const clientMetadata = {
          authentication_type: "PHONE_OTP",
        };
        if (challengParams?.challenge === "AUTH_PARAMS") {
          user.sendCustomChallengeAnswer("AUTH_PARAMS", this, clientMetadata);
          return;
        }

        console.log(challengParams);

        user.sendCustomChallengeAnswer(
          "123456", //OTP code"
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
      case "FIDO2": {
        user.setAuthenticationFlowType("CUSTOM_AUTH");
        user.initiateAuth(authenticationDetails, callbackObj);
        break;
      }

      case "PHONE_OTP": {
        user.setAuthenticationFlowType("CUSTOM_AUTH");
        user.initiateAuth(authenticationDetails, callbackphoneOTPObj);
        break;
      }

      case "PASSWORD": {
        user.authenticateUser(authenticationDetails, callbackObj);
        break;
      }
    }
  });
};
