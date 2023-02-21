import { get, post, put } from "./fetch";

const BASE_URL = "/api/users";

interface User {
  username: string;
}

export const getUser = async () => {
  const user = await get<User>(BASE_URL);
  return user;
};

export const authUser = async (idToken: string, accessToken: string) => {
  await post(BASE_URL, { id_token: idToken, access_token: accessToken });
};

export const logoutUser = async () => {
  await put<null>(BASE_URL + "/logout");
};
