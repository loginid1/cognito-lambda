import json
import boto3

from loginid import LoginID
from os import environ

BASE_URL = environ.get("LOGINID_BASE_URL") or ""
PRIVATE_KEY = environ.get("LOGINID_PRIVATE_KEY") or ""
CLIENT_ID = environ.get("LOGINID_CLIENT_ID") or ""

lid = LoginID(CLIENT_ID, PRIVATE_KEY, BASE_URL)

aws = client = boto3.client("cognito-idp")


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

    try:
        username = event["userName"]

        # from private challenge
        private_challenge_params = request["privateChallengeParameters"]
        public_key = json.loads(private_challenge_params["public_key"])

        # answer
        challenge_answer = json.loads(request["challengeAnswer"])
        attestation = challenge_answer.get("attestation")
        assertion = challenge_answer.get("assertion")

        # loginid verification
        loginid_res = {}

        if attestation:
            attestation["credential_uuid"] = public_key["credential_uuid"]
            attestation["challenge"] = public_key["challenge"]
            loginid_res = lid.register_fido2_complete(username, attestation)
        elif assertion:
            assertion["challenge"] = public_key["challenge"]
            loginid_res = lid.authenticate_fido2_complete(username, assertion)
        else:
            raise NotFound("Attestation or assertion not found")

        print(loginid_res)

        if not loginid_res["is_authenticated"]:
            response["answerCorrect"] = False
            return event

        # if everything is okay with loginid we add new user attributes
        # if fido2 credential was added
        if attestation:
            user_pool_id = event["userPoolId"]
            loginid_user_id = loginid_res["user"]["id"]
            loginid_user_id_attribute = {
                "Name": "custom:loginidUserId",
                "Value": loginid_user_id
            }

            # will throw exception if failed
            aws.admin_update_user_attributes(
                UserPoolId=user_pool_id,
                Username=username,
                UserAttributes=[loginid_user_id_attribute]
            )

        response["answerCorrect"] = True

        print(event)
        return event
    except Exception as e:
        print(e)
        response["answerCorrect"] = False
        return event

