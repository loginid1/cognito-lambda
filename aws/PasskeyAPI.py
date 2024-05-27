import boto3
import json

from botocore.exceptions import ClientError
from os import environ
from loginid import LoginID
from loginid.utils import LoginIDError


BASE_URL = environ.get("LOGINID_BASE_URL") or ""
CLIENT_ID = environ.get("LOGINID_CLIENT_ID") or ""
LOGINID_SECRET_NAME = environ.get("LOGINID_SECRET_NAME") or ""
COGNITO_REGION_NAME = environ.get("COGNITO_REGION_NAME") or ""
COGNITO_CLIENT_ID = environ.get("COGNITO_CLIENT_ID") or ""
COGNITO_USER_POOL_ID = environ.get("COGNITO_USER_POOL_ID") or ""

# paths
PASSKEYS_PATH = "/passkeys"
PASSKEY_AUTH_INIT = "/passkeys/auth/init"
PASSKEY_AUTH_COMPLETE = "/passkeys/auth/complete"

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
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
    }
    path = event.get("path", "")
    body = event.get("body") or "{}"

    try:
        lid = LoginID(BASE_URL, get_key_id())

        # handle claims and paths
        claims = {}
        paths = [
            PASSKEY_AUTH_INIT,
            PASSKEY_AUTH_COMPLETE,
        ]

        method = event.get("httpMethod")

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

        # used for usernameless passkey login
        if path == PASSKEY_AUTH_INIT and method == "POST":
            request_headers = event.get("headers") or {}
            user_agent = request_headers.get("User-Agent")

            options = {"userAgent": user_agent} if user_agent else None
            lid_response = lid.authenticate_with_passkey_init("", options)

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(lid_response)
            }
            return response

        elif path == PASSKEY_AUTH_COMPLETE and method == "POST":
            response = json.loads(body)
            lid_response = lid.authenticate_with_passkey_complete(response) or {}

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(lid_response)
            }
            return response

        elif path == PASSKEYS_PATH and method == "GET":
            username = claims["cognito:username"]

            lid_response = lid.get_passkeys(username)

            response = {
                "statusCode": 200,
                "headers": headers,
                "body": json.dumps(lid_response)
            }
            return response

        elif path.startswith(PASSKEYS_PATH) and method == "PUT":
            username = claims["cognito:username"]
            name, = parse_json(body, "name")
            passkey_id = event["pathParameters"]["id"]

            lid_response = lid.rename_passkey(username, name, passkey_id)

            response = {
                "statusCode": 204,
                "headers": headers,
                "body": lid_response
            }
            return response

        elif path.startswith(PASSKEYS_PATH) and method == "DELETE":
            username = claims["cognito:username"]
            passkey_id = event["pathParameters"]["id"]

            lid_response = lid.delete_passkey(username, passkey_id)

            response = {
                "statusCode": 204,
                "headers": headers,
                "body": lid_response
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


def get_key_id() -> str:
    secret = secretsmanager.get_secret_value(SecretId=LOGINID_SECRET_NAME)
    key_id = secret["SecretString"]
    return key_id
