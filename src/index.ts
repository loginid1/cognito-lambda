import * as cognito from "./cognito";
import { base64ToBuffer, bufferToBase64 } from "./encoding";
import { elements, getValues } from "./elements";
import { authUser, logoutUser } from "./user-api";
import { fido2CreateInit, fido2CreateComplete } from "./loginid-api";
import {
  confirmEmail,
  fido2RegisterComplete,
  fido2RegisterInit,
  passwordRegister,
} from "./auth-api";

const { form } = elements();

form?.addEventListener("submit", async (event) => {
  let { email, password, username } = getValues();
  const type = event.submitter?.dataset.type;

  event.preventDefault();

  if (!type) {
    throw new Error("data-flow not found");
  }

  const [auth, flow] = type.split("_");

  //LOGOUT
  if (flow === "LOGOUT") {
    await logoutUser();
    window.location.replace("login.html");
  }

  switch (auth) {
    //REGISTRATION
    case "REG": {
      try {
        //minor password logic
        if (flow === "FIDO2") {
          password = "";
        } else if (flow === "PASSWORD") {
          if (password === "") {
            throw new Error("Password not entered");
          }
        }

        if (flow === "FIDO2") {
          const publicKey = await fido2RegisterInit(username);
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

          const response =
            credential.response as AuthenticatorAttestationResponse;

          const attestation = {
            credential_uuid: publicKey.credential_uuid,
            challenge: challenge,
            credential_id: bufferToBase64(credential.rawId),
            client_data: bufferToBase64(response.clientDataJSON),
            attestation_data: bufferToBase64(response.attestationObject),
          };

          await fido2RegisterComplete(username, email, attestation);
        } else {
          await passwordRegister(username, email, password);
        }

        //cognito email verification
        let code = "";
        while (code === "") {
          code = prompt("Please enter confirmation code:") || "";
        }

        await confirmEmail(username, code);

        alert("User fully registered: " + username);

        window.location.replace("login.html");
      } catch (e: any) {
        alert("There has been an error: " + e.message);
      }

      break;
    }

    //AUTHENTICATION
    case "AUTH": {
      try {
        const result = await cognito.authenticate(username, password, flow);

        if (!result.isValid()) {
          throw new Error("Invalid authentication");
        }

        const idToken = result.getIdToken().getJwtToken();
        const accessToken = result.getAccessToken().getJwtToken();

        await authUser(idToken, accessToken);
        window.location.replace("home.html");
      } catch (e: any) {
        alert("There has been an error: " + e.message);
      }

      break;
    }

    //ADDING FIDO2
    case "ADD": {
      try {
        const publicKey = await fido2CreateInit();
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

        const response =
          credential.response as AuthenticatorAttestationResponse;

        const attestation = {
          credential_uuid: publicKey.credential_uuid,
          challenge: challenge,
          credential_id: bufferToBase64(credential.rawId),
          client_data: bufferToBase64(response.clientDataJSON),
          attestation_data: bufferToBase64(response.attestationObject),
        };

        await fido2CreateComplete(attestation);

        alert("Sucessfully created FIDO2 credential!");
      } catch (e: any) {
        alert("There has been an error: " + e.message);
      }
    }
  }
});
