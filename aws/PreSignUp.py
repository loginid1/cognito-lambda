import boto3
import json
import re

from loginid import LoginID
from os import environ

LOGINID_BASE_URL = environ.get("LOGINID_BASE_URL") or ""
LOGINID_SECRET_NAME = environ.get("LOGINID_SECRET_NAME") or ""

secretsmanager = boto3.client("secretsmanager")


def lambda_handler(event: dict, _: dict) -> dict:
    print(event)

    lid = LoginID(LOGINID_BASE_URL, get_private_key())

    request = event["request"]
    username = event["userName"]

    if "clientMetadata" not in request:
        return event

    meta_data = request["clientMetadata"]

    if not meta_data.get("register_type"):
        raise Exception("Register type not found")

    register_type = meta_data["register_type"]

    if register_type == "FIDO2":
        print("At FIDO2")
        validation_data = request["validationData"]

        if not validation_data.get("attestation_response"):
            raise Exception("Attestation not found")

        attestation_response = json.loads(validation_data["attestation_response"])
        #credential_name = meta_data.get("credential_name", "")

        try: 
            loginid_res = lid.register_fido2_complete(username, attestation_response)
        except Exception as e:
            print(e)
            raise Exception("Failed to register")

        if not loginid_res["is_authenticated"]:
            raise Exception("Failed to register")

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
