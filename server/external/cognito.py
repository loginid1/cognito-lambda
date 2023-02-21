import jwt
from server.config import (
    COGNITO_CLIENT_ID,
    COGNITO_USER_POOL_ID
)


class Cognito:
    def __init__(self) -> None:
        self.base_url = "https://cognito-idp.us-east-2.amazonaws.com"


    def issuer_url(self) -> str:
        return self.base_url + "/" + COGNITO_USER_POOL_ID


    def decode_cognito_jwt(self, token: str):
        url = self.issuer_url() + "/.well-known/jwks.json"
        jwks_client = jwt.PyJWKClient(url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        payload = jwt.decode(
            token,
            key=signing_key.key,
            algorithms=["RS256"],
            audience=COGNITO_CLIENT_ID,
            issuer=self.issuer_url()
        )

        # TODO: validate access_token as well

        return payload
