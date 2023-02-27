from flask import Blueprint, Response, jsonify
from http import HTTPStatus
from loginid import LoginIdManagement
from loginid.core import LoginIDError
from server.helpers.api import default_json
from flask_jwt_extended import get_jwt_identity, jwt_required
import boto3
from botocore import exceptions

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


@loginid_bluebrint.route("/users", methods=["POST"])
def create_user():
    username, = default_json("username")

    try:
        response = lid.add_user_without_credentials(str(username))
        return response, HTTPStatus.CREATED
    except LoginIDError as e:
        print(e)
        return jsonify(message=e.message), HTTPStatus.BAD_REQUEST
    except Exception as e:
        print(e)
        return jsonify(message="Request failed"), HTTPStatus.BAD_REQUEST


@loginid_bluebrint.route("/users", methods=["DELETE"])
def delete_user():
    username = default_json("username")

    try:
        aws_cognito.admin_get_user(Username=username)
        return jsonify(message="User found on cognito cannot delete user"), HTTPStatus.BAD_REQUEST
    except exceptions.ClientError as e:
        # if user is not found on cognito then it is safe to delete user on loginid
        if e.response["Error"]["Code"] == "UserNotFoundException":
            lid.delete_by_username(str(username))
            response = Response()
            response.status_code = HTTPStatus.NO_CONTENT
            return response
        raise e
    except Exception as e:
        print(e)
        return jsonify(message="Request failed"), HTTPStatus.BAD_REQUEST


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
        loginid_user_id = data["loginid_user_id"]
        init_response = lid.force_fido2_credential_init(loginid_user_id)
        attestation_payload = init_response["attestation_payload"]
        return attestation_payload, HTTPStatus.OK
    except Exception as e:
        print(e)
        return jsonify(message="Request failed"), HTTPStatus.BAD_REQUEST


@loginid_bluebrint.route("fido2/create/complete", methods=["POST"])
@jwt_required()
def fido2_create_complete():
    attestation_payload, = default_json("attestation_payload")
    data = get_jwt_identity()

    try:
        username = data["username"]
        complete_response = lid.complete_add_fido2_credential(attestation_payload, username)
        return complete_response, HTTPStatus.OK
    except Exception as e:
        print(e)
        return jsonify(message="Request failed"), HTTPStatus.BAD_REQUEST

