from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from .models import db, Account, Transaction, Biller, BillPayment

accounts_bp = Blueprint("accounts", __name__, url_prefix="/api")


def get_owned_account(account_id):
    return Account.query.filter_by(id=account_id, user_id=current_user.id).first()


@accounts_bp.route("/accounts", methods=["GET"])
@login_required
def list_accounts():
    user_accounts = Account.query.filter_by(user_id=current_user.id).all()
    total_balance = sum(a.balance for a in user_accounts)
    return jsonify(
        accounts=[a.to_dict() for a in user_accounts],
        total_balance=total_balance,
    )


@accounts_bp.route("/accounts/<int:account_id>", methods=["GET"])
@login_required
def account_detail(account_id):
    account = get_owned_account(account_id)
    if not account:
        return jsonify(error="Account not found"), 404
    return jsonify(account=account.to_dict())


@accounts_bp.route("/accounts/<int:account_id>/transactions", methods=["GET"])
@login_required
def account_transactions(account_id):
    account = get_owned_account(account_id)
    if not account:
        return jsonify(error="Account not found"), 404

    limit = int(request.args.get("limit", 20))
    transactions = (
        Transaction.query.filter_by(account_id=account.id)
        .order_by(Transaction.timestamp.desc())
        .limit(limit)
        .all()
    )
    return jsonify(transactions=[t.to_dict() for t in transactions])


@accounts_bp.route("/accounts/<int:account_id>/statement", methods=["GET"])
@login_required
def statement(account_id):
    account = get_owned_account(account_id)
    if not account:
        return jsonify(error="Account not found"), 404

    days = int(request.args.get("days", 30))
    since = datetime.utcnow() - timedelta(days=days)
    transactions = (
        Transaction.query.filter(
            Transaction.account_id == account.id, Transaction.timestamp >= since
        )
        .order_by(Transaction.timestamp.desc())
        .all()
    )

    if request.args.get("format") == "csv":
        rows = ["Date,Type,Category,Description,Amount,Balance After"]
        for t in transactions:
            rows.append(
                f"{t.timestamp.strftime('%Y-%m-%d %H:%M')},{t.type},{t.category},"
                f"{t.description},{t.amount},{t.balance_after}"
            )
        csv_data = "\n".join(rows)
        return (
            csv_data,
            200,
            {
                "Content-Type": "text/csv",
                "Content-Disposition": f"attachment; filename=statement_{account.account_number}.csv",
            },
        )

    return jsonify(
        account=account.to_dict(),
        days=days,
        transactions=[t.to_dict() for t in transactions],
    )


@accounts_bp.route("/transfer", methods=["POST"])
@login_required
def transfer():
    data = request.get_json(silent=True) or {}

    try:
        from_account_id = int(data.get("from_account"))
        amount = float(data.get("amount"))
    except (TypeError, ValueError):
        return jsonify(error="Invalid input"), 400

    to_account_number = (data.get("to_account_number") or "").strip()
    description = data.get("description") or "Fund transfer"

    from_account = get_owned_account(from_account_id)
    if not from_account:
        return jsonify(error="Source account not found"), 404

    if amount <= 0:
        return jsonify(error="Amount must be greater than zero"), 400

    if from_account.balance < amount:
        return jsonify(error="Insufficient balance"), 400

    to_account = Account.query.filter_by(account_number=to_account_number).first()
    if not to_account:
        return jsonify(error="Beneficiary account not found"), 404

    if to_account.id == from_account.id:
        return jsonify(error="Cannot transfer to the same account"), 400

    from_account.balance -= amount
    db.session.add(Transaction(
        account_id=from_account.id, type="debit", category="transfer",
        amount=amount, description=f"Transfer to {to_account.account_number}: {description}",
        balance_after=from_account.balance,
    ))

    to_account.balance += amount
    db.session.add(Transaction(
        account_id=to_account.id, type="credit", category="transfer",
        amount=amount, description=f"Transfer from {from_account.account_number}: {description}",
        balance_after=to_account.balance,
    ))

    db.session.commit()
    return jsonify(message="Transfer successful", from_account=from_account.to_dict()), 200


@accounts_bp.route("/billers", methods=["GET"])
@login_required
def list_billers():
    billers = Biller.query.all()
    return jsonify(billers=[b.to_dict() for b in billers])


@accounts_bp.route("/billpay", methods=["POST"])
@login_required
def billpay():
    data = request.get_json(silent=True) or {}

    try:
        account_id = int(data.get("account_id"))
        biller_id = int(data.get("biller_id"))
        amount = float(data.get("amount"))
    except (TypeError, ValueError):
        return jsonify(error="Invalid input"), 400

    account = get_owned_account(account_id)
    if not account:
        return jsonify(error="Account not found"), 404

    biller = Biller.query.get(biller_id)
    if not biller:
        return jsonify(error="Biller not found"), 404

    if amount <= 0:
        return jsonify(error="Amount must be greater than zero"), 400

    if account.balance < amount:
        return jsonify(error="Insufficient balance"), 400

    account.balance -= amount
    db.session.add(Transaction(
        account_id=account.id, type="debit", category="billpay",
        amount=amount, description=f"Bill payment: {biller.name}",
        balance_after=account.balance,
    ))
    db.session.add(BillPayment(account_id=account.id, biller_id=biller.id, amount=amount))
    db.session.commit()

    return jsonify(message="Bill payment successful", account=account.to_dict()), 200
