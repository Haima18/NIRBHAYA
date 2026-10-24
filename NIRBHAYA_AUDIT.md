# NIRBHAYA Audit Report

**Audit date:** 2026-10-24  
**Baseline commit:** `7319d2b` — *Baseline snapshot before audit repairs*  
**Scope:** Existing React/Flask/SQLite application, all feature modules, API routes, data flows, safety claims, and documentation.  
**Outcome:** The application was repaired in place, then visually redesigned as *The Living Lavender Sanctuary*. The React + Flask + SQLite architecture, all routes, API contracts, and safety logic were preserved.

> This was a product, safety-claim, and application-security review performed by reading the source and running the test suites. It was **not** a formal penetration test, dependency CVE audit, load test, or legal compliance review.

---

## 1. Audit method

1. Read the baseline README, feature pages, services, hooks, Flask routes, and storage layer.
2. Ran the baseline frontend and backend test suites.
3. Traced every safety-critical claim to an implementation:
   - SOS, siren, SMS, check-in escalation, journey tracking.
   - Location collection, sharing, expiry, and revocation.
   - Account creation, login, recovery, password change, deletion.
   - Lawyer/listener verification, news freshness, facility data.
   - Deepfake detection and AI-provider behaviour.
4. Checked where data lives (server vs. browser), what leaves the device, and whether consent is enforced server-side.
5. Repaired code and wording, then re-ran the build and both test suites.
6. Wrote the seven required documents and rewrote the README.

**Baseline verification:** frontend build passed; 11 frontend tests passed; 8 backend tests passed.  
**Post-repair verification:** frontend build passed; 11 frontend tests passed; 15 backend tests passed. See [TEST_REPORT.md](TEST_REPORT.md).

---

## 2. What existed before the audit

The baseline already contained a substantial, working prototype:

- React 18 + TypeScript + Vite frontend with a lavender/butterfly visual identity.
- Flask API with SQLite account storage and Werkzeug password hashing.
- Login and registration pages, a dashboard, and 14+ feature pages.
- Web Audio siren, `tel:112` link, check-in timer, journey tracking, fake-call modal.
- Local incident journal, trusted contacts, privacy checklist, Pathway guidance, helplines.
- Rule-based text analysis, media metadata inspection, and an AI fallback engine.
- Local storage export/wipe and a printable incident summary.

The prototype's problem was not a lack of screens. It was that several screens and the README **claimed safety outcomes the code could not deliver**, and several flows were incomplete or insecure.

---

## 3. Findings and remediation

Severity reflects potential harm to a user who trusts the claim, not only technical exploitability.

