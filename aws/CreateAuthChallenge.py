import json

from loginid import LoginID
from os import environ

BASE_URL = environ.get("LOGINID_BASE_URL") or ""
PRIVATE_KEY = environ.get("LOGINID_PRIVATE_KEY") or ""
CLIENT_ID = environ.get("LOGINID_CLIENT_ID") or ""

lid = LoginID(CLIENT_ID, PRIVATE_KEY, BASE_URL)


def lambda_handler(event: dict, _: dict) -> dict:
    print(event)

    response = event["response"]
    username = event["userName"]

    init_res = lid.authenticate_fido2_init(username)
    public_key = json.dumps(init_res["assertion_payload"])

    # can probably remove this
    response["privateChallengeParameters"] = {
        "public_key": public_key
    }
    response["publicChallengeParameters"] = {
        "public_key": public_key,
    }

    print(event)
    return event
