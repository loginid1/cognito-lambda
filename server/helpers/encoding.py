import json
import jwt
from server.external.cognito import Cognito


def decode_cognito_jwt(jwks, id_token):
    cognito = Cognito()
    jwks_client = jwt.PyJWKClient(cognito.issuer_url())
    signing_key = jwks_client.get_signing_key_from_jwt(id_token)

    data = jwt.decode(
        id_token,
        key=signing_key.key,
        algorithms=["RS256"],
        audience=""
    )

    payload, header = data["payload"], data["header"]

    return ({}, False)
