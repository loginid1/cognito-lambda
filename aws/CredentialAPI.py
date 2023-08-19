import boto3
import json
import re
import random
import string
import secrets
import requests

from botocore.exceptions import ClientError
from os import environ
from loginid import LoginIdManagement
from loginid.core import LoginIDError

BASE_URL = environ.get("LOGINID_BASE_URL") or ""
CLIENT_ID = environ.get("LOGINID_CLIENT_ID") or ""
PRIVATE_KEY = re.sub(
    r"\\n",
    r"\n",
    environ.get("PRIVATE_KEY") or ""
)
COGNITO_REGION_NAME = environ.get("COGNITO_REGION_NAME") or ""
COGNITO_ACCESS_KEY_ID = environ.get("COGNITO_ACCESS_KEY_ID") or ""
COGNITO_SECRET_ACCESS_KEY = environ.get("COGNITO_SECRET_ACCESS_KEY") or ""
COGNITO_CLIENT_ID = environ.get("COGNITO_CLIENT_ID") or ""

lid = LoginIdManagement(CLIENT_ID, PRIVATE_KEY, BASE_URL)
aws_cognito = boto3.client(
    "cognito-idp",
    region_name=COGNITO_REGION_NAME,
    aws_access_key_id=COGNITO_ACCESS_KEY_ID,
    aws_secret_access_key=COGNITO_SECRET_ACCESS_KEY,
)

# paths
FIDO2_REGISTER_INIT_PATH = "/fido2/register/init"
FIDO2_REGISTER_COMPLETE_PATH = "/fido2/register/complete"
FIDO2_CREATE_INIT_PATH = "/fido2/create/init"
FIDO2_CREATE_COMPLETE_PATH = "/fido2/create/complete"

CREDENTIALS_PHONE_INIT_PATH = "/credentials/phone/init"
CREDENTIALS_PHONE_COMPLETE_PATH = "/credentials/phone/complete"

CREDENTIALS_LIST_PATH = "/credentials/list"
CREDENTIALS_RENAME_PATH = "/credentials/rename"
CREDENTIALS_REVOKE_PATH = "/credentials/revoke"

