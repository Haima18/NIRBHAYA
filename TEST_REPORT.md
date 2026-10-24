# Test Report

**Report date:** 2026-10-24  
**Baseline commit:** `7319d2b`  
**Post-repair state:** working tree / audit repair commit  
**Environment:** Windows, Node.js 20.18.0, npm 10.8.2, Python 3.13.14

This report records what was actually executed. It does not claim tests that were not run.

---

## 1. Summary

| Check | Command | Result |
| :--- | :--- | :--- |
| Frontend production build + type check | `cd frontend && npm run build` | **PASS** |
| Frontend unit tests | `cd frontend && npm test` | **PASS** — 4 files, 13 tests |
| Backend unit/API tests | `cd backend && python -m unittest discover -s tests -v` | **PASS** — 17 tests |
| Live API smoke test | Start `python app.py`; `GET /api/health`, `GET /api/status` | **PASS** |
| Lint | — | **NOT RUN** — no ESLint config/script |
| Browser E2E / visual regression | — | **NOT RUN** — no Playwright/Cypress suite |
| Load/performance test | — | **NOT RUN** |
| Formal security/penetration test | — | **NOT RUN** |
| Dependency CVE scan | — | **NOT RUN** |

---

## 2. Frontend build

Command:

```powershell
cd frontend
npm run build
```

Actual output (abridged):

```text
> nirbhaya-frontend@1.0.0 build
> tsc && vite build

vite v5.4.21 building for production...
✓ 2011 modules transformed.
dist/index.html                 1.28 kB │ gzip:   0.73 kB
dist/assets/index-CfTTaxG1.css  7.70 kB │ gzip:   2.68 kB
dist/assets/index-Da9y9J8g.js 542.69 kB │ gzip: 149.22 kB

(!) Some chunks are larger than 500 kB after minification.
✓ built in 6.19s
```

Interpretation:

- `tsc` completed with no TypeScript errors.
- Vite produced a production bundle.
- The only warning is the >500 kB JavaScript chunk. It is not a failure; code-splitting is future work.

---

## 3. Frontend tests

Command:

```powershell
cd frontend
npm test
```

Actual output (abridged):

```text
 RUN  v2.1.9

 ✓ src/tests/analyzer.test.ts (5 tests)
 ✓ src/tests/location.test.ts  (3 tests)
 ✓ src/tests/notifications.test.ts (2 tests)
 ✓ src/tests/pathway.test.ts   (3 tests)

 Test Files  4 passed (4)
      Tests  13 passed (13)
   Duration  0.83s
```

### Test inventory

| File | Tests | What is verified |
| :--- | :--- | :--- |
| `src/tests/analyzer.test.ts` | 5 | Critical blackmail/extortion detection; physical-threat detection; sexual-solicitation detection; benign message returns low risk; empty/null input does not crash. |
| `src/tests/location.test.ts` | 3 | Haversine distance in the expected range; Google Maps URL generation; no fabricated facility distances/coordinates. |
| `src/tests/notifications.test.ts` | 2 | SOS drafts use only SOS-enabled contacts; missed-check-in drafts use the check-in flag and do not include location. |
| `src/tests/pathway.test.ts` | 3 | Domestic-abuse plan has immediate-safety steps; urgent flag for immediate danger; at least 10 situations including blackmail and deepfake abuse. |

### Coverage gaps

Not covered by automated frontend tests:

- React component rendering and user interaction.
- Auth pages and route guards.
- Siren Web Audio behaviour.
- Check-in timer persistence/expiry across reload.
- Journey geolocation polling.
- Location-share UI lifecycle.
- Settings/profile forms.
- Evidence Vault CRUD and print export.
- Responsive layout, focus states, reduced motion.
- Accessibility semantics and screen-reader behaviour.

---

## 4. Backend tests

Command:

```powershell
cd backend
python -m unittest discover -s tests -v
```

Actual output (abridged):

```text
test_account_deletion_purges_shares_and_session ... ok
test_ai_chat_requires_account_consent ... ok
test_deepfake_inspection_reports_not_determined_and_retains_no_file ... ok
test_forgot_password_token_is_hidden_unless_explicitly_exposed ... ok
test_location_share_cannot_be_updated_by_another_account ... ok
test_location_share_is_token_protected_and_can_be_stopped ... ok
test_location_share_requires_authentication_and_consent ... ok
test_login_rejects_wrong_password_and_accepts_correct_password ... ok
test_password_change_requires_current_password_and_invalidates_old_one ... ok
test_password_is_required_and_short_password_is_rejected ... ok
test_profile_bio_and_preferences_are_persisted ... ok
test_registration_persists_account_and_starts_session ... ok
test_ai_guidance_fallback ... ok
test_ai_guidance_handles_empty_input ... ok
test_text_analyzer_benign ... ok
test_text_analyzer_extortion ... ok
test_text_analyzer_handles_empty_input ... ok

----------------------------------------------------------------------
Ran 17 tests in 3.864s

OK
WARNING: SECRET_KEY is not configured. Using an ephemeral development key.
```

The warning is expected: the test environment does not set `SECRET_KEY`. Tests use a temporary SQLite database and disable rate limiting in `setUp`.

### Test inventory

**`backend/tests/test_auth.py` — 12 tests**

