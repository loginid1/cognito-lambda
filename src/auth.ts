import { CognitoIdToken } from "amazon-cognito-identity-js";

const ID_TOKEN = "ID_TOKEN";

export const storeToken = (idToken: CognitoIdToken) => {
  localStorage.setItem(ID_TOKEN, JSON.stringify(idToken));
  return true;
};

export const getToken = () => {
  return localStorage.getItem(ID_TOKEN);
};

export const getTokenParsed = () => {
  const _token = getToken();
  if (!_token) {
    throw new Error("Token not found");
  }

  return JSON.parse(_token) as CognitoIdToken;
};

export const clearToken = () => {
  return localStorage.removeItem(ID_TOKEN);
};

export const validToken = () => {
  const _token = getToken();

  if (!_token) {
    return false;
  }

  const token: CognitoIdToken = JSON.parse(_token);
  const { exp } = token.payload;

  console.log(token.payload);
  if (Math.floor(Date.now() / 1000) > exp) {
    clearToken();
    return false;
  }

  return true;
};
