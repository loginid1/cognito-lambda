from flask import Response, json, request
from datetime import datetime, timedelta
from flask_jwt_extended import create_access_token


def json_response(payload, status_code: int) -> Response:
    return Response(
        mimetype="application/json",
        response=json.dumps(payload),
        status=status_code
)


def default_json(*args):
    json = request.get_json()
    return (json.get(claim, "") for claim in args)


def create_session_token(id_token_payload: dict, access_token: str) -> str:
    # session token time
    username = id_token_payload["cognito:username"]

    exp = datetime.fromtimestamp(id_token_payload["exp"])
    time_diff = exp - datetime.now()
    exp_timedelta = timedelta(seconds=time_diff.total_seconds())

    # not ideal to store this data in session cookie but good enough for this example
    # probably best to store it in a DB
    user_data = {
        "username": username,
        "access_token": access_token,
    }

    return create_access_token(user_data, expires_delta=exp_timedelta)
