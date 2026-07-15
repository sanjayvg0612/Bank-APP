# SecureBank React frontend

This is a minimal Vite + React frontend that talks to the existing Flask backend at `/api`.

Quick start:

```bash
cd frontend/react-app
npm install
npm run dev
```

By default the app expects the backend API at the same origin under `/api`. You can set `window.API_BASE` in a server template or proxy `/api` to your Flask backend.

Dev proxy

- Vite is configured to proxy `/api` to `http://127.0.0.1:5000` for local development (see `vite.config.js`).

Stripe sandbox (optional)

- If you want real card top-ups using Stripe in sandbox mode, set the following env vars on the backend server:

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
```

- The backend will create a PaymentIntent and return `client_secret`. You can integrate Stripe.js or the Stripe React SDK to collect payment details and confirm the payment.

Notes

- The React app expects the backend API under `/api` on the same origin by default. For production, serve the built files with a static server and proxy `/api` to your Flask backend.
