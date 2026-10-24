# Environment Setup

**Verified environment:** Windows, Node.js 20.18.0, npm 10.8.2, Python 3.13.14.  
**Application version:** API `1.1.0`; frontend package `1.0.0`.

NIRBHAYA runs as two local processes. No external service is required for the core local-first experience.

---

## 1. Runtime topology

| Component | Default URL | Required? |
| :--- | :--- | :--- |
| Flask API | `http://localhost:5000` | Yes, for accounts, AI, media inspection, and location shares |
| Vite dev server | `http://localhost:3000` | Yes, for development UI |
| SQLite | `backend/nirbhaya_accounts.sqlite3` | Created automatically |
| OpenStreetMap | `https://www.openstreetmap.org` | Only when a user opens a map or public share with coordinates |
| AI provider | Gemini / OpenAI / Anthropic | Optional; local fallback otherwise |
| Email provider | None | Not configured |
| SMS/voice gateway | None | Not configured |

Vite proxies `/api` to `http://localhost:5000`; the browser sees a same-origin API in development.

---

## 2. Backend environment variables

Copy `backend/.env.example` to `backend/.env`. `.env` is git-ignored.

| Variable | Default | Required | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | `5000` | No | Flask listening port. |
| `NIRBHAYA_HOST` | `127.0.0.1` | No | Flask bind address. Loopback by default; set `0.0.0.0` only for intentional LAN access. |
| `DEBUG` | `False` | No | Flask debug mode. Keep `False` outside local development. |
| `SECRET_KEY` | empty | **Yes for persistence** | Session-signing key. Empty means an ephemeral key and a startup warning; all sessions die on restart. |
| `AUTH_DATABASE` | `backend/nirbhaya_accounts.sqlite3` | No | SQLite path for users, reset tokens, and location shares. |
| `SESSION_COOKIE_SECURE` | `False` | No | Set `True` when served over HTTPS. |
| `CORS_ORIGINS` | `http://localhost:3000,http://127.0.0.1:3000` | No | Comma-separated allowed origins. Also used by the Origin check for state-changing requests. |
| `RESET_TOKEN_TTL_MINUTES` | `30` | No | Password-reset token lifetime. |
| `EXPOSE_DEV_RESET_TOKEN` | `False` | No | **Development only.** Returns the reset token in the forgot-password response because email is not configured. Set `True` only for local testing; never publicly. |
| `GEMINI_API_KEY` | empty | No | Enables Google Gemini for AI Assistant when the account consents. |
| `OPENAI_API_KEY` | empty | No | Enables OpenAI for AI Assistant when the account consents. |
| `ANTHROPIC_API_KEY` | empty | No | Enables Anthropic for AI Assistant when the account consents. |
| `DEEPFAKE_DETECTOR_URL` | empty | No | Reserved. No adapter sends media to this URL in the current build. |
| `RATE_LIMIT_ENABLED` | `True` | No | Enables in-memory per-process rate limits. |

Fixed limits in `backend/config.py`:

| Limit | Value |
| :--- | :--- |
| `MAX_CONTENT_LENGTH` | 50 MB |
| `UPLOAD_FOLDER` | `backend/temp_uploads/` |
| `LOCATION_SHARE_MIN_MINUTES` | 5 |
| `LOCATION_SHARE_MAX_MINUTES` | 1440 (24 hours) |
| Session lifetime | 30 days |
| Cookie | HttpOnly, SameSite=Lax, optional Secure |

---

## 3. Frontend environment variables

**There are none required.** The frontend calls same-origin `/api` paths.

`frontend/.env.example` exists only to document this:

- No API keys or secrets belong in the frontend.
- If frontend and API are deployed on different origins, add a reverse proxy for `/api` or update fetch base paths **and** backend `CORS_ORIGINS` together.
- Never expose `SECRET_KEY`, AI provider keys, or reset tokens to the browser bundle.

---

## 4. Secrets policy

