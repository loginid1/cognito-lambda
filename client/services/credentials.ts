import { post } from "./fetch";

import { CREDENTIALS_BASE_URL as BASE_URL } from "../environment/";

export interface Credential {
  uuid: string;
  type?: string;
  status: string;
  name: string;
  created_at?: string;
  updated_at?: string;
}

export interface CredentialsData {
  credentials: Credential[];
}

export interface CredentialData {
  credential: Credential;
}

export const fido2RegisterInit = async (username: string) => {
  return await post(`${BASE_URL}/fido2/register/init`, { username });
};

export const fido2RegisterComplete = async (body: any) => {
  return await post(`${BASE_URL}/fido2/register/complete`, body);
};