CONFIG_PATH = "/config"


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
            CONFIG_PATH,
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

        if path == CONFIG_PATH:
            # style config vars
            PAGE_BACKGROUND_COLOR = environ.get("PAGE_BACKGROUND_COLOR") or ""
            PAGE_BACKGROUND_IMAGE = environ.get("PAGE_BACKGROUND_IMAGE") or ""
            BACKGROUND_COLOR = environ.get("BACKGROUND_COLOR") or ""
            BACKGROUND_IMAGE = environ.get("BACKGROUND_IMAGE") or ""
            BUTTONS_COLOR = environ.get("BUTTONS_COLOR") or ""
            LOGIN_LOGO = environ.get("LOGIN_LOGO") or ""
            COMPANY_NAME = environ.get("COMPANY_NAME") or ""

            response = {
                "page_background_color": PAGE_BACKGROUND_COLOR,
                "page_background_image": PAGE_BACKGROUND_IMAGE,
                "background_color": BACKGROUND_COLOR,
                "background_image": BACKGROUND_IMAGE,
                "buttons_color": BUTTONS_COLOR,
                "login_logo": LOGIN_LOGO,
                "company_name": COMPANY_NAME,
            }

            return {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(response),
            }

        elif path == FIDO2_REGISTER_INIT_PATH:
            # get username from request body
            username, = parse_json(body, "username")
            # lower case username or make it empty string
            username = username.lower() if username else ""

            init_response = lid.register_fido2_init(username)
            attestation_payload = init_response["attestation_payload"]

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(attestation_payload)
            }
            return response

        elif path == FIDO2_REGISTER_COMPLETE_PATH:
            username, email, attestation_payload = parse_json(
                body, 
                "username", 
                "email", 
                "attestation_payload"
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
                "Name": "attestation_payload",
                "Value": json.dumps(attestation_payload),
            }

            meta_data = {
                "register_type": "FIDO2"
            }

            aws_cognito.sign_up(
                ClientId=COGNITO_CLIENT_ID,
                Username=username,
                Password=random_password(),
                UserAttributes=[email_attribute],
                ValidationData=[validation_attestation_payload],
                ClientMetadata=meta_data,
            )

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps({"username": username})
            }
            return response

        elif path == FIDO2_CREATE_INIT_PATH:
            username = claims["cognito:username"]

            user = {}
            try:
                user = lid.get_user(username)
            except LoginIDError as e:
                # check if user not found
                if e.status_code == 404 and e.error_code == "user_not_found":
                    user = lid.add_user_without_credentials(username)
                else:
                    raise e

            loginid_user_id = user["id"]

            init_response = lid.force_fido2_credential_init(loginid_user_id)
            attestation_payload = init_response["attestation_payload"]

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(attestation_payload)
            }
            return response

        elif path == FIDO2_CREATE_COMPLETE_PATH:
            username = claims["cognito:username"]
            attestation_payload, = parse_json(body, "attestation_payload")

            lid_response = lid.complete_add_fido2_credential(attestation_payload, username)

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(process_loginid_credential_response(lid_response))
            }
            return response

        elif path == CREDENTIALS_LIST_PATH:
            username = claims["cognito:username"]
            type = event["queryStringParameters"].get("type", "fido2")
            status = event["queryStringParameters"].get("status", "active")


            lid_response = lid.get_credentials(status=status, username=username)

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(filter_credentials(lid_response["credentials"], type))
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

        elif path == CREDENTIALS_PHONE_INIT_PATH:
            username = claims["cognito:username"]
            phone_number, delivery_mode = parse_json(body, "phone_number", "delivery_mode")

            # make http request to loginid api
            url = BASE_URL + "/api/native/credentials/phone/init/force"
            request_body = {
                "client_id": CLIENT_ID,
                "username": username,
                "phone_number": phone_number,
                "delivery_mode": delivery_mode,
            }

            lid_response = {}
            try: 
                token = lid.generate_service_token("credentials.force_add")
                lid_response = loginid_raw_request(url, request_body, token)
            except LoginIDError as e:
                # check if user not found
                if e.status_code == 404 and e.error_code == "user_not_found":
                    user = lid.add_user_without_credentials(username)
                    token = lid.generate_service_token("credentials.force_add")
                    lid_response = loginid_raw_request(url, request_body, token)
                else:
                    raise e

            response = {
                "statusCode": lid_response.status_code,
                "headers": headers,
                "body": lid_response.text
            }
            return response

        elif path == CREDENTIALS_PHONE_COMPLETE_PATH:
            username = claims["cognito:username"]
            credential_uuid, phone_number, otp = parse_json(
                body,
                "credential_uuid",
                "phone_number",
                "otp",
            )

            # make http request to loginid api
            url = BASE_URL + "/api/native/credentials/phone/complete"
            request_body = {
                "client_id": CLIENT_ID,
                "username": username,
                "credential_uuid": credential_uuid,
                "phone_number": phone_number,
                "otp": otp,
            }

            lid_response = loginid_raw_request(url, request_body, None)
            # parse response text to json object
            lid_response_json = json.loads(lid_response.text)
            print(lid_response_json)

            response = {
                "statusCode": lid_response.status_code,
                "headers": headers,
                "body": json.dumps(process_loginid_credential_response(lid_response_json))
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
            "statusCode": e.status_code,
            "headers": headers,
            "body": json.dumps({"message": e.message, "error_code": e.error_code})
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
    data["credentials"] = [credential for credential in credentials if credential["type"] == type]
    return data


def process_loginid_credential_response(lid_response):
    response = {}
    response["credential"] = lid_response["credential"]
    return response

def loginid_raw_request(url: str, request_body: dict, token = None):
    headers = {
    "Content-Type": "application/json",
    }

    if token != None:
        headers["Authorization"] = "Bearer " + token

    response = requests.post(url, headers=headers, data=json.dumps(request_body))

    # if status code is not 200, raise LoginIdError
    if response.status_code != 200:
        lid_response_body = json.loads(response.text)
        print(response.text)
        raise LoginIDError(
            response.status_code,
            lid_response_body["code"],
            lid_response_body["message"],
        )
    return response
