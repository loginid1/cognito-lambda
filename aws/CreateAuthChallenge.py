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

    response = event["response"]
    username = event["userName"]

    init_res = lid.authenticate_fido2_init(username)
    public_key = json.dumps(init_res)

    # can probably remove this
    response["privateChallengeParameters"] = {
        "public_key": public_key
    }
    response["publicChallengeParameters"] = {
        "public_key": public_key,
    }

    print(event)
    return event
