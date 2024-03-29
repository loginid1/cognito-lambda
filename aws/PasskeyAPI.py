import boto3
import json
import re
import random
import string
import secrets
import requests
import jwt

from botocore.exceptions import ClientError
from os import environ
from loginid import LoginID
from loginid.utils import LoginIDError
from urllib.parse import urlparse


BASE_URL = environ.get("LOGINID_BASE_URL") or ""
CLIENT_ID = environ.get("LOGINID_CLIENT_ID") or ""
LOGINID_SECRET_NAME = environ.get("LOGINID_SECRET_NAME") or ""
PRIVATE_KEY = re.sub(
    r"\\n",
    r"\n",
    environ.get("PRIVATE_KEY") or ""
)
COGNITO_REGION_NAME = environ.get("COGNITO_REGION_NAME") or ""
COGNITO_CLIENT_ID = environ.get("COGNITO_CLIENT_ID") or ""
COGNITO_USER_POOL_ID = environ.get("COGNITO_USER_POOL_ID") or ""

# paths
FIDO2_REGISTER_INIT_PATH = "/fido2/register/init"
FIDO2_REGISTER_COMPLETE_PATH = "/fido2/register/complete"
FIDO2_CREATE_INIT_PATH = "/fido2/create/init"
FIDO2_CREATE_COMPLETE_PATH = "/fido2/create/complete"

CREDENTIALS_LIST_PATH = "/credentials/list"
CREDENTIALS_RENAME_PATH = "/credentials/rename"
CREDENTIALS_REVOKE_PATH = "/credentials/revoke"

aws_cognito = boto3.client(
    "cognito-idp",
    region_name=COGNITO_REGION_NAME,
)
secretsmanager = boto3.client("secretsmanager")



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
        # get private key from kms from secret name
        lid = LoginID(BASE_URL, get_private_key())

        # handle claims and paths
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
            private_key = get_private_key()

            loginid_user = lid.post("/backend-api/users/username", { "username": username })
            user_uuid = loginid_user["user_uuid"]

            # modulize this if needed again
            aud = urlparse(BASE_URL).hostname
            if not aud:
                response = {
                    "statusCode": 400,
                    "headers": headers,
                    "body": json.dumps({"error": "Invalid LOGINID_BASE_URL"})
                }
                return response

            jwt_payload = {
                "iss": "loginid.io",
                "aud": aud,
                
            }
            jwt_token = jwt.encode(jwt_payload, private_key, algorithm="ES256")

            loginid_headers = {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + jwt_token
            }
            url = BASE_URL + f"/backend-api/users/{user_uuid}/credentials/fido2/{credential_uuid}/name"
            response = requests.put(url, json=name, headers=loginid_headers)
            if response.status_code != 204:
                response = {
                    "statusCode": response.status_code,
                    "headers": headers,
                    "body": json.dumps(response.json())
                }
                return response

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": True
            }
            return response

        elif path == CREDENTIALS_REVOKE_PATH:
            username = claims["cognito:username"]
            credential_uuid, = parse_json(body, "credential_uuid")

            loginid_user = lid.post("/backend-api/users/username", { "username": username })

            lid.delete_user_credential(
                cred_uuid=credential_uuid,
                user_uuid=loginid_user["user_uuid"]
            )

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": True
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


def get_private_key() -> str:
    secret = secretsmanager.get_secret_value(SecretId=LOGINID_SECRET_NAME)
    private_key = secret["SecretString"]
    private_key = re.sub(
        r"\\n",
        r"\n",
        private_key,
    )
    return private_key
