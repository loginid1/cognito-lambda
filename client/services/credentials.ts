import { get, post } from "./fetch";
import { Config, CredentialData, CredentialsData } from "./types";

import configURL from "../config/main.json";

//this is needed because a new config file will be placed in the build folder and is unique to each deployment
let BASE_URL = "";
export const initalLoad = async () => {
  return await fetch(configURL)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      throw new Error("Failed to fetch config");
    })
    .then((config) => {
      BASE_URL = config.CREDENTIALS_BASE_URL;
    });
};

//this should be the first thing to be called on page load (or close to it)
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
