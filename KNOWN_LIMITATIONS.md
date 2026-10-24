# Known Limitations

NIRBHAYA is a local development prototype and support tool. It is **not** an emergency service, a verified professional network, a forensic tool, or a production identity provider.

This document lists what the application does not do. If a limitation could affect your safety, read it before relying on the feature.

---

## 1. Emergency response

| Limitation | Impact | What would be required |
| :--- | :--- | :--- |
| SOS opens `tel:112`; it does not call or dispatch help. | If you cannot complete the call, no help is summoned. | A native mobile app with call-state verification, or a monitored service with a real dispatch contract. |
| SMS alerts are drafts opened in your messaging app. | Nothing is sent until you press send; delivery is never confirmed. | An SMS gateway (e.g. Twilio/Gupshup) with delivery receipts and explicit consent. |
| The siren is local browser audio. | It is not monitored and cannot notify anyone. | A monitored alarm hardware/service integration. |
| Check-in expiry is informational. | No one is alerted automatically when a timer expires. | Server-side scheduling, reliable messaging, and an escalation policy. |
| Journey overdue is a banner only. | No contact is notified when an ETA passes. | Server-side journey monitoring and consent-based notifications. |
| Closing the tab stops timers and location polling. | A check-in or journey can silently stop. | Native background execution or server-side timers. |
| Browser notifications require permission and may be blocked. | Alerts may not appear. | Native push notifications with fallback channels. |

**If you are in immediate danger, call 112 (India) or your local emergency number. Do not wait for NIRBHAYA.**

---

## 2. Accounts and identity

| Limitation | Impact | What would be required |
| :--- | :--- | :--- |
| No email ownership verification. | Anyone can register with an email they do not control. | Verification email + token flow. |
| No phone ownership verification. | Phone numbers are format-checked only. | OTP/SMS verification. |
| No MFA. | A stolen password grants access. | TOTP/WebAuthn. |
| No session revocation list. | Changing a password does not sign out other sessions. | Server-side session/version table and “sign out all devices.” |
| No account lockout beyond rate limiting. | Rate limiting slows but does not stop distributed guessing. | Distributed rate limiting, lockout, and anomaly detection. |
| No CSRF token. | SameSite=Lax + Origin checks reduce risk but are not a complete CSRF scheme. | Token-based CSRF protection. |
| No email delivery. | Password reset cannot email a link. | Email provider integration. |
| Development reset-token exposure. | If `EXPOSE_DEV_RESET_TOKEN=True` publicly, anyone who can request a reset for a known email may receive a token in the response. | Set it to `False`; send tokens by email. |
| No OAuth/SSO. | Users must create a NIRBHAYA password. | OAuth/OIDC integration. |
| Account deletion is password-confirmed but not reversible. | Accidental deletion is permanent. | Grace period/export flow, if desired. |

---

## 3. Location and sharing

| Limitation | Impact | What would be required |
| :--- | :--- | :--- |
| Coordinates are device estimates. | They can be wrong, delayed, or spoofed. | Cross-checking, trusted hardware, or professional tracking. |
| Public share links are bearer tokens. | Anyone with the link can read an active share. | Short-lived links, passphrases, and access logging. |
| Owner secrets live in `sessionStorage`. | Clearing the session loses the ability to update/stop; the link remains until expiry. | Server-side owner authentication or encrypted persistent storage. |
| No automatic link delivery. | You must copy and send the link yourself. | Messaging integration with consent. |
| No background updates. | Coordinates update only when you press “Update coordinates” or keep the relevant flow active. | Native background location or a server-side device agent. |
| OpenStreetMap receives coordinates to render maps. | A third party sees the map area. | Self-hosted tiles or a privacy-preserving map provider. |
| No live facility dataset. | “Nearby” facilities and distances are not available. | A maintained, licensed, geocoded facility feed with freshness guarantees. |
| Expired/stopped shares still return metadata (label/message/timestamps). | Some non-coordinate context remains visible by token. | Shorter retention or full deletion after expiry. |

---

## 4. Deepfake and media inspection

