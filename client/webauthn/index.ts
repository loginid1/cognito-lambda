import { base64ToBuffer, bufferToBase64 } from "../encodings/";

export type JSON = string;
export type Base64 = string;

export interface PublicKeyAttestationCredential {
  attestation_response: {
    challenge: string;
    id: Base64;
    type: string;
    response: {
      attestationObject: Base64;
      clientDataJSON: Base64;
    };
  };
}

export interface PublicKeyAssertionCredential {
  assertion_response: {
    challenge: string;
    id: Base64;
    type: string;
    response: {
      clientDataJSON: Base64;
      authenticatorData: Base64;
      signature: Base64;
    };
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
    attestation_response: {
      challenge: challenge,
      id: bufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        attestationObject: bufferToBase64(response.attestationObject),
        clientDataJSON: bufferToBase64(response.clientDataJSON),
      },
    },
  };

  return attestation;
};

export const get = async (
  publicKey: any
): Promise<PublicKeyAssertionCredential> => {
  const challenge = publicKey.challenge;
  publicKey.challenge = base64ToBuffer(challenge);

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
    assertion_response: {
      challenge: challenge,
      id: bufferToBase64(credential.rawId),
      type: credential.type,
      response: {
        clientDataJSON: bufferToBase64(response.clientDataJSON),
        signature: bufferToBase64(response.signature),
        authenticatorData: bufferToBase64(response.authenticatorData),
        //userHandle: bufferToBase64(response.userHandle),
      },
    },
  };

  return assertion;
};
