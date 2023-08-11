import { get } from "./fetch";
import { User } from "../contexts/types";

const BASE_URL = "/api/user";

export const checkAuth = async () => {
  const response = get<User>(BASE_URL);
  return response;
};
