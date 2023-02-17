export const handler = async (event) => {
  console.log(event);
  const { request, response } = event;

  if (request.userNotFound) {
    response.issueToken = false;
    response.failAuthentication = true;
    throw new Error("User does not exist");
  }

  const { session } = request;

  //support only FIDO2 for now

  //start FIDO2 challenge
  if (session && session.length === 0) {
    response.issueTokens = false;
    response.failAuthentication = false;
    response.challengeName = "CUSTOM_CHALLENGE";
  }

  if (session && session.length) {
    const { challengeName, challengeResult } = session.slice(-1)[0];

    //check if FIDO2 challenge succeeded
    if (challengeName === "CUSTOM_CHALLENGE" && challengeResult) {
      event.response.issueTokens = true;
      event.response.failAuthentication = false;
    }
  }

  console.log(event);
  return event;
};
