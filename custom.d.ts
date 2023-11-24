import { CognitoUserSession } from "amazon-cognito-identity-js";

declare interface CustomAuthenticationOptions {
  metaData?: object;
  attestationOptions?: {
    requireResidentKey?: boolean;
    overrideTimeout?: number;
  };
}

class LoginIDCognitoWebSDK {
  constructor(userPoolId: string, clientId: string);

  public async addPasskey(
    username: string,
    idToken: string,
    options?: CustomAuthenticationOptions
  ): Promise<CognitoUserSession>;

  public async signInPasskey(
    username: string,
    options?: CustomAuthenticationOptions
  ): Promise<CognitoUserSession>;
}

export {};
