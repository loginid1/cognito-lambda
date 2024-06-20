import boto3
import json
import jwt
import re
import base64
import urllib.request


from os import environ


LOGINID_BASE_URL = environ.get("LOGINID_BASE_URL") or ""
LOGINID_SECRET_NAME = environ.get("LOGINID_SECRET_NAME") or ""

secretsmanager = boto3.client("secretsmanager")


def lambda_handler(event: dict, _: dict) -> dict:
    print(event)
    request, response = event["request"], event["response"]
    metadata = request["clientMetadata"]
    authentication_type = metadata.get("authentication_type")
    challenge_answer = request["challengeAnswer"]

    # if authentication type is empty throw error
    if not authentication_type:
        raise Exception("Authentication type not found")

    # pass for next round to obtain authentication type
    if challenge_answer == "AUTH_PARAMS":
        response["answerCorrect"] = False
        return event

    try:
        valid_types = ["FIDO2_CREATE", "FIDO2_GET", "JWT_ACCESS"]

        if valid_types.count(authentication_type):
            # parse JWT token
            username = event["userName"]
            payload = jwt.decode(
                challenge_answer,
                options={"verify_signature": False},
            )

            if payload.get("aud") != get_loginid_app_id():
                raise Exception("Invalid JWT token")
            if payload.get("username") != username:
                raise Exception("Invalid JWT token")

            verify_jwt_access_token(challenge_answer)

        elif authentication_type == "EMAIL_OTP":
            # get otp from private challenge parameters
            otp = request["privateChallengeParameters"].get("otp", "")
            if otp != challenge_answer:
                raise Exception("Invalid OTP")

        else:
            raise Exception("Invalid authentication type")

        response["answerCorrect"] = True

        return event
    except Exception as e:
        print(e)
        response["answerCorrect"] = False
        return event


def get_key_id() -> str:
    secret = secretsmanager.get_secret_value(SecretId=LOGINID_SECRET_NAME)
    key_id = secret["SecretString"]
    return key_id


def get_loginid_app_id() -> str:
    pattern = r"https://([0-9a-fA-F-]+)\.api\..*\.loginid\.io"
    match = re.search(pattern, LOGINID_BASE_URL)

    if match:
        app_id = match.group(1)
    else:
        raise Exception("Invalid LoginID base URL")

    return app_id


def verify_jwt_access_token(token: str) -> None:
    print(token)
    url = f"{LOGINID_BASE_URL}/fido2/v2/mgmt/token/verify"
    headers = {
        "Content-Type": "application/json",
    }
    payload = {
        "jwtAccess": token
    }

    # basic auth
    credentials = f"{get_key_id()}:"
    encoded_credentials = base64.urlsafe_b64encode(credentials.encode()).decode()
    authorization = f"Basic {encoded_credentials}"
    headers["Authorization"] = authorization

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers)

    with urllib.request.urlopen(req) as res:
        if res.status != 204:
            raise Exception("Invalid JWT token")

    return
