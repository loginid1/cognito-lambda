import boto3
import json
import re
import requests
import jwt
from jwt import PyJWKClient

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

    lid = LoginID(LOGINID_BASE_URL, get_private_key())

    username = event["userName"]

    challenge_answer = json.loads(challenge_answer)
    attestation_response = challenge_answer.get("attestation_response")
    assertion_response = challenge_answer.get("assertion_response")
    id_token = challenge_answer.get("id_token")

    if not attestation_response and not assertion_response:
        raise Exception("response not found")

    try:
        # loginid verification
        loginid_res = {}

        # finish sign in with FIDO2
        if authentication_type == "FIDO2_GET":
            loginid_res = lid.authenticate_fido2_complete(username, assertion_response)

        # finish adding FIDO2 credential
        elif authentication_type == "FIDO2_CREATE":
            verify_cognito_id_token(event, id_token)
            loginid_res = lid.add_fido2_credential_complete(username, attestation_response)

        if not loginid_res["is_authenticated"]:
            response["answerCorrect"] = False
            return event

        response["answerCorrect"] = True

        return event
    except Exception as e:
        print(e)
        response["answerCorrect"] = False
        return event


def get_private_key() -> str:
    secret = secretsmanager.get_secret_value(SecretId=LOGINID_SECRET_NAME)
    private_key = secret["SecretString"]
    private_key = re.sub(
        r"\\n",
        r"\n",
        private_key,
    )
    return private_key


def verify_cognito_id_token(event: dict, token: str):
    if not token:
        raise Exception("failed to get id_token")

    region = event["region"]
    userpool_id = event["userPoolId"]
    client_id = event["callerContext"]["clientId"]
    username = event["userName"]
    issuer_endpoint = f"https://cognito-idp.{region}.amazonaws.com/{userpool_id}"
    jwks_endpoint = f"https://cognito-idp.{region}.amazonaws.com/{userpool_id}/.well-known/jwks.json"

    # verify id_token
    jwks_client = PyJWKClient(jwks_endpoint)
    signing_key = jwks_client.get_signing_key_from_jwt(token)
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
