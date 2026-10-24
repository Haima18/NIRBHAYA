# Architecture

NIRBHAYA is a two-process web application with a local-first data model.

- **Frontend:** React 18, TypeScript, Vite, React Router v6, Lucide icons, CSS custom properties.
- **Backend:** Flask 3, Flask-CORS, SQLite, Pillow, Requests, python-dotenv.
- **Optional outbound:** Gemini / OpenAI / Anthropic (AI), OpenStreetMap (maps).

The architecture was preserved during the audit and the later visual passes. No framework migration was performed; the redesign changed presentation, not routes, API contracts, storage, or safety logic.

---

## 1. High-level diagram

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Browser (http://localhost:3000)                                     │
│                                                                     │
│  React Router                                                       │
│   ├─ Public: /welcome /login /signup /forgot-password              │
│   │           /reset-password /share/:token                         │
│   └─ Protected PageLayout                                           │
│        ├─ Dashboard, Map, Profile, Settings                         │
│        ├─ Physical Safety (siren, SOS, check-in, journey, shares)   │
│        ├─ Digital Guardian, Privacy Shield, Deepfake Detective      │
│        ├─ Pathway, HerCircle, Legal Support, Evidence Vault         │
│        └─ AI Assistant, Safety News, Empowerment, Directory         │
│                                                                     │
│  Services / hooks                                                   │
│   ├─ authService  ───────────────┐                                  │
│   ├─ locationShareService ───────┤                                  │
│   ├─ aiService ──────────────────┤  fetch('/api/...', credentials) │
│   ├─ deepfakeService ────────────┤                                  │
│   ├─ storageService (localStorage)│                                 │
│   └─ notificationService (tel/sms)│                                 │
└───────────────────────────────────┼─────────────────────────────────┘
                                    │ Vite proxy in development
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Flask API (http://localhost:5000)                                   │
│                                                                     │
│  app.py                                                             │
│   ├─ security middleware: origin check, headers, rate limit         │
│   ├─ /api/auth/*        → auth_service                              │
│   ├─ /api/location-shares/* → location_share_service                │
│   ├─ /api/ai/*          → ai_provider                               │
│   ├─ /api/deepfake/analyze → deepfake_inspector                     │
│   ├─ /api/digital-guardian/analyze → text_analyzer                  │
│   └─ /api/health, /api/status                                       │
│                                                                     │
│  SQLite: users, password_resets, location_shares                    │
│  Temp:   temp_uploads/ (deleted after inspection)                   │
└─────────────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
  Optional AI providers          OpenStreetMap (browser iframe)
```

---

## 2. Frontend structure

```text
frontend/src/
├── app/
│   ├── main.tsx              # React root, session restore
│   ├── App.tsx               # RouterProvider
│   └── router.tsx            # Public/protected routes
├── components/
│   ├── layout/               # PageLayout, Header, Sidebar, Footer, QuickExitBar, AuthShell
│   ├── sanctuary/            # ButterflyScene, ButterflyFallback, ValleyBackdrop, Reveal
│   └── ui/                   # Button, Card, Input, Modal, Tabs, Alert, Badge, ...
├── features/
│   ├── auth/                 # Login, SignUp, ForgotPassword, ResetPassword
│   ├── welcome/              # Public landing page
│   ├── dashboard/
│   ├── physical-safety/      # SOS, siren, check-in, journey, contacts, shares
│   ├── location-share/       # PublicSharePage
│   ├── map/
│   ├── digital-guardian/
│   ├── privacy-shield/
│   ├── deepfake-detective/
│   ├── nirbhaya-pathway/
│   ├── hercircle/
│   ├── legal-support/
│   ├── evidence-vault/
│   ├── ai-assistant/
│   ├── safety-news/
│   ├── empowerment/
│   ├── emergency-directory/
│   ├── settings/
│   └── profile/
├── hooks/                    # useAuth, useSiren, useCheckInTimer, useJourney
├── localization/             # English/Hindi strings, language preference
├── services/
│   ├── api/                  # resources, pathway, privacy, digital guardian
│   ├── auth/                 # server auth client
│   ├── ai/                   # AI chat client
│   ├── location/             # geolocation, shares
│   ├── media-analysis/       # media upload client
│   ├── news/                 # evergreen articles
│   ├── notifications/        # tel/sms/browser notification helpers
│   ├── storage/              # scoped localStorage
│   └── audio/                # Web Audio helpers
├── styles/                   # tokens.css, sanctuary.css, globals.css
├── tests/                    # Vitest unit tests
├── types/                    # shared TypeScript types
└── utils/                    # printable incident summary
```

### Routing and guards

`router.tsx` defines:

- **Public-only:** `/login`, `/signup`, `/forgot-password`, `/reset-password` redirect authenticated users to `/`.
- **Public:** `/welcome`, `/share/:token`.
- **Protected:** everything under `/` renders inside `PageLayout`; unauthenticated users are redirected to `/login` with the intended path in router state.
- **Catch-all:** redirects to `/`.

Session state is held by `authService` and exposed through `useAuth`. On load, `restoreSession()` calls `/api/auth/me`; the HttpOnly cookie is the authority, while a local cache enables fast rendering.

### Design system

- `styles/tokens.css` contains colors, spacing, radii, shadows, typography, and layout dimensions. Typography is Playfair Display for headings/italic accents and Inter Tight for navigation, controls, forms, and safety information, with system fallbacks.
- `styles/sanctuary.css` owns the loader, auth frame, and shared sanctuary styles. `styles/landing.css` owns the public `mh-*` hero: the full-bleed scene, grid, nav, headline, polaroid, watermark, and responsive/reduced-motion rules.
- `styles/globals.css` imports the token, sanctuary, and landing layers, then defines the application shell, shared primitives, and the fill-up hover used by the standard `.btn` family.
- `PageLayout` owns the navigation shell; feature pages render through `<Outlet />`.
- UI primitives in `components/ui/` are reusable across modules.
- `components/sanctuary/` still holds the Three.js butterfly, SVG valley, and `Reveal` wrapper, but the landing no longer imports them. The loader uses the butterfly image directly.
- The public landing is a one-screen editorial hero over a supplied portrait; the authenticated application stays light and high-contrast for safety readability. Responsive rules, `:focus-visible`, and reduced-motion handling apply to both.

### Landing and motion boundaries

- `/welcome` is public and does not depend on session state. Its grid, nav, headline, polaroid, watermark, and entrance sequence are presentation only.
- The hero uses the supplied CloudFront photo, polaroid, and 4.04 s loop. Two muted videos alternate and crossfade the last second into the first so the loop never jumps or reverses.
- The video fades in once its first frame is ready and is removed entirely for reduced motion, leaving the photo.
- The frame is scaled from a 1155x767 composition with `--u = min(100vw/1155, (100svh - Quick Exit)/767)`; phones use the full viewport below the Quick Exit bar with no scrolling.
- SOS (`tel:112`), the siren, and Quick Exit never route through decorative motion, and they keep their own z-index above the hero.
- The landing imports no Three.js scene, so the main bundle does not wait for one.

---

## 3. Backend structure

```text
backend/
├── app.py                       # Flask app, routes, middleware
├── config.py                    # environment-driven configuration
├── requirements.txt
├── .env.example
├── services/
│   ├── auth_service.py          # users, migrations, reset, change, delete
│   ├── location_share_service.py# token shares, expiry, revocation, purge
│   ├── ai_provider.py           # local fallback + optional providers
│   ├── deepfake_inspector.py    # signature/EXIF inspection only
│   └── text_analyzer.py         # server-side heuristic analyzer
├── tests/
│   ├── test_auth.py             # 12 account/API tests
│   └── test_services.py         # 5 service tests
├── temp_uploads/                # ignored; deleted after inspection
└── nirbhaya_accounts.sqlite3    # ignored; created at runtime
```

### Request middleware

1. **Origin enforcement** — for `POST`, `PUT`, `PATCH`, `DELETE`, if an `Origin` header is present, it must match `CORS_ORIGINS`.
2. **Rate limiting** — per-IP, in-memory buckets:
   - auth: 20 requests / 60s
   - AI: 30 / 60s
   - media: 10 / 60s
   - location-share creation: 20 / 60s
3. **Security headers** — `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, `Permissions-Policy`, and `Cache-Control: no-store` for `/api/*`.
4. **JSON/body validation** — routes require JSON objects where applicable and enforce length limits.

---

## 4. API reference

### Health and capability status

| Method | Path | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | No | Liveness and version. |
| `GET` | `/api/status` | No | Booleans/lists for email, AI providers, detector, rate limiting, share limits. No secrets. |

### Accounts

| Method | Path | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | No | Create account, start session. |
| `POST` | `/api/auth/login` | No | Authenticate, start session. |
| `GET` | `/api/auth/me` | Yes | Current user or 401. |
| `PUT` | `/api/auth/profile` | Yes | Update name/email/phone/bio/preferences. |
| `PATCH` | `/api/auth/preferences` | Yes | Update preferences only. |
| `PUT` | `/api/auth/password` | Yes | Change password with current password. |
| `DELETE` | `/api/auth/account` | Yes | Password-confirmed deletion + share purge. |
| `POST` | `/api/auth/forgot-password` | No | Create reset token; optional dev exposure. |
| `POST` | `/api/auth/reset-password` | No | Consume token and set new password. |
| `POST` | `/api/auth/logout` | No | Clear session. |

### Location sharing

| Method | Path | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/location-shares` | Yes + location consent | Create expiring share; returns public token and owner token. |
| `GET` | `/api/location-shares` | Yes | List the account's 20 most recent shares. |
| `PATCH` | `/api/location-shares/<token>` | Yes + owner token | Update coordinates. |
| `POST` | `/api/location-shares/<token>/stop` | Yes + owner token | Revoke and clear coordinates. |
| `GET` | `/api/location-shares/<token>/public` | No | Public read by random token; hides coordinates when inactive. |

### AI and analysis

| Method | Path | Auth | Purpose |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/ai/chat` | Yes + AI consent | Local or external guidance. |
| `GET` | `/api/ai/status` | No | Configured providers and fallback label. |
| `POST` | `/api/digital-guardian/analyze` | No | Server-side heuristic text analysis. |
| `POST` | `/api/deepfake/analyze` | Yes | Multipart media inspection; temp file deleted. |

---

## 5. Data model

### SQLite `users`

| Column | Type | Notes |
| :--- | :--- | :--- |
| `id` | INTEGER PK | Internal numeric ID; exposed as `usr_<id>`. |
| `name` | TEXT | Required. |
| `email` | TEXT UNIQUE NOCASE | Required; format validated. |
| `phone` | TEXT UNIQUE | Required; 7–15 digits after normalization. |
| `password_hash` | TEXT | Werkzeug salted hash. |
| `created_at` | TEXT | Default `CURRENT_TIMESTAMP`. |
| `bio` | TEXT | Up to 500 chars. |
| `preferred_language` | TEXT | Default `English`. |
| `ai_processing_consent` | INTEGER 0/1 | Server-enforced for external AI. |
| `location_consent` | INTEGER 0/1 | Server-enforced for share creation/update. |
| `discreet_mode` | INTEGER 0/1 | UI preference only. |
| `quick_exit_url` | TEXT | Validated `http(s)` URL. |

Older databases are migrated by adding missing columns in `initialize_auth_database()`.

### SQLite `password_resets`

| Column | Notes |
| :--- | :--- |
| `id` | PK |
| `user_id` | FK to users |
| `token_hash` | SHA-256 of the token; unique |
| `expires_at` | ISO UTC |
| `used` | 0/1 |
| `created_at` | ISO UTC |

### SQLite `location_shares`

| Column | Notes |
| :--- | :--- |
| `id` | PK |
| `token` | Random public token, unique |
| `owner_hash` | SHA-256 of the separate owner secret |
| `user_id` | Owner |
| `recipient_label`, `message` | Display metadata |
| `created_at`, `expires_at`, `updated_at` | ISO UTC |
| `last_lat`, `last_lng`, `accuracy_m` | Nullable coordinates |
| `revoked` | 0/1 |

### Browser `localStorage` (scoped by account ID)

- Profile cache and auth session cache.
- Incidents.
- Trusted contacts.
- Active check-in and journey.
- Pathway plans.
- HerCircle support notes, safe-place plan, document checklist.
- Legal consultation notes.
- Text analyses and deepfake reports.
- Saved news IDs.

### Browser `sessionStorage`

- Location-share owner secrets, keyed by public token.

---

## 6. Key flows

### 6.1 Registration and login

```text
Form → authService → POST /api/auth/register|login
     → validate → hash/check password → SQLite
     → session['user_id'] = id (HttpOnly cookie)
     → user payload → local profile cache → dashboard
```

Session restore calls `/api/auth/me`; a 401 clears the local cache.

### 6.2 SOS

```text
User taps SOS
  → notificationService.triggerEmergencyDialer() → window.location = 'tel:112'
  → if location consent: geolocation → coordinates
  → buildTrustedContactsDraft(enabled contacts, coords)
  → UI shows "dialer opened" + optional SMS draft
  → user must open SMS app and press send
```

No server call is required. `deliveryConfirmed` is always `false`.

### 6.3 Check-in

```text
startSession(minutes) → localStorage
  → 1s tick → remaining seconds
  → 0 → status='expired' persisted
  → UI shows manual "prepare alert" action
  → no SMS is opened automatically
```

### 6.4 Journey

```text
startJourney(destination, eta) → geolocation (optional) → localStorage
  → 20s poll → append waypoint (max 50)
  → overdue check every 15s → informational banner
  → confirm arrival/cancel clears local journey
```

Sharing is separate: the user must create a location-share link.

### 6.5 Location share

```text
Consent check (server)
  → POST /api/location-shares {minutes, recipientLabel, location?}
  → server generates public token + owner token
  → owner token stored in sessionStorage
  → public link /share/<token> copied by user
  → recipient GET /api/location-shares/<token>/public
  → coordinates returned only while active
  → owner PATCH updates, POST /stop revokes + clears
  → expiry/revocation hides coordinates
```

### 6.6 External AI

```text
AI Assistant → POST /api/ai/chat
  → require session
  → require users.ai_processing_consent = 1
  → if no provider key: local engine
  → if provider key: try configured providers in order
  → on failure: labelled local fallback
```

Keys never leave the server. Provider status is exposed via `/api/ai/status`.

### 6.7 Media inspection

```text
Upload → 50 MB cap → extension allow-list → temp file
  → signature check vs. extension
  → image decode/pixel cap/EXIF (images)
  → video/audio container notice
  → authenticityStatus = 'not_determined'
  → temp file deleted in finally
```

---

## 7. Trust boundaries

| Boundary | Trusted? | Notes |
| :--- | :--- | :--- |
| Browser `localStorage` | **No** | Readable by anyone with device/browser access; unencrypted. |
| Browser `sessionStorage` | **No** | Same; owner secrets are lost when session ends. |
| Client-supplied consent flags | **No** | Server stores and enforces consent for AI and shares. |
| Location public token | **Bearer secret** | Anyone with the link can read an active share. Treat links as sensitive. |
| Location owner token | **Bearer secret** | Required to update/stop; stored only in the browser session. |
| Flask session cookie | **Signed, HttpOnly** | SameSite=Lax; Secure only when configured. |
| SQLite file | **Server-local** | Contains PII and password hashes; protect filesystem access. |
| AI provider | **Third party** | Receives message content only after consent and configuration. |
| OpenStreetMap | **Third party** | Receives coordinates when a map is rendered. |

---

## 8. Security model summary

- Password hashing with Werkzeug.
- HttpOnly, SameSite=Lax session cookie; optional Secure.
- Origin allow-list for state-changing requests.
- SameSite cookie as the primary CSRF mitigation; no CSRF token.
- Per-IP in-memory rate limits.
- Input length/type/range validation.
- Upload extension allow-list, signature checks, 50 MB cap, pixel cap.
- Temp media deletion in `finally`.
- No endpoint to list or search shares publicly.
- Owner secret separated from public token and hashed at rest.
- Account deletion purges account, resets, shares, and coordinates.
- Security headers on all responses.
- No secrets in frontend code.

**Not implemented:** email/phone verification, session revocation list, MFA, CSRF tokens, encrypted local storage, audit log, anomaly detection, distributed rate limiting, production secret management.

---

## 9. Deployment topology (recommended future state)

```text
Client
  │ HTTPS
  ▼
Reverse proxy / TLS termination
  ├─ /            → static frontend build (dist/)
  └─ /api/*       → WSGI server (gunicorn/waitress) → Flask
                                             │
                                             ├─ managed PostgreSQL/SQLite
                                             ├─ secret manager
                                             ├─ email provider
                                             └─ optional AI provider
```

The current repository only includes the development topology: Vite on 3000 and Flask on 5000. See [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md) before deploying.

---

## 10. Replaceability of the visual layer

The original separation-of-concerns design remains:

1. **Tokens** — `styles/tokens.css` controls colors, spacing, typography, radii, shadows.
2. **Layout shell** — `components/layout/` controls navigation and page chrome.
3. **UI primitives** — `components/ui/` controls buttons, cards, inputs, modals, tabs, alerts, badges.
4. **Feature pages** — consume services/hooks and render into `<Outlet />`.

A visual redesign can therefore be done without changing backend contracts or feature logic.
