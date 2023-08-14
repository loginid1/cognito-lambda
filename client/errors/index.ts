export interface ErrorExtended extends Error {
  msg: string;
}

export const EMPTY_PASSKEY_NAME = "Passkey name cannot be empty";

export const commonError = (error: ErrorExtended) => {
  return "Error: " + (error.message || error.msg);
};
