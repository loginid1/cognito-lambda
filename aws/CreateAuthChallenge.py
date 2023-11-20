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
    lid = LoginID(LOGINID_BASE_URL, get_private_key())

    response = event["response"]
    username = event["userName"]

    try:
        init_res = lid.authenticate_fido2_init(username)
    except Exception as e:
        print(e)
        raise e

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


def get_private_key() -> str:
    secret = secretsmanager.get_secret_value(SecretId=LOGINID_SECRET_NAME)
    private_key = secret["SecretString"]
    private_key = re.sub(
        r"\\n",
        r"\n",
        private_key,
    )
    return private_key
