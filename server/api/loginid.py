from flask import Blueprint, jsonify
from http import HTTPStatus
from loginid import LoginIdManagement
from server.helpers.api import default_json
from flask_jwt_extended import get_jwt_identity, jwt_required
import boto3

from server.config import (
    COGNITO_ACCESS_KEY_ID,
    COGNITO_REGION_NAME,
    COGNITO_SECRET_ACCESS_KEY,
    LOGINID_BASE_URL,
    LOGINID_CLIENT_ID,
    PRIVATE_KEY,
)


loginid_bluebrint = Blueprint("loginid", __name__, url_prefix="/api/loginid")
lid = LoginIdManagement(LOGINID_CLIENT_ID, PRIVATE_KEY, LOGINID_BASE_URL)
aws_cognito = boto3.client(
    "cognito-idp",
    region_name=COGNITO_REGION_NAME,
    aws_access_key_id=COGNITO_ACCESS_KEY_ID,
    aws_secret_access_key=COGNITO_SECRET_ACCESS_KEY,
)


@loginid_bluebrint.route("/token/generate", methods=["POST"])
def create_service_token():
    username, scope = default_json(
        "username",
        "scope"
    )

    service_token = lid.generate_service_token(scope, username)

    return jsonify(service_token=service_token)


@loginid_bluebrint.route("/token/verify", methods=["POST"])
def verify_jwt():
    jwt, username = default_json("jwt", "username")

    try:
        result = lid.verify_token(str(jwt), username)
        return jsonify(is_valid=result)
    except Exception as e:
        print(e)
        return jsonify(message="Verification failed"), HTTPStatus.BAD_REQUEST


'''
Will find 'custom:loginidUserId'. If the attribute exist
we know that this user has a fido2 credential. If not return None.
'''
def user_fido2_credential(access_token: str):
    user = aws_cognito.get_user(AccessToken=access_token)
    for attribute in user["UserAttributes"]:
        if "custom:loginidUserId" in attribute.values():
            return attribute["Value"]


# note getting user data from cognito may not be necessary if stored somewhere else
@loginid_bluebrint.route("fido2/create/init", methods=["POST"])
@jwt_required()
def fido2_create_init():
    data = get_jwt_identity()

    try:
        username = data["username"]
        access_token = data["access_token"]
        loginid_user_id = user_fido2_credential(access_token)

        # if loginidUserId is found as an attribute, the cognito user has a FIDO2 credential
        # we can initiate force add
        if loginid_user_id:
            init_response = lid.force_fido2_credential_init(loginid_user_id)
        else:
        # if not loginidUserId is not found, cognito user does not have a FIDO2 credential
        # we can pass fido2/register/init instead
            init_response = lid.register_fido2_init(username)

        attestation_payload = init_response["attestation_payload"]
        return attestation_payload, HTTPStatus.OK
    except Exception as e:
        print(e)
        return jsonify(message="Request failed"), HTTPStatus.BAD_REQUEST


@loginid_bluebrint.route("fido2/create/complete", methods=["POST"])
@jwt_required()
def fido2_create_complete():
    LOGINID_FIELD = "custom:loginidUserId"
    attestation_payload, = default_json("attestation_payload")
    data = get_jwt_identity()

    try:
        username = data["username"]
        access_token = data["access_token"]

        # if loginidUserId is found as an attribute, the cognito user has a FIDO2 credential
        # we can complete with credential/fido2/complete
        if user_fido2_credential(access_token):
            complete_response = lid.complete_add_fido2_credential(attestation_payload, username)
            return complete_response, HTTPStatus.OK
        else:
        # if not loginidUserId is not found, cognito user does not have a FIDO2 credential
        # we can complete with /fido2/register/complete
            complete_response = lid.register_fido2_complete(username, attestation_payload)

            # now we update cognito user attribute for loginidUserId
            loginid_user_id = complete_response["user"]["id"]
            loginid_user_id_attribute = {
                "Name": LOGINID_FIELD,
                "Value": loginid_user_id,
            }
            aws_cognito.update_user_attributes(
                UserAttributes=[loginid_user_id_attribute],
                AccessToken=access_token,
            )

        return complete_response, HTTPStatus.OK

    except Exception as e:
        print(e)
        return jsonify(message="Request failed"), HTTPStatus.BAD_REQUEST

