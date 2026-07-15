# SecureBank - backend + frontend

A bank-style web app split into a Flask REST API (`backend/`) and a static
HTML/CSS/JS frontend (`frontend/`) that talks to it.

## Run the backend

```bash
cd backend
pip install -r requirements.txt
python seed.py      # creates the demo user, accounts, and billers
python run.py        # starts the API on http://localhost:5000
```

## Run the frontend

The frontend is plain static files - serve them with any static server.
From the `frontend/` folder:

```bash
cd frontend
python -m http.server 3000
```

Then open `http://localhost:3000` in your browser.

Login with `demo` / `demo1234`.

## How they connect

- `frontend/js/api.js` has `API_BASE = "http://localhost:5000/api"` - change
  this if your backend runs elsewhere.
- The backend uses session-cookie auth via Flask-Login. `flask-cors` is
  configured with `supports_credentials=True` and a list of common local
  frontend ports (3000, 5500, 8080) in `backend/app/__init__.py` - add your
  port there if you use something else.
- All frontend `fetch` calls use `credentials: "include"` so the session
  cookie is sent on every API request.

## API endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/register | Create a user + default savings account |
| POST | /api/login | Log in (session cookie) |
| POST | /api/logout | Log out |
| GET | /api/me | Current user |
| GET | /api/accounts | List accounts + total balance |
| GET | /api/accounts/:id | Single account |
| GET | /api/accounts/:id/transactions | Recent transactions |
| GET | /api/accounts/:id/statement | Statement (add `&format=csv` to download) |
| POST | /api/transfer | Transfer funds between accounts |
| GET | /api/billers | List billers |
| POST | /api/billpay | Pay a bill |

## Deploying separately

Since backend and frontend are now independent, this maps directly onto the
CI/CD pipeline setup: the backend can go through the Docker/EKS pipeline
stages, and the frontend can be built as static files and served from S3 +
CloudFront - which is a common real-world split for this kind of app.

Running on a single EC2 instance (without Nginx)

- You can run the Flask backend and Node frontend as separate services on the EC2 instance. Example systemd unit files are provided under `deploy/systemd/` — review and adjust paths and environment variables before enabling them.

Stripe sandbox notes

- To enable Stripe sandbox for top-ups, set `STRIPE_SECRET_KEY` on the backend environment. The backend will create a PaymentIntent; integrate Stripe.js on the frontend if you want to collect real card details.
 
Frontend config endpoint

- The backend exposes `GET /api/config` which returns `stripe_publishable_key` when set. The React app will fetch this key automatically for the Top-up page. Set both environment variables on the backend before starting it:

```bash
export STRIPE_SECRET_KEY="sk_test_..."
export STRIPE_PUBLISHABLE_KEY="pk_test_..."
```

For Windows PowerShell use `$env:STRIPE_SECRET_KEY = 'sk_test_...'`.
