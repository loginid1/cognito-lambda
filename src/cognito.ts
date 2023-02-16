import env from "./env";
import { randomPassword } from "./random";
import {
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
  ISignUpResult,
} from "amazon-cognito-identity-js";

const { COGNITO_CLIENT_ID, COGNITO_USER_POOL_ID } = env;

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
