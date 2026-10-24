# NIRBHAYA

**Your safety. Your voice. Your choice.**

NIRBHAYA is a women's safety, digital-privacy, and empowerment web application built with **React 18 + TypeScript + Vite** and a **Flask + SQLite** API. It combines practical safety tools, evidence journaling, awareness content, and official helpline signposting in one interface.

This repository has been audited and repaired so that the application does **not** claim capabilities it does not have. Read [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md) before relying on it in a real emergency.

---

## What NIRBHAYA is

- A local-first safety toolkit for a phone or laptop browser.
- A server-backed account system with consent-controlled location sharing.
- A structured way to preserve incident notes and prepare for conversations with police, lawyers, or support services.
- A signpost to **official** Indian helplines and legal-aid routes.

## What NIRBHAYA is not

- **Not an emergency dispatch service.** The SOS button opens `tel:112`; it does not call or notify police by itself.
- **Not a monitored alarm.** The siren is a local browser sound.
- **Not a verified lawyer, counselor, or listener directory.** Directory cards are clearly labelled sample layouts.
- **Not a live news service.** The awareness library contains evergreen guidance, not current reporting.
- **Not a deepfake detector.** It inspects file type and metadata and reports authenticity as `not_determined`.
- **Not an encrypted vault.** Local records are stored unencrypted in browser `localStorage`.
- **Not a production-hardened identity provider.** Email delivery, email/phone verification, and session revocation are not implemented.

---

## Feature status at a glance

| Area | Status | What actually works |
| :--- | :--- | :--- |
| Accounts | **Working (server-backed)** | Register, sign in, sign out, session restore, profile edit, password change, account deletion. Passwords are stored as Werkzeug hashes. |
| Password recovery | **Partial** | Single-use, expiring reset tokens are created. Email delivery is **not configured**; the token is exposed only when `EXPOSE_DEV_RESET_TOKEN=true` for local development. |
| Dashboard | **Working (local)** | Real active check-in/journey state, siren/SOS shortcuts, local record counts, awareness links. |
| Physical Safety | **Working with limits** | Offline Web Audio siren, `tel:112` dialer, check-in timer, Journey Guardian waypoints, fake-call pretext, trusted contacts, expiring location-share links. |
| Trusted contacts | **Working (local)** | Add, edit, delete, and choose which contacts are included in manually prepared SOS/check-in SMS drafts. No automatic sending. |
| Location sharing | **Working (server-backed)** | Consent-gated, random public token, separate owner secret, 5–1440 minute expiry, manual coordinate updates, revocation, and coordinate clearing. |
| Journey Guardian | **Working (local + optional share)** | Browser geolocation polling and up to 50 local waypoints; overdue state is informational. It does not alert anyone automatically. |
| Digital Guardian | **Working (local)** | Transparent keyword screen for blackmail, threats, sexual solicitation, stalking, doxxing, coercion, and impersonation. Not proof of a crime. |
| Privacy Shield | **Working (local)** | Self-assessment hardening checklist with progress tracking and official guide links. No external scanning. |
| Deepfake Detective | **Metadata inspection only** | File signature validation, image decode checks, EXIF extraction, and honest `not_determined` authenticity status. Uploaded media is deleted after inspection. |
| Pathway | **Working (static guidance)** | Situation-based action plans for 10+ scenarios with urgent-danger prompts and checklists. Not a live risk assessment. |
| HerCircle | **Local planning + sample layouts** | Private support notes, safe-place plan, and document checklist stored in the browser. Listener cards are explicitly fictional layouts. |
| Legal Support | **Information + sample layouts** | Legal-rights guidance, official NALSA/State Legal Services links, and local consultation notes. Advocate cards are fictional. |
| Evidence Vault | **Working (local)** | Create, edit, delete, search, and print/PDF-export incident records. Attachment **names** only; files are not uploaded or encrypted. |
| AI Assistant | **Working (local) / optional external** | Local rule-based guidance by default. Gemini, OpenAI, or Anthropic can be used only if a server key is configured **and** the account enables AI consent. |
| Safety News | **Evergreen awareness library** | Five general guidance articles with official source links. No fabricated headlines, publishers, or live dates. |
| Empowerment Hub | **Informational** | Government scheme summaries and official portal links. Eligibility must be confirmed with the scheme provider. |
| Emergency Directory | **Informational** | Static official helpline numbers with `tel:` links. Numbers can change; verify before relying on them. |
| Safety Map | **Working (browser-dependent)** | User-triggered geolocation shown in an OpenStreetMap embed. No verified facility pins or live facility feed. |
| Public share page | **Working** | Token-only view of an active share; shows coordinates only while active, with `noindex` metadata and a 112 link. |
| Settings | **Working (server-backed preferences)** | Profile, Quick Exit URL, language preference, AI/location/discreet-mode consents, password change, local export/wipe, account deletion. |

