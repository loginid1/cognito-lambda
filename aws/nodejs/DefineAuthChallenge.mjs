/**
 * Copyright 2024 LoginID
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export const handler = async (event) => {
  console.log(event);

  const { request, response } = event;

  // check if user is not found
  if (request.userNotFound) {
    response.issueToken = false;
    response.failAuthentication = true;
    throw new Error("User not found");
  }

  const { session = [] } = request;

  // custom challenge
  if (!session.length) {
    response.issueTokens = false;
    response.failAuthentication = false;
    response.challengeName = "CUSTOM_CHALLENGE";
  }

  // if sessions exist
  if (session.length) {
    // metadata will be used to determine the type of authentication
    const { clientMetadata } = request;
    if (!clientMetadata) {
      throw new Error("Client metadata not found");
    }

    const { authentication_type: authenticationType } = clientMetadata;
    const sessionObj = session[session.length - 1];
    const { challengeMetadata, challengeName, challengeResult } = sessionObj;

    // will be used as the first round of authentication to get provided authentication type
    if (challengeMetadata === "AUTH_PARAMS") {
      // renew challenge
      response.issueTokens = false;
      response.failAuthentication = false;
      response.challengeName = "CUSTOM_CHALLENGE";
      return event;
    }

    if (authenticationType === "EMAIL_OTP") {
      // can retry 3 times before failing
      if (session.length <= 4) {
        if (challengeName === "CUSTOM_CHALLENGE" && challengeResult) {
          response.issueTokens = true;
          response.failAuthentication = false;
        } else {
          response.issueTokens = false;
          response.failAuthentication = false;
          response.challengeName = "CUSTOM_CHALLENGE";
        }
      } else {
        response.issueTokens = false;
        response.failAuthentication = true;
      }
    }

    const validTypes = ["FIDO2_CREATE", "FIDO2_GET", "JWT_ACCESS"];

    if (validTypes.includes(authenticationType)) {
      // check if FIDO2 challenge succeeded
      if (challengeName === "CUSTOM_CHALLENGE" && challengeResult) {
        response.issueTokens = true;
        response.failAuthentication = false;
      }
    }

    return event;
  }

  console.log(event);
  return event;
};
