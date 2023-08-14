import { get, postWithCRSF } from "./fetch";

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

export interface CredentialData {
  credential: Credential;
}

export const credentialList = async (type = "fido2") => {
  const response = get<CredentialsData>(
    BASE_URL + "/credentials/list?status=active&type=" + type
  );
  return response;
};

export const renameCredential = async (
  credentialUUID: string,
  name: string
) => {
  const response = postWithCRSF<CredentialData>(
    BASE_URL + "/credentials/rename",
    { credential_uuid: credentialUUID, name: name }
  );
  return response;
};

export const revokeCredential = async (credentialUUID: string) => {
  const response = postWithCRSF<CredentialData>(
    BASE_URL + "/credentials/revoke",
    { credential_uuid: credentialUUID }
  );
  return response;
};

export const fido2CreateInit = async () => {
  return await postWithCRSF<any>(BASE_URL + "/fido2/create/init", null);
};

export const fido2CreateComplete = async (body: any) => {
  return await postWithCRSF<CredentialData>(
    BASE_URL + "/fido2/create/complete",
    body
  );
};
