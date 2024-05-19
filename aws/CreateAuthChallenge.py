import boto3
import json

from loginid import LoginID
from os import environ

LOGINID_BASE_URL = environ.get("LOGINID_BASE_URL") or ""
LOGINID_SECRET_NAME = environ.get("LOGINID_SECRET_NAME") or ""

secretsmanager = boto3.client("secretsmanager")


def lambda_handler(event: dict, _: dict) -> dict:
    print(event)
    lid = LoginID(LOGINID_BASE_URL, get_key_id())

    request = event["request"]
    response = event["response"]
    username = event["userName"]
    session = request.get("session")
    client_metadata = request.get("clientMetadata")

    # if session does not exist or if session length is 0 then create dummy challenge
    # to obtain authentication type
    if not session:
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
        options = client_metadata.get("options", "{}")
        options = json.loads(options)
        init_res = lid.authenticate_with_passkey_init(username, options)
        public_key = json.dumps(init_res)

    # add FIDO2 credential to existing user
    elif client_metadata["authentication_type"] == "FIDO2_CREATE":
        options = client_metadata.get("options", "{}")
        options = json.loads(options)
        init_res = lid.register_with_passkey_init(username, options)
        public_key = json.dumps(init_res)

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


def get_key_id() -> str:
    secret = secretsmanager.get_secret_value(SecretId=LOGINID_SECRET_NAME)
    key_id = secret["SecretString"]
    return key_id
