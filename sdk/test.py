import os
import random
import string
import datetime

from src.loginid import LoginID
from authenticator import AuthenticatorService


base_url = os.getenv("BASE_URL")
authenticator_base_url = os.getenv("AUTHENTICATOR_BASE_URL")
key_id = os.getenv("KEY_ID")

def random_email():
    # date in milliseconds
    d = int(datetime.datetime.now().timestamp())
    return "".join(random.choices(string.ascii_lowercase, k=10)) + f"+{d}" + "@example.com"

lid = LoginID(base_url, key_id)
authenticator = AuthenticatorService(authenticator_base_url)

# Set up
username = random_email()
create_authenticator_response = authenticator.create_authenticator()
authenticator_uuid = create_authenticator_response.get("authenticator_id")

# Register with passkey
reg_init = lid.register_with_passkey_init(username)
create_response = authenticator.create_credential(authenticator_uuid, reg_init)
lid.register_with_passkey_complete(create_response)

# Authenticate with passkey
auth_init = lid.authenticate_with_passkey_init(username)
get_response = authenticator.get_credential(authenticator_uuid, auth_init)
lid.authenticate_with_passkey_complete(get_response)
