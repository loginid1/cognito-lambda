import requests
from requests.exceptions import HTTPError


class AuthenticatorService:
    def __init__(self, base_url):
        self.base_url = base_url

    def create_authenticator(self):
        try:
            response = requests.post(f"{self.base_url}/authenticator/create")
            response.raise_for_status()
            return response.json()
        except HTTPError as http_err:
            raise AuthenticatorError.from_http_error(http_err)
        except Exception as err:
            raise Exception(f"An error occurred: {err}")

    def create_credential(self, id, body):
        try:
            response = requests.post(f"{self.base_url}/authenticator/{id}/create", json=body)
            response.raise_for_status()
            return response.json()
        except HTTPError as http_err:
            raise AuthenticatorError.from_http_error(http_err)
        except Exception as err:
            raise Exception(f"An error occurred: {err}")

    def get_credential(self, id, body):
        try:
            response = requests.post(f"{self.base_url}/authenticator/{id}/get", json=body)
            response.raise_for_status()
            return response.json()
        except HTTPError as http_err:
            raise AuthenticatorError.from_http_error(http_err)
        except Exception as err:
            raise Exception(f"An error occurred: {err}")

class AuthenticatorError(Exception):
    def __init__(self, message: str):
        super().__init__(message)

    @staticmethod
    def from_http_error(http_err):
        error_content = http_err.response.json()
        return AuthenticatorError(error_content.get("message"))
