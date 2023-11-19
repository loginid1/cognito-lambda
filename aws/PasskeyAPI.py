import boto3
import json
import re
import random
import string
import secrets
import requests

from botocore.exceptions import ClientError
from os import environ
from loginid import LoginID
from loginid.utils import LoginIDError


BASE_URL = environ.get("LOGINID_BASE_URL") or ""
CLIENT_ID = environ.get("LOGINID_CLIENT_ID") or ""
PRIVATE_KEY = re.sub(
    r"\\n",
    r"\n",
    environ.get("PRIVATE_KEY") or ""
)
COGNITO_REGION_NAME = environ.get("COGNITO_REGION_NAME") or ""
COGNITO_CLIENT_ID = environ.get("COGNITO_CLIENT_ID") or ""
COGNITO_USER_POOL_ID = environ.get("COGNITO_USER_POOL_ID") or ""
SES_SENDER_EMAIL = environ.get("SES_SENDER_EMAIL") or ""

lid = LoginID(BASE_URL, PRIVATE_KEY)
aws_cognito = boto3.client(
    "cognito-idp",
    region_name=COGNITO_REGION_NAME,
)
ses_client = boto3.client("ses", region_name=COGNITO_REGION_NAME)

# paths
FIDO2_REGISTER_INIT_PATH = "/fido2/register/init"
FIDO2_REGISTER_COMPLETE_PATH = "/fido2/register/complete"
FIDO2_CREATE_INIT_PATH = "/fido2/create/init"
FIDO2_CREATE_COMPLETE_PATH = "/fido2/create/complete"

CREDENTIALS_LIST_PATH = "/credentials/list"
CREDENTIALS_RENAME_PATH = "/credentials/rename"
CREDENTIALS_REVOKE_PATH = "/credentials/revoke"


