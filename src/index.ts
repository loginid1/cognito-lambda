import LoginID from "@loginid/sdk";
import * as cognito from "./cognito";
import { elements, getValues } from "./elements";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { clearToken, getTokenParsed, storeToken, validToken } from "./auth";

import env from "./env";

//setup
const { LOGINID_BASE_URL, LOGINID_CLIENT_ID } = env;

const loginid = new LoginID(LOGINID_BASE_URL, LOGINID_CLIENT_ID);
const { form, header } = elements();

//token authentication stuff
window.addEventListener("DOMContentLoaded", () => {
  const { pathname } = window.location;
  const isTokenValid = validToken();

  if (
    (pathname.startsWith("/register") || pathname.startsWith("/login")) &&
    isTokenValid
  ) {
    window.location.replace("home.html");
  } else if (pathname.startsWith("/home") && !isTokenValid) {
    window.location.replace("login.html");
  }

  if (!validToken()) return;
  const token = getTokenParsed();
  header.textContent += token.payload["cognito:username"];
});

form?.addEventListener("submit", async (event) => {
  let { email, password, username } = getValues();
  const type = event.submitter?.dataset.type;

  //if username is empty it may mean that user is already authenticated
  //we can try to get the username from the token
  if (!username) {
    const token = getTokenParsed();
    username = token.payload["cognito:username"];
  }

  event.preventDefault();

  if (!type) {
    throw new Error("data-flow not found");
  }

  const [auth, flow] = type.split("_");

  //LOGOUT
  if (flow === "LOGOUT") {
    clearToken();
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

        if (flow === "FIDO2") {
          //loginid signup
          const {
            credential,
            jwt,
            user: loginidUser,
          } = await loginid.registerWithFido2(username);

          const dataLoginIdUserId = new CognitoUserAttribute({
            Name: "custom:loginidUserId",
            Value: loginidUser.id,
          });
          const dataCredential = new CognitoUserAttribute({
            Name: "custom:credentialUUIDs",
            Value: credential!.uuid,
          });
          attributeList.push(dataLoginIdUserId);
          attributeList.push(dataCredential);

          //TODO:validate jwt with local server
        }

        //cognito signup
        const { user: cognitoUser } = await cognito.userSignup(
          username,
          password,
          attributeList
        );

        //cognito email verification
        const code = prompt("Please enter confirmation code:") || "";

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
        const result = await cognito.initiateAuthFIDO2(
          username,
          password,
          flow
        );

        if (!result.isValid()) {
          throw new Error("Invalid authentication");
        }

        storeToken(result.getIdToken());
        window.location.replace("home.html");
      } catch (e: any) {
        alert("There has been an error: " + e.message);
      }

      break;
    }
  }
});
