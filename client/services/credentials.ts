import { del, get, post, put } from "./fetch";
import { Config, CredentialPhoneInitResponse, PasskeyInfo } from "./types";

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
  return await post<null>(BASE_URL + "/fido2/create/complete", body, {
    Authorization: "Bearer " + token,
  });
};

export const passkeyList = async (token: string) => {
  const response = get<PasskeyInfo[]>(BASE_URL + "/passkeys", {
    Authorization: "Bearer " + token,
  });
  return response;
};

export const renamePasskey = async (
  passkeyId: string,
  name: string,
  token: string
) => {
  const response = put<null>(
    BASE_URL + `/passkeys/${passkeyId}`,
    {
      name: name,
    },
    { Authorization: "Bearer " + token }
  );
  return response;
};

export const deletePasskey = async (passkeyId: string, token: string) => {
  const response = del<null>(BASE_URL + `/passkeys/${passkeyId}`, {
    Authorization: "Bearer " + token,
  });
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
  return await post<null>(
    BASE_URL + "/credentials/phone/complete",
    { credential_uuid: credentialUUID, phone_number: phoneNumber, otp },
    { Authorization: "Bearer " + token }
  );
};

export const sendAccessLink = async (email: string) => {
  return await post<null>(BASE_URL + "/authenticate/link", { email });
};
