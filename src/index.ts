import LoginID from "@loginid/sdk";
import * as cognito from "./cognito";
import { elements, getValues } from "./elements";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";

import env from "./env";

//setup
const { LOGINID_BASE_URL, LOGINID_CLIENT_ID } = env;

const loginid = new LoginID(LOGINID_BASE_URL, LOGINID_CLIENT_ID);
const {
  accessTokenPre,
  authenticateBtn,
  registerBtn,
  idTokenPre,
  refreshTokenPre,
} = elements();

/*
 * Creates a FIDO2 credential on to the device.
 * Creates LoginID user.
 * Creates AWS Cognito user.
 */
registerBtn?.addEventListener("click", async () => {
  const { email, username } = getValues();

  try {
    //loginid signup
    const {
      credential,
      jwt,
      user: loginidUser,
    } = await loginid.registerWithFido2(username);

    //cognito signup
    const attributeList: CognitoUserAttribute[] = [];

    const dataEmail = new CognitoUserAttribute({ Name: "email", Value: email });
    const dataLoginIdUserId = new CognitoUserAttribute({
      Name: "custom:loginidUserId",
      Value: loginidUser.id,
    });
    const dataCredential = new CognitoUserAttribute({
      Name: "custom:credentialUUIDs",
      Value: credential!.uuid,
    });

    attributeList.push(dataEmail);
    attributeList.push(dataLoginIdUserId);
    attributeList.push(dataCredential);

    const validationList: CognitoUserAttribute[] = [];

    const dataJWT = new CognitoUserAttribute({ Name: "jwt", Value: jwt || "" });

    validationList.push(dataJWT);

    const { user: cognitoUser } = await cognito.userSignup(
      username,
      attributeList,
      validationList
    );

    //cognito email verification
    const code = prompt("Please enter confirmation code:") || "";

    await cognito.confirmationCode(cognitoUser, code);

    alert("User fully registered: " + cognitoUser.getUsername());
  } catch (e: any) {
    alert("There has been an error: " + e.message);
  }
});

authenticateBtn.addEventListener("click", async () => {
  const { username } = getValues();

  try {
    const result = await cognito.initiateAuthFIDO2(username);

    idTokenPre.innerText = JSON.stringify(result.getIdToken(), null, 2);
    accessTokenPre.innerText = JSON.stringify(result.getAccessToken(), null, 2);
    refreshTokenPre.innerText = JSON.stringify(
      result.getRefreshToken(),
      null,
      2
    );

    console.log(result);
  } catch (e: any) {
    alert("There has been an error: " + e.message);
  }
});