| Limitation | Impact | What would be required |
| :--- | :--- | :--- |
| No neural deepfake detector. | Authenticity is always reported as `not_determined`. | A trained, independently evaluated model or licensed forensic service. |
| Only file signatures and EXIF metadata are inspected. | Metadata can be stripped, edited, or forged. | Frame-level, audio, and provenance analysis. |
| Video/audio get container checks only. | No frame or signal forensics. | Real media forensics pipeline. |
| `DEEPFAKE_DETECTOR_URL` is not used to transmit media. | Configuring it does not enable detection. | A reviewed adapter with consent, retention, and accuracy disclosure. |
| No chain-of-custody or hash certification. | Results are not forensic evidence. | Hashing, signed timestamps, and examiner procedures. |
| Uploaded files are deleted after inspection. | You must keep the original separately. | User-controlled secure evidence storage, if desired. |

---

## 5. Digital Guardian and AI

| Limitation | Impact | What would be required |
| :--- | :--- | :--- |
| Digital Guardian is keyword matching. | It can miss abuse and flag benign text; it is not a verdict. | Validated classifiers with bias/false-positive testing, or human review. |
| No psychological or threat assessment. | The app cannot judge intent or danger. | Professional risk assessment. |
| AI Assistant is not a lawyer, therapist, or dispatcher. | Advice may be incomplete or wrong. | Licensed human services and clear escalation. |
| External AI is optional and consent-gated. | Without keys, only static local guidance is available. | Provider contracts, data-processing agreements, and privacy review. |
| External provider data handling is outside NIRBHAYA's control. | Sensitive messages may be retained by the provider. | Provider due diligence and user disclosure. |
| Local engine responses are static. | They do not adapt to complex situations. | Retrieval, safety-tuned models, and human oversight. |
| No conversation persistence server-side. | Chat history is in memory for the session. | Deliberate encrypted history, if desired. |

---

## 6. Legal, support, and resource data

| Limitation | Impact | What would be required |
| :--- | :--- | :--- |
| Lawyer cards are fictional samples. | They are not real lawyers and cannot be contacted. | A vetting, consent, and maintenance process; bar-council verification. |
| Listener cards are fictional samples. | No counselor or peer network is connected. | A real service with safeguarding and training. |
| No case management or referral. | Support notes are not delivered to anyone. | Backend intake, consent, and partner integrations. |
| Helpline numbers are static. | Numbers/hours can change. | Runtime verification or a maintained directory. |
| Empowerment scheme summaries are informational. | Eligibility and benefits are not confirmed. | Official API/data feed and legal review. |
| Legal guides are general information. | They are not legal advice and may become outdated. | Qualified legal review and versioning. |
| Evidence Vault is not a certified evidence system. | Records may not meet evidentiary standards. | Forensic handling, hashing, chain of custody, and legal guidance. |
| Section 65B/63 references are informational. | Admissibility depends on facts and procedure. | A lawyer and forensic examiner. |

---

## 7. News and awareness content

| Limitation | Impact | What would be required |
| :--- | :--- | :--- |
| No live news feed. | The app cannot show current incidents or advisories. | A licensed news API with source attribution and moderation. |
| Articles are evergreen guidance. | They are not dated reporting. | Editorial process and freshness tracking. |
| No fact-checking pipeline. | Content may become outdated. | Review cadence and source verification. |
| Bookmarks are local only. | They do not sync across devices. | Account-backed sync. |

---

## 8. Local data and privacy

| Limitation | Impact | What would be required |
| :--- | :--- | :--- |
| Local records are unencrypted. | Anyone with device/browser access can read them. | OS-level encryption, encrypted storage, or a native secure enclave. |
| No cloud sync. | Data is tied to one browser profile. | Encrypted sync with key management. |
| Clearing browser data deletes records. | There is no recovery. | Export/backup workflow and encrypted remote backup. |
| Local wipe does not delete the account or server shares. | Server data remains until account deletion. | A combined “delete everything” flow. |
| Quick Exit cannot erase browser history. | A monitored device may still show the visit. | Native app privacy controls or a safer device. |
| Discreet mode only reduces some identifiers. | It is not a disguise and does not hide the app. | Native disguise/secure folder support. |
| Local data is scoped by account ID, but the browser profile is shared. | Another user of the same browser profile may access data if they can run scripts or inspect storage. | Separate OS/browser profiles or encrypted storage. |
| No audit log of local access. | You cannot tell who opened the browser profile. | OS-level auditing. |

---

## 9. Browser and device constraints

