from flask import Flask
from flask_jwt_extended import JWTManager
from flask_restful import Api
from server.api.users import UserResource
from server.api.logout import LogoutResource
from server.api.pages import pages_blueprint
from server.api.loginid import loginid_bluebrint
import server.setup



def create_app() -> Flask:
    app = Flask(__name__)
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    # change to True in production setting
    app.config["JWT_COOKIE_SECURE"] = False
    app.config["JWT_ACCESS_COOKIE_PATH"] = "/"
    app.config["JWT_COOKIE_CSRF_PROTECT"] = True
    app.config["JWT_CSRF_IN_COOKIES"] = True
    app.config["JWT_SECRET_KEY"] = "loginid"

    app.register_blueprint(pages_blueprint)
    app.register_blueprint(loginid_bluebrint)

    JWTManager(app)

    api = Api(app)
    api.add_resource(UserResource, "/api/users")
    api.add_resource(LogoutResource, "/api/users/logout")

    return app
