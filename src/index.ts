import LoginID from "@loginid/sdk";
import * as cognito from "./cognito";
import { base64ToBuffer, bufferToBase64 } from "./encoding";
import { elements, getValues } from "./elements";
import { authUser, logoutUser } from "./user-api";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import {
  createUser,
  deleteUser,
  fido2CreateInit,
  fido2CreateComplete,
  generateServiceToken,
  verifyJWT,
} from "./loginid-api";

import env from "./env";

//setup
const { LOGINID_BASE_URL, LOGINID_CLIENT_ID } = env;

const loginid = new LoginID(LOGINID_BASE_URL, LOGINID_CLIENT_ID);
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
        const attributeList: CognitoUserAttribute[] = [];

        const dataEmail = new CognitoUserAttribute({
          Name: "email",
          Value: email,
        });
        attributeList.push(dataEmail);

        //minor password logic
        if (flow === "FIDO2") {
          password = "";
        } else if (flow === "PASSWORD") {
          if (password === "") {
            throw new Error("Password not entered");
          }
        }

        let loginidUserId = "";
        if (flow === "FIDO2") {
          //loginid signup
          const serviceToken = await generateServiceToken(
            username,
            "auth.register"
          );

          const { jwt, user: loginidUser } = await loginid.registerWithFido2(
            username,
            { authorization_token: serviceToken }
          );

          const jwtValid = await verifyJWT(username, jwt || "");

          if (!jwtValid) {
            throw new Error("LoginID JWT verification failed");
          }

          loginidUserId = loginidUser.id;
          // need to create a user with no credential on LoginID if password flow
        } else {
          const { id } = await createUser(username);

          loginidUserId = id;
        }

        const dataLoginIdUserId = new CognitoUserAttribute({
          Name: "custom:loginidUserId",
          Value: loginidUserId,
        });
        attributeList.push(dataLoginIdUserId);

        //cognito signup
        const { user: cognitoUser } = await cognito.userSignup(
          username,
          password,
          attributeList
        );

        //cognito email verification
        let code = "";
        while (code === "") {
          code = prompt("Please enter confirmation code:") || "";
        }

        await cognito.confirmationCode(cognitoUser, code);

        alert("User fully registered: " + cognitoUser.getUsername());

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
