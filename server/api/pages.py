from flask import Blueprint, send_from_directory
from server.config import DIST_DIR


pages_blueprint = Blueprint("pages", __name__)


@pages_blueprint.route("/", methods=["GET"])
def main_page():
    return send_from_directory(DIST_DIR, "index.html")


@pages_blueprint.route("/register", methods=["GET"])
def register():
    return send_from_directory(DIST_DIR, "index.html")


@pages_blueprint.route("/login", methods=["GET"])
def login():
    return send_from_directory(DIST_DIR, "login.html")


@pages_blueprint.route("/home", methods=["GET"])
def home():
    return send_from_directory(DIST_DIR, "home.html")
