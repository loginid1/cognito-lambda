import { post } from "./fetch";

const BASE_URL = "/api/auth";

export const passwordAuthenticate = async (
  username: string,
  password: string
) => {
  const response = post<any>(BASE_URL + "/password/authenticate", {
    username,
    password,
  });
  return response;
};
