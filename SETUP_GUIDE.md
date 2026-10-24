# Setup Guide

This guide runs NIRBHAYA locally on Windows, macOS, or Linux. Commands are shown for PowerShell; the equivalent shell commands work elsewhere.

NIRBHAYA has two processes:

- **Flask API** — `http://localhost:5000`
- **Vite frontend** — `http://localhost:3000`

Vite proxies `/api` to the backend, so the browser talks to one origin during development.

---

## 1. Prerequisites

| Tool | Minimum | Verified in this audit |
| :--- | :--- | :--- |
| Node.js | 18 | 20.18.0 |
| npm | 9 | 10.8.2 |
| Python | 3.10 | 3.13.14 |
| Git | Optional | Used for history/commits |

No database server is required. SQLite is embedded.

---

## 2. Get the code

```powershell
cd C:\path\to\NIRBHAYA
```

If you are cloning:

```powershell
git clone <repository-url> NIRBHAYA
cd NIRBHAYA
```

---

## 3. Backend setup

### 3.1 Create and activate a virtual environment

**Windows PowerShell:**

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks activation:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
```

### 3.2 Install dependencies

```powershell
pip install -r requirements.txt
```

### 3.3 Create the environment file

```powershell
Copy-Item .env.example .env
```

Edit `backend/.env` and set at least a stable secret:

```dotenv
SECRET_KEY=replace-with-a-long-random-value
```

Generate one:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

For local HTTP development, keep:

```dotenv
SESSION_COOKIE_SECURE=False
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Both development servers bind to `127.0.0.1` by default. Set `NIRBHAYA_HOST=0.0.0.0` (backend) and `NIRBHAYA_DEV_HOST=0.0.0.0` (frontend, as a shell environment variable) only when you intentionally need LAN access.

For local password-reset testing only:

```dotenv
EXPOSE_DEV_RESET_TOKEN=True
```

**Never enable `EXPOSE_DEV_RESET_TOKEN` on a public deployment.** Email delivery is not implemented.

### 3.4 Start the API

```powershell
python app.py
```

Expected output:

```text
NIRBHAYA backend running on http://localhost:5000
```

If `SECRET_KEY` is empty, the app prints a warning and uses an ephemeral key. Sessions will be invalidated on every restart.

### 3.5 Verify the API

In another terminal:

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Expected:

```json
{
  "status": "healthy",
  "platform": "NIRBHAYA Women Safety Platform API",
  "version": "1.1.0"
}
```

Capability status:

```powershell
Invoke-RestMethod http://localhost:5000/api/status
```

This reports whether email, AI providers, a deepfake detector, and rate limiting are configured. It does not expose keys.

---

## 4. Frontend setup

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

The frontend has **no required environment variables**. Do not put API keys in the frontend or in `frontend/.env`.

### Production build (optional)

```powershell
npm run build
npm run preview
```

`npm run build` runs `tsc` first, so TypeScript errors fail the build.

---

## 5. First-run walkthrough

1. Open `http://localhost:3000`.
2. Create an account with a name/alias, email, phone, and password of at least 8 characters.
3. You are redirected to the dashboard.
4. Open **Settings**:
   - Set a Quick Exit URL.
   - Enable location consent only if you want to create location shares.
   - Leave AI consent off unless you have configured a provider key and understand the data flow.
5. Open **Physical Safety**:
   - Add a trusted contact (stored only in this browser).
   - Try the siren at low volume first.
   - Start a check-in timer and confirm safe.
6. Open **Evidence Vault** and create a test record. Export/print it to verify the summary.
7. Open **Settings → Delete account** only when you are finished testing; deletion is permanent.

---

## 6. Demo script that does not overclaim

Use this sequence to demonstrate the repaired behaviour honestly.

1. **Dashboard** — point out the notice: the siren is local and SOS opens the dialer.
2. **Siren** — start and stop it. State that it is a local alarm, not a monitored service.
3. **SOS** — tap the SOS button. Show that the dialer opens and an SMS draft is prepared. State clearly that nothing has been sent and no one has been notified.
4. **Check-in timer** — start a short timer, let it expire, show that the app offers a manual alert draft rather than claiming automatic escalation.
5. **Location share** — enable consent in Settings, create a 15-minute share, copy the link, open it in a private window, then stop the share and show that coordinates are cleared.
6. **Digital Guardian** — use the fictional sample text. Explain that it is keyword matching, not a verdict.
7. **Deepfake Detective** — upload a test image. Show `not_determined` and the metadata-only explanation.
8. **Evidence Vault** — create and export a record. Point out the unencrypted-local-storage notice.
9. **Legal Support / HerCircle** — show the fictional sample labels and the official NALSA/181/KIRAN links.
10. **Safety News** — show that articles are labelled evergreen awareness, not live reporting.

