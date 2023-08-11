from flask import Blueprint, Response, jsonify, g
from http import HTTPStatus
from flask_jwt_extended import set_access_cookies
from loginid import LoginIdManagement
from loginid.core import LoginIDError
from server.external.cognito import Cognito
from server.helpers.api import create_session_token, default_json
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

cognito = Cognito()

def authentication_payload(username: str) -> dict:
    json_payload = {
        "username": username,
    }
    return json_payload


auth_blueprint = Blueprint("auth", __name__, url_prefix="/api/auth")
lid = LoginIdManagement(LOGINID_CLIENT_ID, PRIVATE_KEY, LOGINID_BASE_URL)
aws_cognito = boto3.client(
    "cognito-idp",
    region_name=COGNITO_REGION_NAME,
    aws_access_key_id=COGNITO_ACCESS_KEY_ID,
    aws_secret_access_key=COGNITO_SECRET_ACCESS_KEY,
)


@auth_blueprint.after_request
def verify_and_add_cookie(res: Response) -> Response:
    if not g.get("aws_response"):
        return res

    try:
        aws_response = g.get("aws_response")
        authentication_result = aws_response["AuthenticationResult"]
        id_token = authentication_result["IdToken"]
        access_token = authentication_result["AccessToken"]

        try:
            jwt_payload = cognito.decode_cognito_jwt(id_token)
        except Exception as e:
            print(e)
            res.status_code = HTTPStatus.UNAUTHORIZED
            res.data = json.dumps({"error": "Unauthorized"})
            return res

        session_token = create_session_token(jwt_payload, access_token)
        set_access_cookies(res, session_token)

    except Exception as e:
        print(e)
        res.status_code = HTTPStatus.INTERNAL_SERVER_ERROR
        res.data = json.dumps({"error": "Internal Server Error"})

    return res


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
            Username=username.lower(),
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


@auth_blueprint.route("password/authenticate", methods=["POST"])
def authenticate_password():
    username, password = default_json("username", "password")
    try:
        # login with password
        aws_response = aws_cognito.initiate_auth(
            ClientId=COGNITO_CLIENT_ID,
            AuthFlow="USER_PASSWORD_AUTH",
            AuthParameters={
                "USERNAME": username,
                "PASSWORD": password,
            },
        )

        # check if authentication result is found in response
        if "AuthenticationResult" not in aws_response:
            return jsonify(message="Could not login under username. Account may need confirmation"), HTTPStatus.BAD_REQUEST

        # set aws_response to g object
        g.aws_response = aws_response

        return authentication_payload(username), HTTPStatus.OK
    except aws_cognito.exceptions.NotAuthorizedException:
        return jsonify(message="Authentication failed - Invalid username or password"), HTTPStatus.UNAUTHORIZED
    except aws_cognito.exceptions.UserNotFoundException:
        return jsonify(message="Authentication failed - User not found"), HTTPStatus.UNAUTHORIZED
    except Exception as e:
        print(e)
        return jsonify(message="Authentication failed"), HTTPStatus.BAD_REQUEST
