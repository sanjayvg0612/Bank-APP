import os
from pathlib import Path
from urllib.parse import quote_plus

from flask import Flask, jsonify
from flask_login import LoginManager
from flask_cors import CORS
from .models import db, User

login_manager = LoginManager()

# Common local dev ports for static frontend servers (live-server, http.server, vite, etc.)
FRONTEND_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]


def load_env_file():
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.exists():
        return

    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"\'')
        if key and key not in os.environ:
            os.environ[key] = value


load_env_file()


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")

    database_url = os.environ.get("DATABASE_URL")
    db_user = os.environ.get("DB_USER")
    db_password = os.environ.get("DB_PASSWORD")
    db_host = os.environ.get("DB_HOST")
    db_port = os.environ.get("DB_PORT", "3306")
    db_name = os.environ.get("DB_NAME", "bankdb")

    if database_url:
        db_uri = database_url
    elif db_host:
        encoded_password = quote_plus(db_password or "")
        db_uri = (
            f"mysql+pymysql://{db_user or 'admin'}:{encoded_password}@{db_host}:{db_port}/{db_name}"
        )
    else:
        db_uri = "sqlite:///bank.db"

    app.config["SQLALCHEMY_DATABASE_URI"] = db_uri
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SESSION_COOKIE_SAMESITE"] = "Lax"

    CORS(app, supports_credentials=True, origins=FRONTEND_ORIGINS)

    db.init_app(app)
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    @login_manager.unauthorized_handler
    def unauthorized():
        return jsonify(error="Authentication required"), 401

    from .auth import auth_bp
    from .accounts import accounts_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(accounts_bp)

    with app.app_context():
        db.create_all()

    return app
