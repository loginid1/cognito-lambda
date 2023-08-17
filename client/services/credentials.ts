import { get, post } from "./fetch";
import { Config, CredentialData, CredentialsData } from "./types";

import { CREDENTIALS_BASE_URL as BASE_URL } from "../environment/";

export const getConfig = async () => {
  return await get<Config>(`${BASE_URL}/config`);
};

export const fido2RegisterInit = async (username: string) => {
  return await post(`${BASE_URL}/fido2/register/init`, { username });
};

export const fido2RegisterComplete = async (body: any) => {
  return await post(`${BASE_URL}/fido2/register/complete`, body);
};

export const fido2CreateInit = async (token: string) => {
  return await post<any>(BASE_URL + "/fido2/create/init", null, {
    Authorization: "Bearer " + token,
  });
};

export const fido2CreateComplete = async (body: any, token: string) => {
  return await post<CredentialData>(BASE_URL + "/fido2/create/complete", body, {
    Authorization: "Bearer " + token,
  });
};

export const credentialList = async (token: string, type = "fido2") => {
  const response = get<CredentialsData>(
    BASE_URL + "/credentials/list?status=active&type=" + type,
    { Authorization: "Bearer " + token }
  );
  return response;
};

export const renameCredential = async (
  credentialUUID: string,
  name: string,
  token: string
) => {
  const response = post<CredentialData>(
    BASE_URL + "/credentials/rename",
    {
      credential_uuid: credentialUUID,
      name: name,
    },
    { Authorization: "Bearer " + token }
  );
  return response;
};

export const revokeCredential = async (
  credentialUUID: string,
  token: string
) => {
  const response = post<CredentialData>(
    BASE_URL + "/credentials/revoke",
    { credential_uuid: credentialUUID },
    { Authorization: "Bearer " + token }
  );
  return response;
};
