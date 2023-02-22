import json
import re

from loginid import LoginID
from os import environ

BASE_URL = environ.get("LOGINID_BASE_URL") or ""
CLIENT_ID = environ.get("LOGINID_CLIENT_ID") or ""
PRIVATE_KEY = re.sub(
    r"\\n",
    r"\n",
    environ.get("PRIVATE_KEY") or ""
)

lid = LoginID(CLIENT_ID, PRIVATE_KEY, BASE_URL)


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
        return event
    except Exception as e:
        print(e)
        response["answerCorrect"] = False
        return event

