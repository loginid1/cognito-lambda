from flask import Blueprint, Response, jsonify
from http import HTTPStatus
from loginid import LoginIdManagement
from loginid.core import LoginIDError
from server.helpers.api import default_json
from server.helpers.encoding import random_password

import json
import boto3

from server.config import (
    COGNITO_ACCESS_KEY_ID,
    COGNITO_CLIENT_ID,
    COGNITO_REGION_NAME,
    COGNITO_SECRET_ACCESS_KEY,
    LOGINID_BASE_URL,
    LOGINID_CLIENT_ID,
    PRIVATE_KEY,
)


auth_blueprint = Blueprint("auth", __name__, url_prefix="/api/auth")
lid = LoginIdManagement(LOGINID_CLIENT_ID, PRIVATE_KEY, LOGINID_BASE_URL)
aws_cognito = boto3.client(
    "cognito-idp",
    region_name=COGNITO_REGION_NAME,
    aws_access_key_id=COGNITO_ACCESS_KEY_ID,
    aws_secret_access_key=COGNITO_SECRET_ACCESS_KEY,
)


@auth_blueprint.route("fido2/register/init", methods=["POST"])
def fido2_register_init():
    username, = default_json("username")

    try:
        # Cognito only has lowercase usernames
        username = str(username).lower()
        init_response = lid.register_fido2_init(username)
        attestation_payload = init_response["attestation_payload"]
        return attestation_payload, HTTPStatus.OK
    except LoginIDError as e:
        return jsonify(message=e.message), e.status_code
    except Exception as e:
        print(e)
        return jsonify(message="Request failed"), HTTPStatus.BAD_REQUEST


@auth_blueprint.route("fido2/register/complete", methods=["POST"])
def fido2_register_complete():
    username, email, attestation_payload = default_json("username", "email", "attestation_payload")
    try:
        # Cognito signup
        email_attribute = {
            "Name": "email",
            "Value": email,
        }

        # pass attestation payload to PreSignUp lambda
        validation_attestation_payload = {
            "Name": "attestation_payload",
            "Value": json.dumps(attestation_payload),
        }

        meta_data = {
            "register_type": "FIDO2"
        }

        response = aws_cognito.sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=username.lower(),
            Password=random_password(),
            UserAttributes=[email_attribute],
            ValidationData=[validation_attestation_payload],
            ClientMetadata=meta_data,
        )

        return response, HTTPStatus.OK
    except LoginIDError as e:
        return jsonify(message=e.message), e.status_code
    except Exception as e:
        print(e)
        return jsonify(message="Request failed"), HTTPStatus.BAD_REQUEST


@auth_blueprint.route("email/confirmation", methods=["POST"])
def confirm_email():
    username, otp = default_json("username", "otp")

    try:
        aws_cognito.confirm_sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=username,
            ConfirmationCode=otp
        )

        response = Response()
        response.status_code = HTTPStatus.NO_CONTENT

        return response
    except Exception as e:
        print(e)
        return jsonify(message="Email confirmation failed"), HTTPStatus.BAD_REQUEST


@auth_blueprint.route("password/register", methods=["POST"])
def register_password():
    username, email, password = default_json("username", "email", "password")

    try:
        # Cognito signup
        email_attribute = {
            "Name": "email",
            "Value": email,
        }

        meta_data = {
            "register_type": "PASSWORD"
        }

        response = aws_cognito.sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=username,
            Password=password,
            UserAttributes=[email_attribute],
            ClientMetadata=meta_data,
        )

        return response, HTTPStatus.OK
    except LoginIDError as e:
        return jsonify(message=e.message), e.status_code
    except Exception as e:
        print(e)
        return jsonify(message="Email confirmation failed"), HTTPStatus.BAD_REQUEST
