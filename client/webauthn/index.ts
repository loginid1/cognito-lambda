import { base64ToBuffer, bufferToBase64 } from "../encodings/";

export type JSON = string;
export type Base64 = string;

export interface PublicKeyAttestationCredential {
  attestation_payload: {
    credential_uuid: string;
    challenge: string;
    credential_id: Base64;
    client_data: Base64;
    attestation_data: Base64;
  };
}

export interface PublicKeyAssertionCredential {
  assertion_payload: {
    credential_id: Base64;
    client_data: Base64;
    authenticator_data: Base64;
    signature: Base64;
  };
}

export const create = async (
  publicKey: any
): Promise<PublicKeyAttestationCredential> => {
  const { challenge } = publicKey;

  publicKey.challenge = base64ToBuffer(publicKey.challenge);
  publicKey.user.id = base64ToBuffer(publicKey.user.id);

  if (publicKey.excludeCredentials) {
    for (const credential of publicKey.excludeCredentials) {
      credential.id = base64ToBuffer(credential.id);
    }
  }

  const credential = (await navigator.credentials.create({
    publicKey,
  })) as PublicKeyCredential;

  if (!credential) {
    throw new Error("Failed to create credential");
  }

  const response = credential.response as AuthenticatorAttestationResponse;

  const attestation = {
    attestation_payload: {
      credential_uuid: publicKey.credential_uuid,
      challenge: challenge,
      credential_id: bufferToBase64(credential.rawId),
      client_data: bufferToBase64(response.clientDataJSON),
      attestation_data: bufferToBase64(response.attestationObject),
    },
  };

  return attestation;
};

export const get = async (
  publicKey: any
): Promise<PublicKeyAssertionCredential> => {
  publicKey.challenge = base64ToBuffer(publicKey.challenge);

  if (publicKey.allowCredentials) {
    for (const credential of publicKey.allowCredentials) {
      credential.id = base64ToBuffer(credential.id);
    }
  }

  const credential = (await navigator.credentials.get({
    publicKey,
  })) as PublicKeyCredential;

  if (!credential) {
    throw new Error("Failed to authenticate credential");
  }

  const response = credential.response as AuthenticatorAssertionResponse;

  const assertion = {
    assertion_payload: {
      credential_id: bufferToBase64(credential.rawId),
      client_data: bufferToBase64(response.clientDataJSON),
      authenticator_data: bufferToBase64(response.authenticatorData),
      signature: bufferToBase64(response.signature),
    },
  };

  return assertion;
};
