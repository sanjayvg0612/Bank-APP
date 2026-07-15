from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from flask import Response, stream_with_context
from .models import db, Account, Transaction, Biller, BillPayment, Beneficiary, Notification
import time
import os
import json

try:
    import stripe
    stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')
except Exception:
    stripe = None

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
    # Allow sending to a saved beneficiary by id
    if data.get("beneficiary_id"):
        try:
            beneficiary_id = int(data.get("beneficiary_id"))
        except (TypeError, ValueError):
            return jsonify(error="Invalid beneficiary id"), 400
        beneficiary = Beneficiary.query.filter_by(id=beneficiary_id, user_id=current_user.id).first()
        if not beneficiary:
            return jsonify(error="Beneficiary not found"), 404
        data["to_account_number"] = beneficiary.account_number

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


@accounts_bp.route('/beneficiaries', methods=['GET'])
@login_required
def list_beneficiaries():
    bens = Beneficiary.query.filter_by(user_id=current_user.id).all()
    return jsonify(beneficiaries=[b.to_dict() for b in bens])


@accounts_bp.route('/beneficiaries', methods=['POST'])
@login_required
def add_beneficiary():
    data = request.get_json(silent=True) or {}
    name = (data.get('name') or '').strip()
    account_number = (data.get('account_number') or '').strip()
    ifsc = (data.get('ifsc') or '').strip()

    if not name or not account_number:
        return jsonify(error='Name and account number are required'), 400

    ben = Beneficiary(user_id=current_user.id, name=name, account_number=account_number, ifsc=ifsc)
    db.session.add(ben)
    db.session.commit()
    return jsonify(beneficiary=ben.to_dict()), 201


@accounts_bp.route('/beneficiaries/<int:beneficiary_id>', methods=['DELETE'])
@login_required
def delete_beneficiary(beneficiary_id):
    ben = Beneficiary.query.filter_by(id=beneficiary_id, user_id=current_user.id).first()
    if not ben:
        return jsonify(error='Beneficiary not found'), 404
    db.session.delete(ben)
    db.session.commit()
    return jsonify(message='Deleted'), 200


@accounts_bp.route('/topup', methods=['POST'])
@login_required
def create_topup():
    data = request.get_json(silent=True) or {}
    try:
        amount = float(data.get('amount'))
    except (TypeError, ValueError):
        return jsonify(error='Invalid amount'), 400

    if amount <= 0:
        return jsonify(error='Amount must be > 0'), 400

    # If Stripe is configured, create a PaymentIntent
    if stripe:
        intent = stripe.PaymentIntent.create(
            amount=int(amount * 100),
            currency='inr',
            metadata={'user_id': current_user.id},
        )
        return jsonify(client_secret=intent.client_secret, id=intent.id)

    # Fallback: return a mock id for local testing
    return jsonify(client_secret=None, id=f'mock_{int(time.time())}')


@accounts_bp.route('/config', methods=['GET'])
def get_config():
    # Public config values useful to the frontend
    return jsonify(stripe_publishable_key=os.environ.get('STRIPE_PUBLISHABLE_KEY'))


@accounts_bp.route('/topup/confirm', methods=['POST'])
@login_required
def confirm_topup():
    data = request.get_json(silent=True) or {}
    payment_id = data.get('id')
    amount = float(data.get('amount') or 0)

    if not payment_id or amount <= 0:
        return jsonify(error='Invalid input'), 400

    # Credit first account for demo purposes
    account = Account.query.filter_by(user_id=current_user.id).first()
    if not account:
        return jsonify(error='No account to credit'), 400

    account.balance += amount
    db.session.add(Transaction(
        account_id=account.id, type='credit', category='topup', amount=amount,
        description=f'Top-up ({payment_id})', balance_after=account.balance
    ))
    # add notification
    db.session.add(Notification(user_id=current_user.id, message=f'Wallet topped up Rs. {amount:.2f}'))
    db.session.commit()
    return jsonify(message='Top-up credited', account=account.to_dict()), 200


@accounts_bp.route('/notifications', methods=['GET'])
@login_required
def list_notifications():
    nots = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.timestamp.desc()).limit(50).all()
    return jsonify(notifications=[n.to_dict() for n in nots])


@accounts_bp.route('/notifications/stream')
@login_required
def stream_notifications():
    def event_stream(last_id=None):
        last = int(last_id) if last_id else 0
        while True:
            rows = Notification.query.filter(Notification.user_id == current_user.id, Notification.id > last).order_by(Notification.id.asc()).all()
            for r in rows:
                last = r.id
                yield 'data: ' + json.dumps(r.to_dict()) + '\n\n'
            time.sleep(2)

    last = request.args.get('last')
    return Response(stream_with_context(event_stream(last)), mimetype='text/event-stream')


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
