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


def lambda_handler(event: dict, _: dict) -> dict:
    print(event)

    request = event["request"]
    response = event["response"]
    username = event["userName"]
    session = request.get("session")
    client_metadata = request.get("clientMetadata")

    # if session does not exist or if session length is 0
    if not session or len(session) == 0:
        # create dummy challenge
        response["challengeMetadata"] = "AUTH_PARAMS"
        response["privateChallengeParameters"] = {
            "challenge": "AUTH_PARAMS"
        }
        response["publicChallengeParameters"] = {
            "challenge": "AUTH_PARAMS"
        }

        return event

    # if clientMetadata does not exist throw error
    if not client_metadata:
        raise Exception("ClientMetadata is required")

    # if authentication from metadata is fido2 proceed
    if client_metadata["authentication_type"] == "FIDO2":
        init_res = {}
        public_key = {}

        init_res = lid.authenticate_fido2_init(username)
        public_key = json.dumps(init_res["assertion_payload"])

        # can probably remove this
        response["privateChallengeParameters"] = {
            "public_key": public_key
        }
        response["publicChallengeParameters"] = {
            "public_key": public_key,
        }
    elif client_metadata["authentication_type"] == "PHONE_OTP":
        credential_challenge_uuid = ""

        # if session length is 1, means we are in the first cycle and can send a challenge
        if len(session) == 1:
            # get credentials list from loginid
            creds = lid.get_credentials(status="active", username=username)
            creds = creds["credentials"]
            creds = list(filter(lambda x: x["type"] == "phone_otp", creds))

            # should only be one phone credential
            # loginid will check if user exists and if phone number is verified for the user
            url = BASE_URL + "/api/native/authenticate/phone/init"
            request_body = {
                "client_id": CLIENT_ID,
                "credential_uuid": creds[0]["uuid"],
                "username": username,
                "delivery_mode": "sms",
            }
            token = lid.generate_service_token("auth.temporary")
            lid_response = loginid_raw_request(url, request_body, token)
            credential_challenge_uuid = lid_response["credential_uuid"]
        else:
            # this block means that the user is retrying the challenge and we do nothing
            # because the challenge is already sent
            # getlast element of session
            prev_session = session[-1]
            credential_challenge_uuid = prev_session["challengeMetadata"]

        response["privateChallengeParameters"] = {
            "credential_uuid": credential_challenge_uuid,
        }
        response["publicChallengeParameters"] = {
            "type": "PHONE_OTP"
        }
        # add cred uuid to metadata to be availble in next round
        response["challengeMetadata"] = credential_challenge_uuid

    else:
        raise Exception("Authentication type not supported")


    print(event)
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
