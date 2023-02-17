export const handler = async (event) => {
  console.log(event);
  const { request, response } = event;
  const credentialUUIDs = request.userAttributes["custom:credentialUUIDs"];

  response.privateChallengeParameters = { credentialUUIDs };
  response.publicChallengeParameters = {};

  return event;
};