---

## 7. Running tests

### Frontend

```powershell
cd frontend
npm test
```

Expected: 4 test files, 13 tests passed.

### Backend

```powershell
cd backend
python -m unittest discover -s tests -v
```

Expected: 17 tests passed. The tests use a temporary SQLite database and disable rate limiting.

### Full verification

```powershell
cd frontend
npm run build
npm test

cd ..\backend
python -m unittest discover -s tests -v
```

There is no lint script. If you add ESLint later, add a `lint` script and document it here.

---

## 8. Password reset (development only)

1. Go to `/forgot-password`.
2. Enter the account email.
3. If the account exists and `EXPOSE_DEV_RESET_TOKEN=True`, the response includes a development-only token.
4. Open the reset link, choose a new password, and sign in.

What is real:

- The token is single-use, hashed at rest, expires after `RESET_TOKEN_TTL_MINUTES` (default 30), and invalidates earlier unused tokens.

What is not real:

- No email is sent. There is no email provider integration.

For production, connect an email provider, set `EXPOSE_DEV_RESET_TOKEN=False`, and send the token by email instead of returning it in the API response.

---

## 9. Optional integrations

### External AI (Gemini / OpenAI / Anthropic)

Set one or more keys in `backend/.env`:

```dotenv
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

Then:

1. Restart the backend.
2. Sign in and enable **Allow external AI processing** in Settings or the AI Assistant.
3. Check `GET /api/ai/status` to confirm the provider is detected.

Without keys, the local rule-based engine answers and is labelled as such. With keys but no account consent, `/api/ai/chat` returns 403.

### Deepfake detector

`DEEPFAKE_DETECTOR_URL` is reserved for a future adapter. **This build does not transmit media to that URL.** Leave it empty. The UI will continue to report `not_determined`.

### Email / SMS

Not implemented. Password reset email and automatic SOS SMS require new provider integrations and explicit user consent design.

---

## 10. Data locations

| Data | Location |
| :--- | :--- |
| Accounts, preferences, reset tokens, location shares | `backend/nirbhaya_accounts.sqlite3` (default) |
| Temporary media uploads | `backend/temp_uploads/` (deleted after inspection) |
| Incidents, contacts, check-ins, journeys, plans, notes | Browser `localStorage`, scoped by account ID |
| Location-share owner secrets | Browser `sessionStorage` |
| Auth session cache | Browser `localStorage` + HttpOnly server cookie |

`*.sqlite3`, `temp_uploads/`, `.env`, `node_modules/`, and `dist/` are ignored by git.

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
| :--- | :--- | :--- |
| `The account service is unreachable` | Backend not running or wrong port | Start `python app.py`; confirm port 5000. |
| Login succeeds then immediately expires | `SECRET_KEY` is empty and the backend restarted | Set a stable `SECRET_KEY` in `backend/.env`. |
| CORS or origin error | Frontend origin not allowed | Add it to `CORS_ORIGINS`, comma-separated. |
| Location share creation returns 403 | Location consent is off | Enable it in Settings. |
| Location share creation fails | Browser geolocation denied/unavailable | Allow location for `localhost`; HTTPS is required by some browsers outside localhost. |
| Siren is silent | Browser autoplay policy or muted device | Tap the siren button again; raise volume; check mute. |
| Password reset shows no token | `EXPOSE_DEV_RESET_TOKEN=False` or unknown email | For local testing, set it to `True`; production needs email delivery. |
| `413` on media upload | File exceeds 50 MB | Use a smaller file. |
| Build warns about chunk size | Single JS bundle > 500 kB | Warning only; not a build failure. Code-splitting is future work. |
| `npm test` cannot find tests | Wrong directory | Run from `frontend/`. |
| Backend tests touch the real DB | Wrong working directory or test config | Run from `backend/`; tests override `AUTH_DATABASE`. |

---

## 12. Production checklist (not included)

Before any public deployment, you must add:

- HTTPS and `SESSION_COOKIE_SECURE=True`.
- A persistent, random `SECRET_KEY` from a secret manager.
- `EXPOSE_DEV_RESET_TOKEN=False` plus real email delivery.
- A production WSGI server and reverse proxy.
- Managed database, backups, migrations, and monitoring.
- Session revocation on password change.
- Email/phone verification.
- Distributed rate limiting.
- Security review, dependency scanning, and load testing.
- A verified resource/vetting process if lawyer/listener directories are ever presented as real.
- Clear privacy policy, retention policy, incident response, and legal review.

Until then, treat NIRBHAYA as a **local development prototype**, not a production safety service.
