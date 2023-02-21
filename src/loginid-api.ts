import { post } from "./fetch";

type Scope = "auth.register";

interface ServiceTokenResponse {
  service_token: string;
}

interface VerifyJWTResponse {
  is_valid: boolean;
}

const BASE_URL = "/api/loginid";

export const generateServiceToken = async (username: string, scope: Scope) => {
  const { service_token } = await post<ServiceTokenResponse>(
    BASE_URL + "/token/generate",
    { username, scope }
  );
  return service_token;
};

export const verifyJWT = async (username: string, jwt: string) => {
  const { is_valid } = await post<VerifyJWTResponse>(
    BASE_URL + "/token/verify",
    { username, jwt }
  );
  return is_valid;
};

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