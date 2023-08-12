import { get } from "./fetch";

const BASE_URL = "/api/loginid";

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

export const credentialList = async (type = "fido2") => {
  const response = get<CredentialsData>(
    BASE_URL + "/credentials/list?type=" + type
  );
  return response;
};
