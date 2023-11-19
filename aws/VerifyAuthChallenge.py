import json
import re
import requests

from loginid import LoginID
from loginid.utils import LoginIDError
from os import environ

BASE_URL = environ.get("LOGINID_BASE_URL") or ""
PRIVATE_KEY = re.sub(
    r"\\n",
    r"\n",
    environ.get("PRIVATE_KEY") or ""
)

lid = LoginID(BASE_URL, PRIVATE_KEY)

def lambda_handler(event: dict, _: dict) -> dict:
    print(event)
    request, response = event["request"], event["response"]

    try:
        username = event["userName"]
        # answer
        challenge_answer = json.loads(request["challengeAnswer"])
        assertion_response = challenge_answer.get("assertion_response")

        # loginid verification
        loginid_res = {}

        if not assertion_response:
            raise Exception("Assertion not found")

        #assertion_response["challenge"] = public_key["challenge"]
        loginid_res = lid.authenticate_fido2_complete(username, assertion_response)

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
