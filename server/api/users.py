from flask import make_response, request
from flask_restful import Resource
from http import HTTPStatus
from datetime import datetime, timedelta
from server.helpers.api import json_response
from server.external.cognito import Cognito
from flask_jwt_extended import (
    create_access_token,
    set_access_cookies,
    get_jwt_identity,
    jwt_required
)

cognito_api = Cognito()

# in memeory version instead of DB
TOKEN_STORE = {}


class UserResource(Resource):
    @jwt_required()
    def get(self):
        username = get_jwt_identity()
        data = {"username": username}
        return json_response(data, HTTPStatus.OK)


    def post(self):
        payload = request.get_json()

        id_token = payload.get("id_token", "")
        access_token = payload.get("access_token", "")
        response_data = {"message": "Unauthorized"}

        if not id_token or not access_token:
            return json_response(response_data, HTTPStatus.UNAUTHORIZED)

        try:
            jwt_payload = cognito_api.decode_cognito_jwt(id_token)
        except Exception as e:
            print(e)
            return json_response(response_data, HTTPStatus.UNAUTHORIZED)

        username = jwt_payload["cognito:username"]
        TOKEN_STORE[username] = {
            "id_token_payload": jwt_payload,
            "access_token": access_token,
        }

        # session token
        exp = datetime.fromtimestamp(jwt_payload["exp"])
        time_diff = exp - datetime.now()
        exp_timedelta = timedelta(seconds=time_diff.total_seconds())

        session_token = create_access_token(username, expires_delta=exp_timedelta)

        response_data = {"status": "OK"}
        response = make_response(response_data)
        response.status_code = HTTPStatus.OK
        set_access_cookies(response, session_token)
        return response
