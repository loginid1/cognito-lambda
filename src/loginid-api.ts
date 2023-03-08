import { post } from "./fetch";

const BASE_URL = "/api/loginid";

export const fido2CreateInit = async () => {
  const attestationOptions = await post<any>(
    BASE_URL + "/fido2/create/init",
    {},
    { includeCSRF: true }
  );
  return attestationOptions;
};

export const fido2CreateComplete = async (attestationPayload: any) => {
  const attestationComplete = await post<any>(
    BASE_URL + "/fido2/create/complete",
    { attestation_payload: attestationPayload },
    { includeCSRF: true }
  );
  return attestationComplete;
};
