import json
import re
import requests

from loginid import LoginIdManagement
from loginid.core import LoginIDError
from os import environ

BASE_URL = environ.get("LOGINID_BASE_URL") or ""
CLIENT_ID = environ.get("LOGINID_CLIENT_ID") or ""
PRIVATE_KEY = re.sub(
    r"\\n",
    r"\n",
    environ.get("PRIVATE_KEY") or ""
)

lid = LoginIdManagement(CLIENT_ID, PRIVATE_KEY, BASE_URL)


class NotFound(Exception):
    """
    Raises not found error
    """
    def __init__(self, message: str) -> None:
        self.message = message

    def __str__(self) -> str:
        if not self.message:
            return "Not found"
        return self.message


def lambda_handler(event: dict, _: dict) -> dict:
    print(event)
    request, response = event["request"], event["response"]
    metadata = request["clientMetadata"]
    authentication_type = metadata.get("authentication_type")

    # if authentication type is empty throw error
    if not authentication_type:
        raise NotFound("Authentication type not found")

    # pass for next round
    if authentication_type == "AUTH_PARAMS":
        response["answerCorrect"] = False
        return event

    try:
        if authentication_type == "FIDO2":
            username = event["userName"]

            # from private challenge
            private_challenge_params = request["privateChallengeParameters"]
            public_key = json.loads(private_challenge_params["public_key"])

            # answer
            challenge_answer = json.loads(request["challengeAnswer"])
            assertion = challenge_answer.get("assertion")

            # loginid verification
            loginid_res = {}

            if not assertion:
                raise NotFound("Assertion not found")

            assertion["challenge"] = public_key["challenge"]
            loginid_res = lid.authenticate_fido2_complete(username, assertion)

            print(loginid_res)

            if not loginid_res["is_authenticated"]:
                response["answerCorrect"] = False
                return event

            response["answerCorrect"] = True

            print(event)

        elif authentication_type == "PHONE_OTP":
            username = event["userName"]

            #from private challenge
            private_challenge_params = request["privateChallengeParameters"]
            credential_challenge_uuid = private_challenge_params["credential_uuid"]

            # answer
            otp = request["challengeAnswer"]

            # if request is successful, then opt is valid
            url = BASE_URL + "/api/native/authenticate/phone/complete"
            request_body = {
                "client_id": CLIENT_ID,
                "credential_uuid": credential_challenge_uuid,
                "username": username,
                "delivery_mode": "sms",
                "otp": otp,
            }
            token = lid.generate_service_token("auth.temporary")
            lid_response = loginid_raw_request(url, request_body, token)

            if not lid_response["is_authenticated"]:
                response["answerCorrect"] = False
                return event

            response["answerCorrect"] = True

        elif authentication_type == "MAGIC_LINK":
            username = event["userName"]

            # from private challenge
            # we don't need to do anything with this but a more custom implementation might
            # would have the otp here and may need to be decrypted
            private_challenge_params = request["privateChallengeParameters"]

            # answer
            code = request["challengeAnswer"]

            # loginid will verify code
            lid.authorize_code(code, "long", "add_credential", username=username)
            # we don't really need to use the code past this point so we can invoke it
            lid.invalidate_all_codes("long", "add_credential", username=username)

            response["answerCorrect"] = True

        return event
    except Exception as e:
        print(e)
        response["answerCorrect"] = False
        return event


def loginid_raw_request(url: str, request_body: dict, token = None):
    headers = {
    "Content-Type": "application/json",
    }

    if token != None:
        headers["Authorization"] = "Bearer " + token

    response = requests.post(url, headers=headers, data=json.dumps(request_body))

    # if status code is not 200, raise LoginIdError
    if response.status_code != 200:
        lid_response_body = json.loads(response.text)
        print(response.text)
        raise LoginIDError(
            response.status_code,
            lid_response_body["code"],
            lid_response_body["message"],
        )
    
    parsed_response = json.loads(response.text)
    return parsed_response
