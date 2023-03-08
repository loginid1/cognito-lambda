import { post } from "./fetch";

const BASE_URL = "/api/auth";

export const fido2RegisterInit = async (username: string) => {
  const attestationOptions = await post<any>(
    BASE_URL + "/fido2/register/init",
    { username }
  );
  return attestationOptions;
};

export const fido2RegisterComplete = async (
  username: string,
  email: string,
  attestationPayload: any
) => {
  const attestationOptions = await post<any>(
    BASE_URL + "/fido2/register/complete",
    { username, email, attestation_payload: attestationPayload }
  );
  return attestationOptions;
};

export const confirmEmail = async (username: string, otp: string) => {
  await post<null>(BASE_URL + "/email/confirmation", { username, otp });
};

export const passwordRegister = async (
  username: string,
  email: string,
  password: string
) => {
  const response = post<any>(BASE_URL + "/password/register", {
    username,
    email,
    password,
  });
  return response;
};
