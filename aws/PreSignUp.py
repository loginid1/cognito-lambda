import json
import re

from loginid import LoginID
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

        loginid_res = lid.register_fido2_complete(username, attestation_response)

        if not loginid_res["is_authenticated"]:
            raise Exception("Failed to register")

    print(event)
    return event
