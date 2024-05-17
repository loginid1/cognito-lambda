import requests
import re
import base64

from typing import Optional, Union
from .errors import LoginIDError


class LoginIdClient:
    def __init__(self, base_url: str, key_id: str, session: requests.Session=None):
        pattern = r"https://([0-9a-fA-F-]+)\.api\..*\.loginid\.io"
        match = re.search(pattern, base_url)

        if match:
            self.app_id = match.group(1)
        else:
            raise LoginIDError(500, "invalid_base_url", "app ID not found on base URL")

        self.base_url = base_url
        self.key_id = key_id
        self.session = session or requests.Session()

    def _prepare_headers(self, headers: Optional[dict]=None, api_key_auth: bool=False, bearer="") -> dict:
        _headers = {**headers} if headers else {}
        _headers['Content-Type'] = 'application/json'

        if api_key_auth:
            _headers['Authorization'] = self._prepare_basic_auth_token()
        elif bearer:
            _headers['Authorization'] = f"Bearer {bearer}"

        return _headers

    def _parse_response(self, response: requests.Response) -> dict:
        try:
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            if response.status_code == 502:
                raise LoginIDError(502, "internal_error", "Bad gateway")
            raise LoginIDError.from_dict(response.status_code, response.json())
        except Exception as e:
            raise LoginIDError(500, "internal_error", str(e))

    def _prepare_basic_auth_token(self) -> str:
        credentials = f"{self.key_id}:"
        encoded_credentials = base64.urlsafe_b64encode(credentials.encode()).decode()
        return f"Basic {encoded_credentials}"

    def post(self, endpoint: str, data: Optional[dict]=None, api_key_auth=False, bearer="") -> Optional[dict]:
        headers = self._prepare_headers(api_key_auth=api_key_auth, bearer=bearer)
        response = self.session.post(f"{self.base_url}{endpoint}", json=data, headers=headers)

        if response.status_code == 200 or response.status_code == 502:
            return self._parse_response(response)

        raise LoginIDError.from_dict(response.status_code, response.json())

    def get(self, endpoint: str, data: Optional[dict]=None, api_key_auth=False, bearer="") -> Optional[dict]:
        headers = self._prepare_headers(api_key_auth=api_key_auth, bearer=bearer)
        response = self.session.get(f"{self.base_url}{endpoint}", json=data, headers=headers)

        return self._parse_response(response)

    def delete(self, endpoint: str, data: Optional[dict]=None, api_key_auth=False, bearer="") -> Optional[dict]:
        headers = self._prepare_headers(api_key_auth=api_key_auth, bearer=bearer)
        response = self.session.delete(f"{self.base_url}{endpoint}", json=data, headers=headers)

        if response.status_code == 204:
            return None

        return self._parse_response(response)

    def put(self, endpoint: str, data: Optional[Union[dict, str, float, int]]=None, api_key_auth=False, bearer="") -> Optional[dict]:
        headers = self._prepare_headers(api_key_auth=api_key_auth, bearer=bearer)
        response = self.session.put(f"{self.base_url}{endpoint}", json=data, headers=headers)

        if response.status_code == 204:
            return None

        return self._parse_response(response)