---

## Architecture in brief

```text
Browser (React 18 + TypeScript + Vite, port 3000)
  |  /api proxy in development
  v
Flask API (port 5000)
  |-- SQLite: users, password_resets, location_shares
  |-- Optional outbound: Gemini / OpenAI / Anthropic
  `-- Optional outbound: OpenStreetMap tiles (browser)
```

- **Server-backed:** account identity, password hash, preferences, password-reset tokens, location shares.
- **Browser-local:** incidents, trusted contacts, check-in/journey state, support notes, legal notes, privacy checklist, saved articles, owner secrets for location shares.
- **No frontend secrets.** API keys live only in `backend/.env`.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full component, data-flow, and API reference.

---

## Quick start

### Prerequisites

- Node.js 18+ (verified with Node 20.18.0)
- Python 3.10+ (verified with Python 3.13.14)
- npm

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
# Edit .env: set a stable SECRET_KEY before shared use.
python app.py
```

The API starts at `http://localhost:5000`. The SQLite file is created at `backend/nirbhaya_accounts.sqlite3` on first use.

### 2. Frontend

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`. Vite proxies `/api` to `http://localhost:5000`.

### Exact run command (two terminals)

```powershell
# Terminal 1
cd backend; python app.py

# Terminal 2
cd frontend; npm run dev
```

---

## Build and test

```powershell
cd frontend
npm run build     # tsc + vite production build
npm test          # Vitest: 4 files, 13 tests

cd ..\backend
python -m unittest discover -s tests -v   # 17 tests
```

There is no ESLint configuration or `lint` script in this repository. Type checking runs as part of `npm run build`.

Last verified: **2026-10-24** — build passed, 13/13 frontend tests passed, 17/17 backend tests passed. See [TEST_REPORT.md](TEST_REPORT.md).

---

## Configuration

Copy `backend/.env.example` to `backend/.env`. The important variables are:

| Variable | Purpose |
| :--- | :--- |
| `SECRET_KEY` | Stable random session-signing key. Required for sessions to survive restarts. |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins. |
| `SESSION_COOKIE_SECURE` | Set `True` only when serving over HTTPS. |
| `EXPOSE_DEV_RESET_TOKEN` | Development-only reset-token exposure. Set `False` publicly. |
| `GEMINI_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | Optional external AI providers. |
| `DEEPFAKE_DETECTOR_URL` | Optional detector URL; **no adapter transmits media to it in this build**. |
| `RATE_LIMIT_ENABLED` | In-memory, per-process rate limiting. |

Full details: [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) and [SETUP_GUIDE.md](SETUP_GUIDE.md).

---

## Safety and privacy principles used in this build

1. **Never fake emergency success.** Dialer, SMS, siren, check-in, and location sharing all distinguish "action initiated" from "delivery confirmed".
2. **Never fake verification.** Lawyer and listener records are labelled fictional samples; official helplines and legal-aid portals are the real route.
3. **Never fake detection.** The deepfake tool reports `not_determined`; Digital Guardian reports keyword matches, not a verdict.
4. **Consent before location or external AI.** Location shares require server-side consent; external AI requires account consent and a configured key.
5. **Data minimisation.** Uploaded media is deleted after inspection. External AI receives only the message and trimmed history the user sends.
6. **Honest local-storage wording.** The Evidence Vault is a private journal, not a certified or encrypted evidence system.

---

## Documentation

| Document | Contents |
| :--- | :--- |
| [NIRBHAYA_AUDIT.md](NIRBHAYA_AUDIT.md) | Baseline findings, severity, repairs, and residual risk |
| [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md) | Module-by-module implementation status |
| [SETUP_GUIDE.md](SETUP_GUIDE.md) | Install, run, demo, and troubleshoot |
| [ENVIRONMENT_SETUP.md](ENVIRONMENT_SETUP.md) | Variables, ports, data locations, deployment notes |
| [TEST_REPORT.md](TEST_REPORT.md) | Commands, exact results, coverage, and untested areas |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Components, data flows, API, storage, security model |
| [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md) | Everything the app does not do, and what fixing it would require |

---

## Emergency reminder

If you or someone else is in immediate danger, call **112** (India) or your local emergency number. Do not wait for a web application to summon help. NIRBHAYA is a support tool, not a substitute for emergency services.
