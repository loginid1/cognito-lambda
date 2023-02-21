from flask_restful import Resource
from http import HTTPStatus
from flask import Response
from flask_jwt_extended import jwt_required, unset_jwt_cookies


class LogoutResource(Resource):
    @jwt_required()
    def put(self):
        response = Response()
        response.status_code = HTTPStatus.NO_CONTENT
        unset_jwt_cookies(response)
        return response
