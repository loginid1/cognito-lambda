import requests
from .utils import LoginIdClient
from typing import Optional


class LoginID(LoginIdClient):
    def __init__(self, base_url: str, key_id: str, session: requests.Session = None):
        super().__init__(base_url, key_id, session)

    def _fetch_grant_token(self, username: str, grant: str) -> str:
        response = self.generate_grant(username, grant)
        token = response.get("token")
        return token

    def authenticate_with_passkey_init(self, username: str, options: Optional[dict] = None) -> Optional[dict]:
        payload = {
            "app": {"id": self.app_id},
            "deviceInfo": {},
            "user": {"username": username, "usernameType": "email"}
        }

        if options:
            payload.update(options)

        return self.post("/fido2/v2/auth/init", payload)

    def authenticate_with_passkey_complete(self, response: dict) -> Optional[dict]:
        return self.post(
            "/fido2/v2/auth/complete",
            response
        )

    def register_with_passkey_init(self, username: str, options: Optional[dict] = None) -> Optional[dict]:
        payload = {
            "app": {"id": self.app_id},
            "deviceInfo": {},
            "user": {"username": username, "usernameType": "email"}
        }

        if options:
            payload.update(options)

        # remove for now till things get sorted out in the backend
        # grant = self.generate_grant(username, "passkey:create")
        # print("grant created: ", grant)

        return self.post("/fido2/v2/reg/init", payload)

    def register_with_passkey_complete(self, response: dict) -> Optional[dict]:
        return self.post(
            "/fido2/v2/reg/complete",
            response
        )

    def get_passkeys(self, username: str) -> Optional[list]:
        token = self._fetch_grant_token(username, "passkey:read")
        return self.get("/fido2/v2/passkeys", bearer=token) or []

    def delete_passkey(self, username: str, passkey_uuid: str) -> Optional[dict]:
        token = self._fetch_grant_token(username, "passkey:delete")
        return self.delete(f"/fido2/v2/passkeys/{passkey_uuid}", bearer=token)

    def rename_passkey(self, username: str, new_name: str, passkey_uuid: str) -> Optional[dict]:
        token = self._fetch_grant_token(username, "passkey:update")
        return self.put(f"/fido2/v2/passkeys/{passkey_uuid}", new_name, bearer=token)

    def generate_grant(self, username: str, grant: str) -> Optional[dict]:
        payload = {"username": username, "grant": grant}
        return self.post("/fido2/v2/mgmt/grant", payload, api_key_auth=True)

    def verify_jwt_access_token(self, jwt: str) -> Optional[dict]:
        payload = {"jwtAccess": jwt}
        return self.post("/fido2/v2/mgmt/verify", payload)
