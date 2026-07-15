from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()


class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    accounts = db.relationship("Account", backref="owner", lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "full_name": self.full_name,
            "email": self.email,
        }


class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    account_number = db.Column(db.String(20), unique=True, nullable=False)
    account_type = db.Column(db.String(20), nullable=False)  # savings, current
    ifsc = db.Column(db.String(11), default="HDFC0001234")
    balance = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    transactions = db.relationship(
        "Transaction", backref="account", lazy=True,
        order_by="Transaction.timestamp.desc()"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "account_number": self.account_number,
            "account_type": self.account_type,
            "ifsc": self.ifsc,
            "balance": self.balance,
            "created_at": self.created_at.isoformat(),
        }


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey("account.id"), nullable=False)
    type = db.Column(db.String(20), nullable=False)  # credit, debit
    category = db.Column(db.String(30), default="general")  # transfer, billpay, deposit
    amount = db.Column(db.Float, nullable=False)
    description = db.Column(db.String(200))
    balance_after = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "type": self.type,
            "category": self.category,
            "amount": self.amount,
            "description": self.description,
            "balance_after": self.balance_after,
            "timestamp": self.timestamp.isoformat(),
        }


class Biller(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)

    def to_dict(self):
        return {"id": self.id, "name": self.name, "category": self.category}


class BillPayment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_id = db.Column(db.Integer, db.ForeignKey("account.id"), nullable=False)
    biller_id = db.Column(db.Integer, db.ForeignKey("biller.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="success")
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
