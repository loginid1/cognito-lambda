import json
import re

from loginid import LoginIdManagement
from os import environ

BASE_URL = environ.get("LOGINID_BASE_URL") or ""
CLIENT_ID = environ.get("LOGINID_CLIENT_ID") or ""
PRIVATE_KEY = re.sub(
    r"\\n",
    r"\n",
    environ.get("PRIVATE_KEY") or ""
)

lid = LoginIdManagement(CLIENT_ID, PRIVATE_KEY, BASE_URL)

class CustomError(Exception):
    """
    Raises not found error
    """
    def __init__(self, message: str) -> None:
        self.message = message

    def __str__(self) -> str:
        if not self.message:
            return "Not found"
        return self.message


def lambda_handler(event: dict, _: dict) -> dict:
    print(event)

    request = event["request"]
    username = event["userName"]

    if "clientMetadata" not in request:
        return event

    meta_data = request["clientMetadata"]

    if not meta_data.get("register_type"):
        raise CustomError("Register type not found")

    register_type = meta_data["register_type"]

    # Register LoginID user without credentials
    if register_type == "PASSWORD":
        lid.add_user_without_credentials(username)
        return event

    if register_type == "FIDO2":
        validation_data = request["validationData"]

        if not validation_data.get("attestation_payload"):
            raise CustomError("Attestation not found")

        attestation_payload = json.loads(validation_data["attestation_payload"])
        credential_name = meta_data.get("credential_name", "")

        loginid_res = lid.register_fido2_complete(username, attestation_payload, credential_name)

        print(loginid_res)

        if not loginid_res["is_authenticated"]:
            raise CustomError("Failed to register")

        print(event)
        return event

    raise CustomError("Register type not supported")
