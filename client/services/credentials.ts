import { get, post } from "./fetch";
import {
  Config,
  CredentialData,
  CredentialsData,
  CredentialPhoneInitResponse,
} from "./types";

import { config } from "../utils/env";

const { PASSKEY_API_BASE_URL } = config;
const BASE_URL = PASSKEY_API_BASE_URL;

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
  const response = post<null>(
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
  const response = post<null>(
    BASE_URL + "/credentials/revoke",
    { credential_uuid: credentialUUID },
    { Authorization: "Bearer " + token }
  );
  return response;
};

export const credentialsPhoneInit = async (
  phoneNumber: string,
  deliveryMode: "sms" | "voice",
  token: string
) => {
  return await post<CredentialPhoneInitResponse>(
    BASE_URL + "/credentials/phone/init",
    { phone_number: phoneNumber, delivery_mode: deliveryMode },
    { Authorization: "Bearer " + token }
  );
};

export const credentialsPhoneComplete = async (
  credentialUUID: string,
  phoneNumber: string,
  otp: string,
  token: string
) => {
  return await post<CredentialData>(
    BASE_URL + "/credentials/phone/complete",
    { credential_uuid: credentialUUID, phone_number: phoneNumber, otp },
    { Authorization: "Bearer " + token }
  );
};

export const sendAccessLink = async (email: string) => {
  return await post<null>(BASE_URL + "/authenticate/link", { email });
};