def lambda_handler(event: dict, _: dict) -> dict:
    print(event)

    headers = {
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    }
    path = event.get("path")
    body = event.get("body") or "{}"

    try:
        claims = {}
        paths = [
            FIDO2_REGISTER_INIT_PATH,
            FIDO2_REGISTER_COMPLETE_PATH,
        ]

        if path not in paths:
            request_context = event.get("requestContext")
            if request_context is None:
                raise Exception("requestContext is missing")
            authorizer = request_context.get("authorizer") or {}
            claims = authorizer.get("claims")
            if claims is None:
                response = {
                    "statusCode": 401,
                    "headers": headers,
                    "body": json.dumps({"message": "Unauthorized"}),
                }
                return response

        if path == FIDO2_REGISTER_INIT_PATH:
            # get username from request body
            username, = parse_json(body, "username")
            # lower case username or make it empty string
            username = username.lower() if username else ""

            attestation_payload = lid.register_fido2_init(username)

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(attestation_payload)
            }
            return response

        elif path == FIDO2_REGISTER_COMPLETE_PATH:
            username, email, credential_name, attestation_response = parse_json(
                body, 
                "username", 
                "email", 
                "credential_name",
                "attestation_response"
            )
            # lower case username
            username = username.lower() if username else ""

            # Cognito signup
            email_attribute = {
                "Name": "email",
                "Value": email,
            }

            # pass attestation payload to PreSignUp lambda
            validation_attestation_payload = {
                "Name": "attestation_response",
                "Value": json.dumps(attestation_response),
            }

            meta_data = {
                "register_type": "FIDO2",
                "credential_name": credential_name,
            }

            aws_cognito.sign_up(
                ClientId=COGNITO_CLIENT_ID,
                Username=username,
                Password=random_password(),
                UserAttributes=[email_attribute],
                ValidationData=[validation_attestation_payload],
                ClientMetadata=meta_data,
            )

            # get user info on LoginID
            loginid_user = lid.post("/backend-api/users/username", { "username": username })

            # update custom:loginid_user_id attribute
            aws_cognito.admin_update_user_attributes(
                UserPoolId=COGNITO_USER_POOL_ID,
                Username=username,
                UserAttributes=[
                    {
                        "Name": "custom:loginid_user_id",
                        "Value": loginid_user["user_uuid"],
                    },
                ],
            )

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({"username": username})
            }
            return response

        elif path == FIDO2_CREATE_INIT_PATH:
            username = claims["cognito:username"]

            loginid_user = {}
            try:
                loginid_user = lid.post("/backend-api/users/username", { "username": username })
            except LoginIDError as e:
                print(e)
                # check if user not found
                if e.status == 404 and e.code == "unknown_user":
                    response = lid.create_user_without_credential(username)
                    user = response["user"]

                    # update custom:loginid_user_id attribute
                    aws_cognito.admin_update_user_attributes(
                        UserPoolId=COGNITO_USER_POOL_ID,
                        Username=username,
                        UserAttributes=[
                            {
                                "Name": "custom:loginid_user_id",
                                "Value": user["user_uuid"],
                            },
                        ],
                    )
                else:
                    raise e

            attestation_payload = lid.add_fido2_credential_init(username)

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(attestation_payload)
            }
            return response

        elif path == FIDO2_CREATE_COMPLETE_PATH:
            username = claims["cognito:username"]
            attestation_response, credential_name = parse_json(
                body,
                "attestation_response",
                "credential_name"
            )

            lid_response = lid.add_fido2_credential_complete(
                username,
                attestation_response,
                #credential_name
            )

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(process_loginid_credential_response(lid_response))
            }
            return response

        elif path == CREDENTIALS_LIST_PATH:
            username = claims["cognito:username"]
            loginid_user_id = claims.get("custom:loginid_user_id")

            if loginid_user_id is None:
                try:
                    loginid_user = lid.post("/backend-api/users/username", { "username": username })
                    loginid_user_id = loginid_user["user_uuid"]
                except LoginIDError as e:
                    if e.status == 404:
                        response = {
                            "statusCode": 200,
                            "headers": headers,
                            "body": json.dumps(filter_credentials([], ""))
                        }
                        return response
                    else:
                        raise e

            type = event["queryStringParameters"].get("type", "fido2")
            # status = event["queryStringParameters"].get("status", "active")

            lid_response = lid.get_user_credentials(loginid_user_id)

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(filter_credentials(lid_response, type))
            }
            return response

        elif path == CREDENTIALS_RENAME_PATH:
            username = claims["cognito:username"]
            credential_uuid, name = parse_json(body, "credential_uuid", "name")

            lid_response = lid.rename_credential(
                cred_id=credential_uuid,
                updated_name=name,
                username=username
            )

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(process_loginid_credential_response(lid_response))
            }
            return response

        elif path == CREDENTIALS_REVOKE_PATH:
            username = claims["cognito:username"]
            credential_uuid, = parse_json(body, "credential_uuid")

            lid_response = lid.revoke_credential(
                cred_id=credential_uuid,
                username=username
            )

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(process_loginid_credential_response(lid_response))
            }
            return response

        else:
            response = {
                "statusCode": 404,
                "headers": headers,
                "body": json.dumps({"message": "Not Found"})
            }
            return response

    except ClientError as e:
        print(e)
        response = {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({
                "message": e.response['Error']['Message'],
            })
        }
        return response

    except LoginIDError as e:
        print(e)
        response = {
            "statusCode": 400,
            "headers": headers,
            "body": json.dumps({"message": e.message, "error_code": e.code})
        }
        return response

    except Exception as e:
        print(e)
        response = {
            "statusCode": 500,
            "headers": headers,
            "body": json.dumps({"message": "Internal Server Error"})
        }
        return response


def parse_json(json_string: str, *args):
    json_obj = json.loads(json_string or "{}")
    return (json_obj.get(claim, "") for claim in args)


def random_password():
    random_source = string.ascii_letters + string.digits + string.punctuation
    password = secrets.choice(string.ascii_lowercase)
    password += secrets.choice(string.ascii_uppercase)
    password += secrets.choice(string.digits)
    password += secrets.choice(string.punctuation)

    # generate other characters
    for _ in range(16):
        password += secrets.choice(random_source)

    password_list = list(password)
    # shuffle all characters
    random.SystemRandom().shuffle(password_list)
    password = ''.join(password_list)
    return password


def filter_credentials(credentials, type: str):
    data = {}
    if type == "":
        data["credentials"] = credentials
        return data
    data["credentials"] = [credential for credential in credentials if credential["cred_type"] == type]
    return data


def process_loginid_credential_response(lid_response):
    response = {}
    response["credential"] = lid_response["auth_cred"]
    return response
