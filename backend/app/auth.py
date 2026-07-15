import random
from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from .models import db, User, Account

auth_bp = Blueprint("auth", __name__, url_prefix="/api")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip()

    if not all([username, password, full_name, email]):
        return jsonify(error="All fields are required"), 400

    if User.query.filter_by(username=username).first():
        return jsonify(error="Username already taken"), 409

    if User.query.filter_by(email=email).first():
        return jsonify(error="Email already registered"), 409

    user = User(username=username, full_name=full_name, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    account = Account(
        user_id=user.id,
        account_number=str(random.randint(10 ** 11, 10 ** 12 - 1)),
        account_type="savings",
        balance=1000.0,
    )
    db.session.add(account)
    db.session.commit()

    login_user(user)
    return jsonify(user=user.to_dict()), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify(error="Invalid username or password"), 401

    login_user(user)
    return jsonify(user=user.to_dict()), 200


@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    logout_user()
    return jsonify(message="Logged out"), 200


@auth_bp.route("/me", methods=["GET"])
@login_required
def me():
    return jsonify(user=current_user.to_dict()), 200
