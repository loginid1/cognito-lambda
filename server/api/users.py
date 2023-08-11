from flask import make_response, request
from flask_restful import Resource
from http import HTTPStatus
from server.helpers.api import create_session_token, json_response
from server.external.cognito import Cognito
from flask_jwt_extended import (
    set_access_cookies,
    get_jwt_identity,
    jwt_required
)

cognito_api = Cognito()


class UserResource(Resource):
    @jwt_required()
    def get(self):
        data = get_jwt_identity()
        response_data = {"username": data}
        return json_response(response_data, HTTPStatus.OK)


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

        session_token = create_session_token(jwt_payload, access_token)

        response_data = {"status": "OK"}
        response = make_response(response_data)
        response.status_code = HTTPStatus.OK
        set_access_cookies(response, session_token)
        return response
