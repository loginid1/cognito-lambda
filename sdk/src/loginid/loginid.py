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

    def _clean_options(self, options: dict) -> dict:
        # in case username is sent as options
        if options and options.get("user", {}).get("username"):
            options["user"].pop("username")

        # in case app id is sent as options
        if options and options.get("app", {}).get("id"):
            options["app"].pop("id")

        return options

    def _deep_update(self, original: dict, update: dict) -> dict:
        for key, value in update.items():
            if isinstance(value, dict):
                original[key] = self._deep_update(original.get(key, {}), value)
            else:
                original[key] = value

        return original

    def authenticate_with_passkey_init(self, username: str, options: Optional[dict] = None) -> Optional[dict]:
        payload = {
            "app": {"id": self.app_id},
            "deviceInfo": {},
            "user": {"username": username, "usernameType": "email"}
        }
        headers = {}

        if options:
            self._deep_update(payload, self._clean_options(options))
            if options.get("userAgent"):
                headers["User-Agent"] = options["userAgent"]

        return self.post("/fido2/v2/auth/init", payload, headers=headers)

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
        headers = {}

        if options:
            self._deep_update(payload, self._clean_options(options))
            if options.get("userAgent"):
                headers["User-Agent"] = options["userAgent"]

        token = self._fetch_grant_token(username, "passkey:create")
        return self.post("/fido2/v2/reg/init", payload, headers=headers, bearer=token)

    def register_with_passkey_complete(self, response: dict) -> Optional[dict]:
        return self.post(
            "/fido2/v2/reg/complete",
            response
        )

    def get_passkeys(self, username: str) -> Optional[list]:
        token = self._fetch_grant_token(username, "passkey:list")
        return self.get("/fido2/v2/passkeys", bearer=token) or []

    def delete_passkey(self, username: str, passkey_uuid: str) -> Optional[dict]:
        token = self._fetch_grant_token(username, "passkey:delete")
        return self.delete(f"/fido2/v2/passkeys/{passkey_uuid}", bearer=token)

    def rename_passkey(self, username: str, new_name: str, passkey_uuid: str) -> Optional[dict]:
        payload = {"name": new_name}
        token = self._fetch_grant_token(username, "passkey:update")
        return self.put(f"/fido2/v2/passkeys/{passkey_uuid}", payload, bearer=token)

    def generate_grant(self, username: str, grant: str) -> Optional[dict]:
        payload = {"username": username, "grant": grant}
        return self.post("/fido2/v2/mgmt/grant", payload, api_key_auth=True)

    def verify_jwt_access_token(self, jwt: str) -> Optional[dict]:
        payload = {"jwtAccess": jwt}
        return self.post("/fido2/v2/mgmt/token/verify", payload, api_key_auth=True)
