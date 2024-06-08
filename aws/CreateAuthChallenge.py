import boto3
import urllib.request
import re
import json
import jwt
import random
import string
import base64

from os import environ
from jwt import PyJWKClient


LOGINID_BASE_URL = environ.get("LOGINID_BASE_URL") or ""
LOGINID_SECRET_NAME = environ.get("LOGINID_SECRET_NAME") or ""
SES_SENDER_EMAIL = environ.get("SES_SENDER_EMAIL") or ""

secretsmanager = boto3.client("secretsmanager")
ses_client = boto3.client("ses")


def lambda_handler(event: dict, _: dict) -> dict:
    print(event)

    request = event["request"]
    response = event["response"]
    username = event["userName"]
    session = request.get("session")
    client_metadata = request.get("clientMetadata")

    # if session does not exist or if session length is 0 then create dummy challenge
    # to obtain authentication type
    if not session:
        response["challengeMetadata"] = "AUTH_PARAMS"
        response["privateChallengeParameters"] = {
            "challenge": "AUTH_PARAMS"
        }
        response["publicChallengeParameters"] = {
            "challenge": "AUTH_PARAMS"
        }

        return event

    if not client_metadata:
        raise Exception("ClientMetadata is required")

    init_res = None
    public_key = None

    # metadata will contain authentication type

    # register/add FIDO2 credential to existing user
    if client_metadata["authentication_type"] == "FIDO2_CREATE":
        options = client_metadata.get("options", "{}")
        options = json.loads(options)

        # verify cognito id token
        id_token = options.get("idToken", "")
        verify_cognito_id_token(event, id_token)

        init_res = register_with_passkey_init(username, options)
        public_key = json.dumps(init_res)

        response["privateChallengeParameters"] = {
            "public_key": public_key
        }
        response["publicChallengeParameters"] = {
            "public_key": public_key,
        }
        return event

    # sign in with verified LoginID access JWT
    elif client_metadata["authentication_type"] == "JWT_ACCESS":
        # cognito requires a challenge to be issued
        response["privateChallengeParameters"] = {
            "challenge": "ACCESS_JWT"
        }
        response["publicChallengeParameters"] = {
            "challenge": "ACCESS_JWT"
        }
        return event

    elif client_metadata["authentication_type"] == "EMAIL_OTP":
        # only send OTP if user is not retrying
        if len(session) == 1:
            # Generate OTP
            otp = ''.join(random.choices(string.digits, k=6))

            # Send OTP to email with SES
            send_otp_email(username, otp)

            response["privateChallengeParameters"] = {
                "challenge": "EMAIL_OTP",
                "otp": otp
            }
            response["publicChallengeParameters"] = {
                "challenge": "EMAIL_OTP"
            }
            response["challengeMetadata"] = otp

        else:
            # get latest session
            session = session[-1]
            otp = session.get("challengeMetadata", {})

            response["privateChallengeParameters"] = {
                "challenge": "EMAIL_OTP",
                "otp": otp
            }
            response["publicChallengeParameters"] = {
                "challenge": "EMAIL_OTP"
            }
            response["challengeMetadata"] = otp

        return event

    else:
        raise Exception("Authentication type not supported")


def get_key_id() -> str:
    secret = secretsmanager.get_secret_value(SecretId=LOGINID_SECRET_NAME)
    key_id = secret["SecretString"]
    return key_id


def register_with_passkey_init(username: str, options: dict) -> dict:
    # get app id from base url
    pattern = r"https://([0-9a-fA-F-]+)\.api\..*\.loginid\.io"
    match = re.search(pattern, LOGINID_BASE_URL)

    if match:
        app_id = match.group(1)
    else:
        raise Exception("Invalid LoginID base URL")

    '''
    Grant call
    '''
    url = f"{LOGINID_BASE_URL}/fido2/v2/mgmt/grant"
    headers = {
        "Content-Type": "application/json",
    }
    payload = {
        "grants": ["passkey:read", "passkey:write"],
        "username": username
    }

    # basic auth
    credentials = f"{get_key_id()}:"
    encoded_credentials = base64.urlsafe_b64encode(credentials.encode()).decode()
    authorization = f"Basic {encoded_credentials}"
    headers["Authorization"] = authorization

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers)

    with urllib.request.urlopen(req) as res:
        res = res.read().decode("utf-8")
        res_dict = json.loads(res)

    management_token = res_dict["token"]

    '''
    Register Passkey Init
    '''
    url = f"{LOGINID_BASE_URL}/fido2/v2/reg/init"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {management_token}"
    }
    payload = {
        "app": {"id": app_id},
        "deviceInfo": {},
        "user": {"username": username, "usernameType": "email"}
    }

    if options:
        deep_update(payload, clean_loginid_options(options))
        if options.get("userAgent"):
            headers["User-Agent"] = options["userAgent"]

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers)

    with urllib.request.urlopen(req) as res:
        res = res.read().decode("utf-8")
        res_dict = json.loads(res)

    return res_dict


def clean_loginid_options(options: dict) -> dict:
    # in case username is sent as options
    if options and options.get("user", {}).get("username"):
        options["user"].pop("username")

    # in case app id is sent as options
    if options and options.get("app", {}).get("id"):
        options["app"].pop("id")

    return options


def deep_update(original: dict, update: dict) -> dict:
    for key, value in update.items():
        if isinstance(value, dict):
            original[key] = deep_update(original.get(key, {}), value)
        else:
            original[key] = value

    return original


def verify_cognito_id_token(event: dict, token: str):
    if not token:
        raise Exception("id_token is missing")

    region = event["region"]
    userpool_id = event["userPoolId"]
    client_id = event["callerContext"]["clientId"]
    username = event["userName"]
    issuer_endpoint = f"https://cognito-idp.{region}.amazonaws.com/{userpool_id}"
    jwks_endpoint = f"https://cognito-idp.{region}.amazonaws.com/{userpool_id}/.well-known/jwks.json"

    # verify id_token
    jwks_client = PyJWKClient(jwks_endpoint)
    signing_key = jwks_client.get_signing_key_from_jwt(token)

    # jwt.decode will verify the signature, expiration, audience, issuer, and the claims
    # if any of the above are invalid, it will throw an exception
    data = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        audience=client_id,
        issuer=issuer_endpoint,
    )

    # check username claim
    if data["cognito:username"] != username:
        raise Exception("username claim mismatch")


def send_otp_email(email: str, otp: str):
    response = ses_client.send_email(
        Source=SES_SENDER_EMAIL,
        Destination={
            'ToAddresses': [
                email,
            ],
        },
        Message={
            'Subject': {
                'Data': 'Your verification code',
                'Charset': 'UTF-8'
            },
            'Body': {
                'Text': {
                    'Data': f'Your confirmation code is {otp}',
                    'Charset': 'UTF-8'
                }
            }
        }
    )
    print("OTP email sent:", response)
