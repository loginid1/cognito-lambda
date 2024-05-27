import boto3
import json
import jwt

from loginid import LoginID
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

    lid = LoginID(LOGINID_BASE_URL, get_key_id())

    try:
        # finish sign in with FIDO2
        if authentication_type == "FIDO2_GET":
            challenge_answer = json.loads(challenge_answer)
            lid.authenticate_with_passkey_complete(challenge_answer)

        # finish adding FIDO2 credential
        elif authentication_type == "FIDO2_CREATE":
            challenge_answer = json.loads(challenge_answer)
            lid.register_with_passkey_complete(challenge_answer)

        # verify JWT access token
        elif authentication_type == "JWT_ACCESS":
            # parse JWT token
            username = event["userName"]
            payload = jwt.decode(
                challenge_answer,
                options={"verify_signature": False},
            )

            if payload.get("appId") != lid.app_id:
                raise Exception("Invalid JWT token")
            if payload.get("username") != username:
                raise Exception("Invalid JWT token")

            lid.verify_jwt_access_token(challenge_answer)

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
