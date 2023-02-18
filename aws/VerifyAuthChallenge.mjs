import { LoginIdManagement } from "@loginid/node-sdk";

const { LOGINID_BASE_URL, LOGINID_CLIENT_ID } = process.env;

//private key is not needed in this case
const loginid = new LoginIdManagement(LOGINID_CLIENT_ID, "", LOGINID_BASE_URL);

export const handler = async (event) => {
  console.log(event);
  const { request, response } = event;
  const { credentialUUIDs } = request.privateChallengeParameters;

  try {
    const { credentialUUID } = JSON.parse(request.challengeAnswer);

    if (!credentialUUIDs.split(",").includes(credentialUUID)) {
      response.answerCorrect = false;
      return event;
    }

    response.answerCorrect = true;
    return event;
  } catch (e) {
    console.log(e);
    response.answerCorrect = false;
    return event;
  }
};