| ID | Severity | Finding in baseline | Repair |
| :--- | :--- | :--- | :--- |
| A1 | **Critical** | SOS/README implied automatic SMS dispatch and emergency response. The browser can only open a dialer or SMS composer; delivery cannot be confirmed. | Every SOS result now separates `actionInitiated` from `deliveryConfirmed: false`. UI states that 112 must be dialled and the SMS draft must be sent manually. |
| A2 | **Critical** | Lawyer and listener directories presented fictional people as verified professionals. | All records renamed to "Sample advocate/listener profile", marked `isVerifiedSample: false`, and labelled as fictional layouts. Official NALSA/State Legal Services and government helplines are the real routes. |
| A3 | **Critical** | "Deepfake Detective" implied synthetic-media detection and authenticity scoring. | Backend now performs only signature/metadata inspection and returns `authenticityStatus: "not_determined"`. UI explains that no detector is bundled. |
| A4 | **High** | News module presented fabricated headlines, publishers, and dates as current reporting. | Replaced with five evergreen awareness articles labelled "NIRBHAYA awareness library" with official source links and no fake dates. |
| A5 | **Critical** | Check-in timer implied automatic escalation to contacts on expiry. | Expiry now only surfaces a manual "prepare alert" action. No SMS opens or sends automatically. Persisted expired state survives reload. |
| A6 | **High** | Profile/settings claimed a duress PIN and hidden code word. No such mechanism existed. | Removed the claims and controls. Settings explicitly states NIRBHAYA does not offer a duress PIN or code word. |
| A7 | **High** | No password recovery, no password change, no account deletion, weak session configuration. | Added single-use expiring reset tokens, authenticated password change, password-confirmed account deletion, HttpOnly/SameSite cookies, configurable secure cookies, and session lifetime. Reset-token exposure defaults to off and requires explicit `EXPOSE_DEV_RESET_TOKEN=True` for local testing. |
| A8 | **High** | No real location sharing; map interaction risked implying consent; no expiry/revocation model. | Added server-backed, consent-gated location shares with random public tokens, separate owner secrets, 5–1440 minute expiry, manual updates, revocation, and coordinate clearing. Updates and revocation also require the authenticated share owner, not only the owner token. |
| A9 | **High** | Evidence Vault wording implied encryption/certified evidence. Attachments were not handled. | Vault now supports create/edit/delete/search/print, stores attachment **names only**, and states clearly that records are unencrypted local data, not certified evidence. |
| A10 | **High** | External AI consent was client-side only; a caller could bypass it. | `/api/ai/chat` now requires a signed-in account with `ai_processing_consent` enabled server-side. Provider status is exposed without keys. |
| A11 | **High** | No rate limiting, origin checks, or security headers on state-changing routes. | Added per-IP in-memory rate limits for auth/AI/media/share creation, Origin allow-listing for state-changing requests, and `nosniff`, `DENY`, `no-referrer`, permissions policy, and no-store headers. |
| A12 | **High** | Account deletion left server-side location shares and coordinates behind. | Deletion now purges the user, reset tokens, all shares, and coordinates, then clears the session. Covered by a test. |
| A13 | **High** | Map/README implied verified nearby facilities and pins. No nationwide geocoded facility feed exists. | Removed facility claims. Map shows only user-requested geolocation in OpenStreetMap and links to official directories. All distances/coordinates in the resource list remain `null`. |
| A14 | **Medium** | README claimed 100% offline operation while geolocation, maps, and optional AI require network access. | README now distinguishes offline-capable local tools from network-dependent features. |
| A15 | **Medium** | Password-change success text could imply other sessions were revoked. | Text now says existing sessions are not revoked automatically. |
| A16 | **Medium** | Stale Supabase configuration and integration variables remained in env examples despite no Supabase integration. | Removed stale variables; documented that no frontend secret belongs in the frontend env file. |
| A17 | **Medium** | Mobile layout, focus visibility, and reduced-motion support were incomplete. | Added responsive sidebar/header rules, `:focus-visible` styles, and `prefers-reduced-motion` handling. |
| A18 | **Medium** | Sample/demo data was not consistently labelled across pages. | Added explicit sample/fictional labels on lawyer, listener, empowerment, and news content. |
| A19 | **Low** | Frontend had no lint configuration; type checking was only implicit. | Documented the absence of ESLint. `npm run build` runs `tsc` and is the type-check gate. |
| A20 | **Medium** | Missed-check-in drafts used the SOS recipient flag, so a contact enabled only for check-ins could be omitted. | Draft construction now takes an explicit `sos`/`checkin` selection, and a frontend test covers both paths. |

---

## 4. Safety-claim policy adopted

The repair applies one rule consistently:

> A safety feature may describe an **action the user can take** and an **action the app actually performed**. It may not describe an outcome the app cannot verify.

Consequences:

- "Opened the dialer" is allowed; "help is on the way" is not.
- "SMS draft opened" is allowed; "contacts notified" is not.
- "Keyword match found" is allowed; "this is a crime" is not.
- "Metadata inspected" is allowed; "deepfake detected" is not.
- "Sample layout" is allowed; "verified lawyer" is not.
- "Evergreen guidance" is allowed; "breaking news" is not.

---

## 5. Security controls added or verified

