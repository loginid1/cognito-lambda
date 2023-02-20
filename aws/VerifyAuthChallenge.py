import json

from loginid import LoginID
from os import environ

BASE_URL = environ.get("LOGINID_BASE_URL") or ""
PRIVATE_KEY = environ.get("LOGINID_PRIVATE_KEY") or ""
CLIENT_ID = environ.get("LOGINID_CLIENT_ID") or ""

lid = LoginID(CLIENT_ID, PRIVATE_KEY, BASE_URL)


def lambda_handler(event: dict, _: dict) -> dict:
    print(event)
    request, response = event["request"], event["response"]

    try:
        username = event["userName"]
        user_attributes = request["userAttributes"]
        credential_uuids = user_attributes.get("custom:credentialUUIDs", "")

        # from private challenge
        private_challenge_params = request["privateChallengeParameters"]
        public_key = json.loads(private_challenge_params["public_key"])

        # answer
        challenge_answer = json.loads(request["challengeAnswer"])
        assertion = challenge_answer["assertion"]

        assertion["challenge"] = public_key["challenge"]

        res = lid.authenticate_fido2_complete(username, assertion)
        print(res)

        if not res["is_authenticated"]:
            response["answerCorrect"] = False
            return event

        response["answerCorrect"] = True

        print(event)
        return event
    except Exception as e:
        print(e)
        response["answerCorrect"] = False
        return event

