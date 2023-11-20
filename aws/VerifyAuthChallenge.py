import boto3
import json
import re
import requests

from loginid import LoginID
from os import environ


LOGINID_BASE_URL = environ.get("LOGINID_BASE_URL") or ""
LOGINID_SECRET_NAME = environ.get("LOGINID_SECRET_NAME") or ""

secretsmanager = boto3.client("secretsmanager")


def lambda_handler(event: dict, _: dict) -> dict:
    print(event)
    request, response = event["request"], event["response"]

    lid = LoginID(LOGINID_BASE_URL, get_private_key())

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


def get_private_key() -> str:
    secret = secretsmanager.get_secret_value(SecretId=LOGINID_SECRET_NAME)
    private_key = secret["SecretString"]
    private_key = re.sub(
        r"\\n",
        r"\n",
        private_key,
    )
    return private_key