| Control | Implementation |
| :--- | :--- |
| Password storage | Werkzeug salted password hashes; no plaintext passwords. |
| Session cookie | HttpOnly, SameSite=Lax, optional Secure, 30-day permanent lifetime. |
| Session secret | `SECRET_KEY` from environment; ephemeral key with a startup warning if unset. |
| CSRF resistance | SameSite=Lax plus Origin allow-listing for POST/PUT/PATCH/DELETE. No token-based CSRF scheme. |
| Rate limiting | In-memory per-process buckets: auth 20/min, AI 30/min, media 10/min, share creation 20/min. |
| Input validation | JSON object checks, length limits, coordinate range checks, email/phone/password validation, upload extension allow-list. |
| Upload safety | 50 MB request cap, signature validation, image pixel cap, temp file deleted in `finally`. |
| Location privacy | Public token only for read; separate owner secret for update/stop; no listing endpoint without authentication; coordinates hidden when expired/revoked. |
| AI privacy | Server-side consent check; keys never sent to the browser; provider failures fall back to a labelled local engine. |
| Response headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cache-Control: no-store` on API routes. |
| Account deletion | Password-confirmed, purges account, reset tokens, shares, and coordinates. |

---

## 6. Verification after repair

| Check | Result |
| :--- | :--- |
| `cd frontend && npm run build` | **Passed** — `tsc` clean; Vite built 2,011 modules; 541.84 kB JS (148.99 kB gzip); chunk-size warning only. |
| `cd frontend && npm test` | **Passed** — 4 files, 13 tests. |
| `cd backend && python -m unittest discover -s tests -v` | **Passed** — 17 tests. |
| Deepfake retention test | **Passed** — `mediaRetained: false`, `authenticityStatus: not_determined`. |
| Location-share lifecycle test | **Passed** — create, public read, stop, coordinates cleared. |
| Account-deletion purge test | **Passed** — shares return 404 after deletion. |
| AI consent test | **Passed** — 403 without consent, 200 after consent. |

---

## 7. Residual risk

These are known and documented, not silently accepted:

1. **No production deployment hardening.** No HTTPS termination, reverse proxy, WAF, managed database, backups, or monitoring is included.
2. **No email or SMS provider.** Password recovery cannot deliver email; SOS cannot send SMS automatically.
3. **No identity verification.** Email and phone are validated for format/uniqueness, not ownership.
4. **No session revocation list.** Changing a password does not invalidate other signed-in sessions.
5. **No encrypted local storage.** Anyone with access to the browser profile or device can read local records.
6. **No neural deepfake detection.** Metadata checks can be inconclusive and are not forensic proof.
7. **No verified resource dataset.** Lawyer/listener cards are fictional; facility distances are null; helpline numbers are static and may change.
8. **No formal security testing.** No penetration test, dependency CVE scan, fuzzing, or load test was performed.
9. **Rate limiting is per-process and in-memory.** It resets on restart and does not coordinate across workers.
10. **Browser limits remain.** Closed tabs stop timers; history cannot be erased; geolocation can be denied, delayed, or spoofed.

See [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md) for the full user-facing list.

---

## 8. Conclusion

The baseline was a broad, visually complete prototype with unsafe overclaims. The repaired build keeps the same architecture and design while making its behaviour, storage, and limitations legible. The most important outcome is not a new feature count; it is that **a user can now tell what the application did, what it did not do, and what they must do themselves**.

---

## 9. Redesign pass — The Living Lavender Sanctuary

A subsequent design pass rebuilt the presentation layer. It did not change the audit conclusions above.

### What changed

- New lavender/peach/cyan design tokens and editorial typography (Playfair Display + Inter Tight after the motion pass; the first pass used Cormorant Garamond + Manrope).
- Branded loading screen used only during the real session-restore request; no simulated progress.
- New public landing page at `/welcome` with a layered SVG valley and a genuine lazy-loaded Three.js butterfly (with an image fallback when WebGL is unavailable).
- Restyled application shell: header, grouped sidebar, footer, Quick Exit bar, dashboard, auth pages, and all shared UI primitives.
- Unauthenticated protected routes now redirect to `/welcome` while carrying the intended internal path; sign-in returns the user there.

### What did not change

- Every route, API endpoint, request/response shape, storage key, and safety flow.
- SOS (`tel:112`) and siren remain separate, immediate, and independent of the loader and decorative scene.
- All honest claims and sample-data labels from the audit remain in place.
- No new external integration was added or claimed.

### Decorative-layer honesty

The valley and butterfly are atmosphere, not safety infrastructure. The landing page states that emergency shortcuts remain available without an account, and the fallback copy explains when still artwork is shown. A WebGL failure, slow chunk load, or blocked image never disables SOS, siren, navigation, or any feature route.

### Redesign verification

| Check | Result |
| :--- | :--- |
| `cd frontend && npm run build` | **Passed** — TypeScript clean; 2,019 modules; CSS 75.98 kB; main JS 550.41 kB; lazy butterfly chunk 516.39 kB; chunk-size warning only. |
| `cd frontend && npm test` | **Passed** — 13 tests. |
| `cd backend && python -m unittest discover -s tests -v` | **Passed** — 17 tests. |
| Lighthouse on `/welcome` (development server) | Accessibility **100**, Best Practices **100**, SEO **100**. |
| Manual desktop/mobile visual QA | Landing, dashboard, auth, Physical Safety, Evidence Vault, Settings. |
| WebGL fallback | Forced by disabling WebGL context creation; fallback artwork rendered and copy changed. |
| Siren | Started and stopped from the header; no console errors. |
| Protected-route redirect | `/settings` while signed out → `/welcome` → `/login`. |

### Residual redesign risks

1. The Three.js chunk is large (≈516 kB, ≈132 kB gzip) and should be code-split further if the landing becomes a primary acquisition page.
2. The valley is an original SVG interpretation, not the supplied reference photograph.
3. Reduced motion is implemented in CSS and `matchMedia` but was not tested with a real OS-level assistive setting or a screen reader.
4. The landing page was audited with Lighthouse on a development server; production hosting, caching, and compression may change the result.

See [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md) §6–7 for the full redesign and motion inventory.

---

## 10. Editorial motion pass

A second presentation pass applied the supplied editorial/motion references to the public landing page and the shared interaction language. It did not change the audit conclusions, routes, API contracts, data model, or safety logic.

### What changed

- `/welcome` is now a dark cinematic editorial composition: fixed scroll-aware nav, full-screen overlay menu, mixed sans/serif hero, peach status star, tilted polaroid, vertical side words, scroll cue, giant italic watermark, and reveal-on-scroll content sections.
- Typography moved to Playfair Display (headings, italic accents, watermark) and Inter Tight (navigation, controls, body, safety information).
- `components/sanctuary/Reveal.tsx` adds a one-shot IntersectionObserver reveal that respects reduced motion.
- The shared `.btn` family gained a subtle fill-up hover. The `danger` and `emergency` variants were deliberately excluded so emergency controls keep their solid, immediate treatment.
- The overlay menu traps focus, locks background scrolling, restores focus, and includes a `tel:112` route.

### What did not change

- Every feature, route, API shape, storage key, auth rule, and safety flow.
- SOS (`tel:112`), siren, and Quick Exit remain immediate and independent of decorative motion, the reveal observer, and the 3D scene.
- Quick Exit and the floating SOS sit above the overlay menu in z-order and stay clickable while it is open.
- All honest claims, limits, and sample-data labels remain intact. No third-party fashion/portfolio media is hotlinked.

### Verification

| Check | Result |
| :--- | :--- |
| `cd frontend && npm run build` | **Passed** — TypeScript clean; 2,019 modules; CSS 75.98 kB; main JS 550.41 kB; lazy butterfly chunk 516.39 kB; chunk-size warning only. |
| `cd frontend && npm test` | **Passed** — 13 tests. |
| `cd backend && python -m unittest discover -s tests -v` | **Passed** — 17 tests. |
| Lighthouse on `/welcome` (development server) | Accessibility **100**, Best Practices **100**, SEO **100**. |
| Manual desktop/mobile visual QA | 1440×960 and 390 px landing, overlay menu and focus handoff, section reveals, mobile nav grouping, dashboard, auth, Physical Safety, Evidence Vault, Settings. |
| WebGL fallback | Forced by disabling WebGL context creation; fallback artwork rendered and decorative copy changed. |
| Siren | Started and stopped from the header; no console errors. |
| Protected-route redirect | `/settings` while signed out → `/welcome` → `/login`. |

### Residual motion-pass risks

1. No licensed hero photograph or video matching the references is available locally; the existing butterfly image, SVG valley, and Three.js scene carry the atmosphere instead. The third-party media was not hotlinked.
2. The landing remains a long page below the first screen because NIRBHAYA’s feature, principle, and step content must remain reachable. The references were one-screen heroes.
3. The Three.js chunk remains large (≈516 kB, ≈132 kB gzip). It is decorative and never blocks safety controls.
4. Reduced motion is implemented in CSS and `matchMedia` but was not tested with a real OS-level assistive setting or a screen reader.
5. Lighthouse was run on a development server; production hosting, caching, and compression may change the result.
