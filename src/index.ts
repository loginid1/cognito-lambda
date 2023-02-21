import LoginID from "@loginid/sdk";
import * as cognito from "./cognito";
import { elements, getValues } from "./elements";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import { authUser, logoutUser } from "./user-api";
import { generateServiceToken, verifyJWT } from "./loginid-api";

import env from "./env";

//setup
const { LOGINID_BASE_URL, LOGINID_CLIENT_ID } = env;

const loginid = new LoginID(LOGINID_BASE_URL, LOGINID_CLIENT_ID);
const { form } = elements();

form?.addEventListener("submit", async (event) => {
  let { email, password, username } = getValues();
  const type = event.submitter?.dataset.type;

  //if username is empty it may mean that user is already authenticated
  //we can try to get the username from the token
  if (!username) {
  }

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

          const dataLoginIdUserId = new CognitoUserAttribute({
            Name: "custom:loginidUserId",
            Value: loginidUser.id,
          });
          attributeList.push(dataLoginIdUserId);
        }

        //cognito signup
        const { user: cognitoUser } = await cognito.userSignup(
          username,
          password,
          attributeList
        );

        //cognito email verification
        const code =
          prompt("Please enter confirmation code:", "ENTER HERE") || "";

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
        const result = await cognito.initiateFIDO2(username, password, flow);

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
  }
});