| Limitation | Impact | What would be required |
| :--- | :--- | :--- |
| Geolocation requires permission and often HTTPS. | Location features may fail on HTTP or denied permission. | HTTPS deployment and clear fallback. |
| Web Audio may be blocked until a user gesture. | The siren may not start on the first tap. | Native audio APIs. |
| `tel:`/`sms:` behaviour varies by OS/browser. | The dialer or composer may not open as expected. | Native app integration. |
| No offline PWA/service worker. | The app may not load without network after first use. | Service worker and offline cache. |
| No background execution. | Timers stop when the tab closes. | Native background tasks. |
| No push notification infrastructure. | Browser notifications are best-effort. | Push service with VAPID keys. |

---

## 10. Accessibility and localization

| Limitation | Impact | What would be required |
| :--- | :--- | :--- |
| No formal WCAG audit. | Some flows may be difficult for assistive-technology users. | Audit with screen readers and keyboard-only testing. |
| Only English and Hindi UI strings are translated. | Other selected languages fall back to English. | Complete translation and review. |
| Some custom controls are styled buttons/divs. | Semantics may be incomplete. | Component-level accessibility review. |
| No high-contrast or large-text mode beyond browser settings. | Low-vision users may struggle. | Theme and typography controls. |
| No RTL layout support. | Right-to-left languages are not fully supported. | RTL layout work. |

---

## 11. Testing and quality

| Limitation | Impact | What would be required |
| :--- | :--- | :--- |
| No ESLint configuration. | Style/consistency issues are not automatically caught. | Add ESLint and a `lint` script. |
| No browser E2E tests. | UI regressions can slip through. | Playwright/Cypress suite. |
| No visual regression tests. | Layout changes are not automatically checked. | Screenshot testing. |
| No load/performance tests. | Concurrency behaviour is unknown. | k6/Locust and profiling. |
| No formal penetration test. | Security weaknesses may remain. | Independent security review. |
| No dependency CVE scan. | Vulnerable packages may be present. | `npm audit`, `pip-audit`, Dependabot/Renovate. |
| Backend tests do not cover rate limits, origin checks, reset flow, upload limits, or migrations. | Those paths are less protected against regression. | Add targeted tests. |
| Frontend tests cover only three service areas. | Most components are untested. | Component and integration tests. |

---

## 12. Deployment and operations

| Limitation | Impact | What would be required |
| :--- | :--- | :--- |
| Development servers only. | Flask’s dev server is not for production. | WSGI server + reverse proxy + TLS. |
| Dev servers bind to loopback (`127.0.0.1`) by default. | If you set `NIRBHAYA_HOST`/`NIRBHAYA_DEV_HOST` to `0.0.0.0`, the unencrypted dev UI and API are reachable by other devices on the network. | Keep loopback for local use; use TLS and authentication before LAN/public exposure. |
| No HTTPS configuration. | Cookies and location APIs may be insecure/unavailable. | TLS termination and `SESSION_COOKIE_SECURE=True`. |
| SQLite only. | Limited concurrency and no built-in replication. | Managed database and backups. |
| In-memory rate limiting. | Resets on restart and is per-process. | Redis or gateway-level limiting. |
| No backups or migrations framework. | Data loss risk; schema changes are manual. | Backup policy and migration tooling. |
| No monitoring/alerting. | Failures may go unnoticed. | Metrics, logs, uptime checks. |
| No audit logging. | Security incidents are hard to investigate. | Structured, privacy-minimised audit logs. |
| No secret manager. | Secrets live in `.env`. | Vault/cloud secret manager. |
| No retention policy enforcement. | Data may be kept longer than intended. | Automated retention/deletion jobs. |
| No privacy policy or terms. | Users lack formal notice. | Legal review and published policies. |

---

## 13. What would make NIRBHAYA production-ready

At minimum:

1. Real email delivery and verification.
2. A monitored SOS channel with verified delivery, or explicit removal of any implication of one.
3. Session revocation and MFA.
4. HTTPS, secure cookies, production WSGI, managed database, backups, monitoring.
5. Distributed rate limiting and CSRF tokens.
6. Encrypted local storage or a native secure store.
7. A verified, consented professional network if directories are to be real.
8. A maintained facility dataset if map pins are to be real.
9. A trained, independently evaluated deepfake detector if authenticity claims are to be made.
10. Accessibility, security, load, and E2E testing.
11. Privacy policy, retention policy, incident response, and legal review.

Until these exist, treat NIRBHAYA as a **support and planning tool**, not a safety guarantee.
