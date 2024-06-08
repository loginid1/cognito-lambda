export interface Config {
  COGNITO_USER_POOL_ID: string;
  COGNITO_CLIENT_ID: string;
  LOGINID_BASE_URL: string;
}

export const config: Config = {
  COGNITO_USER_POOL_ID: process.env.REACT_COGNITO_USER_POOL_ID || "",
  COGNITO_CLIENT_ID: process.env.REACT_COGNITO_CLIENT_ID || "",
  LOGINID_BASE_URL: process.env.REACT_LOGINID_BASE_URL || "",
};
