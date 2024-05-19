import boto3
import json
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

    lid = LoginID(LOGINID_BASE_URL, get_key_id())

    challenge_answer = json.loads(challenge_answer)
    id_token = challenge_answer.get("id_token")

    if 'creationResult' not in challenge_answer and 'assertionResult' not in challenge_answer:
        raise Exception("response not found")

    try:
        # finish sign in with FIDO2
        if authentication_type == "FIDO2_GET":
            lid.authenticate_with_passkey_complete(challenge_answer)

        # finish adding FIDO2 credential
        elif authentication_type == "FIDO2_CREATE":
            verify_cognito_id_token(event, id_token)
            lid.register_with_passkey_complete(challenge_answer)

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
