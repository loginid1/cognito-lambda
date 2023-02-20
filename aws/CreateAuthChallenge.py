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
    username = event["userName"]
    user_attributes = request["userAttributes"]
    loginid_user_id = user_attributes.get("custom:loginidUserId", "")

    init_res = {}
    public_key = {}

    if not loginid_user_id:
        init_res = lid.register_fido2_init(username)
        public_key = json.dumps(init_res["attestation_payload"])
    else:
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
