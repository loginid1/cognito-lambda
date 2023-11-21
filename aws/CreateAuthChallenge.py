import boto3
import json
import re
import requests

from loginid import LoginID
from loginid.utils import LoginIDError
from os import environ

LOGINID_BASE_URL = environ.get("LOGINID_BASE_URL") or ""
LOGINID_SECRET_NAME = environ.get("LOGINID_SECRET_NAME") or ""

secretsmanager = boto3.client("secretsmanager")


def lambda_handler(event: dict, _: dict) -> dict:
    print(event)
    lid = LoginID(LOGINID_BASE_URL, get_private_key())

    request = event["request"]
    response = event["response"]
    username = event["userName"]
    session = request.get("session")
    client_metadata = request.get("clientMetadata")

    # if session does not exist or if session length is 0 then create dummy challenge
    # to obtain authentication type
    if not session or len(session) == 0:
        response["challengeMetadata"] = "AUTH_PARAMS"
        response["privateChallengeParameters"] = {
            "challenge": "AUTH_PARAMS"
        }
        response["publicChallengeParameters"] = {
            "challenge": "AUTH_PARAMS"
        }

        return event

    if not client_metadata:
        raise Exception("ClientMetadata is required")

    init_res = None
    public_key = None

    # metadata will contain authentication type

    # sign in with FIDO2
    if client_metadata["authentication_type"] == "FIDO2_GET":
        init_res = lid.authenticate_fido2_init(username)
        public_key = json.dumps(init_res)

    # add FIDO2 credential to existing user
    elif client_metadata["authentication_type"] == "FIDO2_CREATE":
        try:
            init_res = lid.add_fido2_credential_init(username)
            public_key = json.dumps(init_res)
        except LoginIDError as e:
            if e.status == 404 and e.code == "unknown_user":
                lid.create_user_without_credential(username)
                init_res = lid.add_fido2_credential_init(username)
                public_key = json.dumps(init_res)
            else:
                print(e)
                raise e

    else:
        raise Exception("Authentication type not supported")

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