| Secret | Where it lives | Must never appear in |
| :--- | :--- | :--- |
| `SECRET_KEY` | `backend/.env` / deployment secret manager | Frontend, git, logs, screenshots |
| AI provider keys | `backend/.env` / secret manager | Frontend, API responses, git |
| Password hashes | SQLite | Frontend, logs |
| Password-reset token | Response only in dev; hashed in DB | Logs, analytics |
| Location owner secret | Browser `sessionStorage`; hash in DB | Public share URL, server logs |
| Location public token | Share URL and DB | Not treated as an owner credential |

`.gitignore` excludes `.env`, `*.sqlite3`, `temp_uploads/`, `node_modules/`, and `dist/`.

---

## 5. Data locations and retention

| Data | Storage | Retention |
| :--- | :--- | :--- |
| Account name/email/phone/bio | SQLite `users` | Until account deletion |
| Password hash | SQLite `users.password_hash` | Until password change or account deletion |
| Preferences (AI/location/discreet/language/Quick Exit) | SQLite `users` | Until account deletion |
| Password-reset tokens | SQLite `password_resets` (SHA-256 hash) | 30 minutes default; invalidated on use or replacement |
| Location shares and coordinates | SQLite `location_shares` | Until expiry, stop, or account deletion |
| Uploaded media | `backend/temp_uploads/` | Deleted immediately after inspection in a `finally` block |
| Incidents, contacts, check-ins, journeys, plans, notes, checklists, saved articles | Browser `localStorage` | Until user clears local records or browser data |
| Location owner secrets | Browser `sessionStorage` | Until tab/session ends or the share is stopped |
| Auth session cache | Browser `localStorage` | Until sign-out or local clear; server cookie is authoritative |

Browser-local data is scoped by account ID. It is not encrypted and is readable by anyone with access to the browser profile or device.

---

## 6. Network calls

| Destination | When | What is sent |
| :--- | :--- | :--- |
| Flask API (local) | Accounts, preferences, shares, AI, media | Credentials, preferences, share data, chat message, media file |
| Google Gemini | Only if key configured + account consent + AI chat | System prompt, up to 8 history items, current message |
| OpenAI | Same | Same |
| Anthropic | Same | Same |
| OpenStreetMap | User opens Map or a public share with coordinates | Coordinates in the embed URL / tile requests |
| No telemetry/analytics endpoint | — | None configured |

The local Digital Guardian, siren, check-in timer, journey tracking, vault, and checklists do not send data to an external AI provider.

---

## 7. Development setup (summary)

```powershell
# Backend
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# edit .env: set SECRET_KEY
python app.py

# Frontend (second terminal)
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

Full instructions and troubleshooting: [SETUP_GUIDE.md](SETUP_GUIDE.md).

---

## 8. Production configuration requirements

The current build is **not production-ready**. A production deployment needs at least:

1. **HTTPS** with `SESSION_COOKIE_SECURE=True`.
2. A stable, random `SECRET_KEY` from a secret manager.
3. `EXPOSE_DEV_RESET_TOKEN=False`.
4. Real email delivery for password reset.
5. A production WSGI server (e.g. gunicorn/waitress) behind a reverse proxy.
6. A managed database with backups and migrations, or hardened SQLite operations.
7. Distributed rate limiting (the current limiter is per-process and in-memory).
8. Session revocation on password change and a “sign out all devices” flow.
9. Email/phone verification.
10. Monitoring, audit logging with PII minimisation, and incident response.
11. A privacy policy, retention policy, and legal review.
12. A real vetting process before any lawyer/listener directory is presented as verified.
13. A trained and independently evaluated deepfake detector before any authenticity claim.
14. A verified facility dataset before any map pin or “nearby” claim.

---

## 9. Environment checklist

- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] Backend virtual environment created and activated
- [ ] `pip install -r backend/requirements.txt` succeeded
- [ ] `backend/.env` created from example
- [ ] `SECRET_KEY` set to a random value
- [ ] `CORS_ORIGINS` matches the frontend origin
- [ ] `EXPOSE_DEV_RESET_TOKEN` understood (development only)
- [ ] `npm install` succeeded in `frontend/`
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] `GET /api/health` returns `healthy`
- [ ] `npm run build` passes
- [ ] `npm test` passes
- [ ] `python -m unittest discover -s tests -v` passes
- [ ] No `.env`, database, or upload files staged in git
