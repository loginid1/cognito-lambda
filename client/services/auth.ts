import { post } from "./fetch";
import { User } from "../contexts/types";

const BASE_URL = "/api/auth";

export const passwordAuthenticate = async (
  username: string,
  password: string
) => {
  const response = post<User>(BASE_URL + "/password/authenticate", {
    username,
    password,
  });
  return response;
};

export const fido2AuthenticateInit = async (username: string) => {
  const response = post<any>(BASE_URL + "/fido2/authenticate/init", {
    username,
  });
  return response;
};

export const fido2AuthenticateComplete = async (body: any) => {
  const response = post<User>(BASE_URL + "/fido2/authenticate/complete", body);
  return response;
};