| Test | What is verified |
| :--- | :--- |
| `test_registration_persists_account_and_starts_session` | 201 response, user payload, authenticated `/api/auth/me`. |
| `test_password_is_required_and_short_password_is_rejected` | Short password returns 400. |
| `test_login_rejects_wrong_password_and_accepts_correct_password` | 401 for wrong password; 200 for correct. |
| `test_profile_bio_and_preferences_are_persisted` | Bio, language, Quick Exit, AI/location/discreet preferences persist. |
| `test_password_change_requires_current_password_and_invalidates_old_one` | Wrong current password fails; old password stops working; new password works. |
| `test_ai_chat_requires_account_consent` | 403 without consent; 200 after enabling consent. |
| `test_location_share_is_token_protected_and_can_be_stopped` | Create, public read, no owner token leak, stop, coordinates cleared. |
| `test_location_share_requires_authentication_and_consent` | 401 anonymous; 403 without location consent. |
| `test_location_share_cannot_be_updated_by_another_account` | A different signed-in account cannot update a share even with the owner token; coordinates stay unchanged. |
| `test_forgot_password_token_is_hidden_unless_explicitly_exposed` | No token in the response by default; explicit development exposure returns a working single-use token. |
| `test_account_deletion_purges_shares_and_session` | Wrong password fails; deletion clears session; share returns 404. |
| `test_deepfake_inspection_reports_not_determined_and_retains_no_file` | `not_determined`, detector not configured, `mediaRetained: false`, PNG signature detected. |

**`backend/tests/test_services.py` — 5 tests**

| Test | What is verified |
| :--- | :--- |
| `test_text_analyzer_extortion` | Extortion text returns critical risk with patterns. |
| `test_text_analyzer_benign` | Benign text returns low risk. |
| `test_text_analyzer_handles_empty_input` | `None` input does not crash. |
| `test_ai_guidance_fallback` | Danger query mentions 112 and suggests actions. |
| `test_ai_guidance_handles_empty_input` | Empty input uses the local engine. |

### Coverage gaps

Not covered by automated backend tests:

- Rate limiting thresholds and 429 responses.
- Origin rejection (403) for disallowed state-changing origins.
- Security headers.
- Password-reset token expiry (creation, single use, and development exposure are covered).
- CORS preflight.
- Upload size limit (413).
- Invalid file extension/signature.
- Video/audio inspection paths.
- SQLite migration from older schemas.
- Concurrent requests and thread safety.
- Production server behaviour.

---

## 5. Live API smoke test

A real Flask process was started from `backend/` with `python app.py`, then queried over HTTP.

```powershell
$proc = Start-Process -FilePath python -ArgumentList 'app.py' -WorkingDirectory . -PassThru -WindowStyle Hidden
Start-Sleep -Seconds 5
Invoke-RestMethod http://localhost:5000/api/health
Invoke-RestMethod http://localhost:5000/api/status
Stop-Process -Id $proc.Id -Force
```

Actual responses:

```json
{"platform":"NIRBHAYA Women Safety Platform API","status":"healthy","version":"1.1.0"}
```

```json
{"aiProvidersConfigured":[],"deepfakeDetectorConfigured":false,"emailDeliveryConfigured":false,"externalAiConfigured":false,"locationShareMaxMinutes":1440,"locationShareMinMinutes":5,"rateLimitEnabled":true}
```

This confirms the repaired API starts and reports capability status without exposing secrets.

**Note:** A stale baseline backend (version `1.0.0`) was found listening on port 5000 during this audit and was stopped before the smoke test. If port 5000 is occupied on your machine, stop the older process before running the repaired API.

---

## 6. Manual verification performed

| Area | Check | Result |
| :--- | :--- | :--- |
| Repository state | `git status`, `git diff --stat` reviewed | Baseline plus audit repairs identified. |
| Build output | `dist/` produced; no TypeScript errors | Pass |
| Test isolation | Backend tests use temp DB and disable rate limiting | Pass (observed in test setup) |
| API process | Health/status endpoints over real HTTP | Pass |
| Secret handling | `/api/status` returns booleans/lists, not keys | Pass |
| Port hygiene | Stale v1.0.0 process identified and stopped | Pass |
| Documentation | Seven required docs present; README rewritten | Pass |

Manual verification **not** performed:

- Clicking through every page in a real browser.
- Mobile viewport visual inspection.
- Screen-reader or keyboard-only navigation audit.
- Actual geolocation permission prompts.
- Actual siren audio output on hardware.
- Actual `tel:`/`sms:` app handoff on a phone.
- Actual location-share link opened on a second device.
- Password-reset email (no email provider exists).
- External AI provider calls (no keys configured).
- Deepfake video/audio upload beyond the PNG unit test.

---

## 7. Known warnings and non-failures

| Warning | Meaning | Action |
| :--- | :--- | :--- |
| `Some chunks are larger than 500 kB` | Single JS bundle is 541.84 kB minified. | Optional code-splitting; not a build failure. |
| `SECRET_KEY is not configured` during tests | Test environment leaves it unset. | Expected; production must set it. |
| PowerShell exit code 1 with no output | Often caused by `Get-NetTCPConnection` finding no listener. | Check the actual command output, not only `$LASTEXITCODE`. |
| Git LF→CRLF warnings | Windows line-ending normalization. | Harmless. |

---

## 8. How to reproduce

```powershell
cd frontend
npm install
npm run build
npm test

cd ..\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m unittest discover -s tests -v
```

To run the app:

```powershell
# Terminal 1
cd backend
python app.py

# Terminal 2
cd frontend
npm run dev
```

Open `http://localhost:3000`.

---

## 9. Bottom line

The repaired code **builds, type-checks, and passes all existing automated tests**. The tested safety-critical behaviours are: auth/consent enforcement, password change, account deletion purge, location-share lifecycle, deepfake `not_determined` reporting, and temp-media non-retention.

The application is **not fully tested** for browser interaction, accessibility, load, or production security. Those gaps are listed above and in [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md).
