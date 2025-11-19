# Kubex Remittance App

Kubex is a personal remittance application inspired by products like Xoom and Remitly. It consists of:

- A **Java / Spring Boot** backend (`backend/`) using PostgreSQL and strong domain modeling (auth, customer, beneficiaries, transfers, ledger, NIUM integration stubs).
- A **React + TypeScript + Vite** frontend (`frontend/`) using Material UI and a mobile-friendly, step-based send-money flow.

> Note: NIUM integration is currently stubbed for development. Real API calls can be wired later without changing the public API.

---

## 1. Prerequisites

- **Java**: 21+
- **Maven**: 3.9+
- **Node.js**: 18+ (with `npm`)
- **PostgreSQL**: 14+ running locally on port `5432`

---

## 2. Database setup (PostgreSQL)

Kubex backend expects a PostgreSQL database named `remittance` with user `remittance` and password `remittance`.

In your terminal:

```bash
psql postgres
```

Inside `psql`:

```sql
CREATE ROLE remittance WITH LOGIN PASSWORD 'remittance';
CREATE DATABASE remittance OWNER remittance;
GRANT ALL PRIVILEGES ON DATABASE remittance TO remittance;
```

Verify:

```bash
psql -U remittance -d remittance -c "SELECT 1;"
```

---

## 3. Backend (Spring Boot)

### 3.1 Configuration

The main configuration lives in `backend/src/main/resources/application.yml`.

Key settings:

- Database:
  - `jdbc:postgresql://localhost:5432/remittance`
  - `username: remittance`
  - `password: remittance`
- JWT:
  - Access token: 15 minutes
  - Refresh token: 7 days (sent as HttpOnly cookie `kubex_refresh_token`)

For **local development**, it is convenient to let Hibernate update the schema and skip Flyway:

```bash
export SPRING_FLYWAY_ENABLED=false
export SPRING_JPA_HIBERNATE_DDL_AUTO=update
```

### 3.2 Optional NIUM environment variables

NIUM calls are stubbed in development, but you can set defaults:

```bash
export NIUM_BASE_URL="https://gateway.nium.com"
export NIUM_API_KEY="DUMMY_API_KEY"
export NIUM_CLIENT_ID="DUMMY_CLIENT_ID"
export NIUM_CUSTOMER_ID="DUMMY_CUSTOMER_ID"
export NIUM_WALLET_ID="DUMMY_WALLET_ID"
```

These are not used to call NIUM yet, but the wiring is in place.

### 3.3 Run backend tests

From `backend/`:

```bash
mvn test
```

This runs:

- Unit tests for auth, customer profiles, beneficiaries, FX quoting, and transfers.
- An **end-to-end test** that:
  - Registers a user
  - Creates a customer profile
  - Marks KYC approved
  - Adds a beneficiary
  - Gets an FX quote
  - Creates a transfer and verifies it is stored in the database

### 3.4 Run the backend server

From `backend/`:

```bash
mvn spring-boot:run
```

Health check:

```bash
curl http://localhost:8080/api/health
```

You should see JSON with `"status": "UP"`.

---

## 4. Frontend (React + Vite)

The frontend lives in `frontend/` and is configured to proxy `/api` requests to `http://localhost:8080` in development.

### 4.1 Install dependencies

From `frontend/`:

```bash
npm install
```

### 4.2 Run the dev server

```bash
npm run dev
```

Open the app in your browser:

```text
http://localhost:5173
```

You should see **Kubex** with a top navigation bar and a centered card layout.

---

## 5. Using the UI end-to-end

1. **Register**
   - Click "Sign up" and create an account.
   - On success, you’ll be redirected to the send-money flow.

2. **Your details** (Profile / KYC)
   - Fill first name, last name, country of residence (ISO code, e.g. `US`), and address line 1.
   - Click **Save & continue**.
   - This creates or updates your `customer_profile` record.

3. **Beneficiary**
   - Enter beneficiary name, country (e.g. `IN`), bank and account details, payout method (e.g. `LOCAL`), and destination currency (e.g. `INR`).
   - Click **Save & continue**.
   - This adds a `beneficiary` and calls the NIUM stub client to obtain dummy NIUM IDs.

4. **Amount & FX**
   - Choose source country/currency (e.g. `US` / `USD`) and target country/currency (e.g. `IN` / `INR`).
   - Enter the amount to send.
   - Click **Get quote**.
   - This calls `/api/fx/quote`, which currently uses a stubbed NIUM client to compute a dummy rate and target amount.

5. **Review & send**
   - Review the FX details and target amount.
   - Click **Send money**.
   - This calls `/api/transfers` with an idempotency key (`clientReference`) and records:
     - A `transfer` row in PostgreSQL
     - Two `ledger_entries` representing ACH funding and internal settlement

6. **Transfers page**
   - Click **Transfers** in the top bar.
   - You will see your past transfers with status, amounts, corridor, and NIUM reference (dummy for now).

---

## 6. Inspecting data in PostgreSQL

To see what the app has written to the database:

```bash
psql -U remittance -d remittance
```

Then run queries like:

```sql
SELECT id, email, created_at FROM users;
SELECT id, first_name, last_name, kyc_status FROM customer_profiles;
SELECT id, full_name, country, payout_method, nium_beneficiary_id, nium_payout_id FROM beneficiaries;
SELECT id, source_country, target_country, source_currency, target_currency,
       source_amount, target_amount, status, nium_reference, audit_id, client_reference
FROM transfers;
SELECT id, transfer_id, account_type, entry_type, amount, currency FROM ledger_entries;
```

This is useful to validate end-to-end behavior and for debugging during development.

---

## 7. Next steps

- Replace NIUM stubs in `DefaultNiumClient` with real HTTP calls against your NIUM sandbox.
- Add a dedicated `/api/auth/refresh` endpoint to make use of the `kubex_refresh_token` HttpOnly cookie.
- Add observability (structured logs, metrics, tracing) and hardening (rate limiting, encryption at rest) for production.

For deployment to Google Cloud Platform (GCP), the backend can be containerized and run on GKE or Cloud Run, with Cloud SQL for PostgreSQL and a static frontend build served via Cloud Storage + Cloud CDN or Nginx.
