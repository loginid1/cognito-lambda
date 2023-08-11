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
