import { LoginIdManagement } from "@loginid/node-sdk";

const { LOGINID_BASE_URL, LOGINID_CLIENT_ID } = process.env;

//private key is not needed in this case
const loginid = new LoginIdManagement(LOGINID_CLIENT_ID, "", LOGINID_BASE_URL);

export const handler = async (event) => {
  console.log(event);

  const { triggerSource, username } = event;

  if (triggerSource === "PreSignUp_SignUp") {
    const { jwt } = event.request?.validationData;

    //might need to remove username
    const valid = await loginid.verifyToken(jwt, username);

    if (!valid) {
      return new Error("Verification failed");
    }
  }

  return event;
};
