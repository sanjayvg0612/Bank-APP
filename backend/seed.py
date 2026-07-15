from app import create_app
from app.models import db, User, Account, Biller

app = create_app()

with app.app_context():
    db.drop_all()
    db.create_all()

    billers = [
        Biller(name="State Electricity Board", category="Electricity"),
        Biller(name="City Water Works", category="Water"),
        Biller(name="Airtel Postpaid", category="Mobile"),
        Biller(name="Tata Sky DTH", category="DTH"),
        Biller(name="SecureBank Credit Card", category="Credit Card"),
    ]
    db.session.add_all(billers)

    user = User(username="demo", full_name="Sanjay Kumar", email="demo@example.com")
    user.set_password("demo1234")
    db.session.add(user)
    db.session.flush()

    savings = Account(
        user_id=user.id, account_number="500123456789",
        account_type="savings", balance=125000.50
    )
    current = Account(
        user_id=user.id, account_number="500987654321",
        account_type="current", balance=48000.00
    )
    db.session.add_all([savings, current])
    db.session.commit()

    print("Seeded demo user -> username: demo, password: demo1234")
    print(f"Savings account: {savings.account_number}")
    print(f"Current account: {current.account_number}")
