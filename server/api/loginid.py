from flask import Blueprint, Response, request, jsonify
from http import HTTPStatus
from loginid import LoginIdManagement
from server.helpers.api import default_json

from server.config import (
    LOGINID_BASE_URL,
    LOGINID_CLIENT_ID,
    PRIVATE_KEY,
)


loginid_bluebrint = Blueprint("loginid", __name__, url_prefix="/api/loginid")
lid = LoginIdManagement(LOGINID_CLIENT_ID, PRIVATE_KEY, LOGINID_BASE_URL)


@loginid_bluebrint.route("/token/generate", methods=["POST"])
def create_service_token():
    username, scope = default_json(
        "username",
        "scope"
    )

    service_token = lid.generate_service_token(scope, username)

    return jsonify(service_token=service_token)


@loginid_bluebrint.route("/token/verify", methods=["POST"])
def verify_jwt():
    jwt, username = default_json("jwt", "username")

    try:
        result = lid.verify_token(str(jwt), username)
        return jsonify(is_valid=result)
    except Exception as e:
        print(e)
        return jsonify(message="Verification failed"), HTTPStatus.BAD_REQUEST

