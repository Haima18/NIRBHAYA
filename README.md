# NIRBHAYA — Complete Women’s Safety, Digital Privacy & Empowerment Platform

> **Tagline:** *Your safety. Your voice. Your choice.*

NIRBHAYA is an independent, modular technology platform designed to help women respond to physical danger, online harassment, cyberstalking, privacy violations, AI-generated deepfakes, domestic abuse, and complex situations where they need immediate, actionable guidance.

---

## 1. Architectural Foundation & Replaceable Frontend Design

NIRBHAYA was designed from the ground up with a strict **Separation of Concerns** principle: **the frontend visual design, layout, typography, and color palette can be completely replaced without changing or breaking the application's underlying business logic, workflows, or data models.**

### How to Replace the Visual Design Later
If you want to apply a completely new visual theme, screenshot reference, or component aesthetic:
1. **Centralized Design Tokens (`frontend/src/styles/tokens.css`):**
   - All colors (primary, brand, semantic status), typography scales, spacing, border radii, shadows, and layout dimensions are defined as CSS Custom Properties in `tokens.css`.
   - To rebrand or change the color palette, simply edit the values in `tokens.css`. No component code needs to be edited.
2. **Decoupled Layout Wrapper (`frontend/src/components/layout/`):**
   - The navigation structure, top action bar, sidebar, and footer live inside `PageLayout.tsx`, `Header.tsx`, and `Sidebar.tsx`.
   - You can replace the entire navigation shell (e.g. switch to a bottom dock, top mega-menu, or mobile-first floating sheet) by modifying only `PageLayout.tsx`. All feature modules render into `<Outlet />` without awareness of the surrounding layout.
3. **Reusable Presentation Primitives (`frontend/src/components/ui/`):**
   - Buttons, Cards, Modals, Inputs, Tabs, Badges, and Alerts are decoupled primitives. Modifying their visual appearance in `src/components/ui/` automatically updates all 14 feature modules consistently.
4. **Independent Service Layer (`frontend/src/services/`):**
   - All state mutations, audio synthesis, geolocation math, NLP heuristics, and API calls are isolated in pure TypeScript services and custom React hooks (`useSiren`, `useCheckInTimer`, `useJourney`, `useFakeCall`). Feature pages simply consume these hooks.

---

## 2. Feature Inventory (Modules A – N)

| Module | Feature Name | Status | Description & Capabilities |
| :--- | :--- | :--- | :--- |
| **Module A** | **Home Dashboard** | **Implemented** | Real-time safety state, quick siren/SOS actions, active check-in/journey banners, recent vault records, active safety plans, and empty states. |
| **Module B** | **Physical Safety & SOS** | **Implemented** | Web Audio API Emergency Siren (100% offline), 112 SOS dialer trigger, Safety Check-in Timer with missed deadline escalations, Journey Guardian with GPS waypoints, Fake Call simulation, and Trusted Circle management. |
| **Module C** | **Digital Guardian** | **Implemented** | Heuristic text analyzer for threats, blackmail, cyberstalking, and sexual harassment; breakdown with confidence index and direct "Save to Evidence Vault" flow. |
| **Module D** | **Privacy Shield** | **Implemented** | Personal hardening audit checklist covering social media privacy, app permissions, session revocation, Aadhaar biometric lock, and search engine doxxing removal. |
| **Module E** | **Deepfake Detective** | **Implemented** | Media inspector for image/video/audio (drag-and-drop, 50MB limit), EXIF metadata analysis, synthetic AI markers, StopNCII hash takedown guidance, and honest forensic disclaimers. |
| **Module F** | **NIRBHAYA Pathway** | **Implemented** | Signature triage engine answering *"I am experiencing this situation. What can I do next?"* covering 11 critical scenarios with urgent danger checks and interactive action checklists. |
| **Module G** | **HerCircle** | **Implemented** | Confidential women-to-women peer support intake, verified counselor directory, safe-place haven planner, and emergency document grab-bag checklist. |
| **Module H** | **Women’s Legal Support** | **Implemented** | Searchable directory of female advocates in India (Delhi, Mumbai, Bengaluru, Kolkata), practice area filters, Zero FIR legal rights guide, and NALSA free legal aid access. |
| **Module I** | **Evidence Vault** | **Implemented** | Private chronological incident journal with full CRUD, severity tagging, message logs, and one-click printable/PDF-ready summary reports with legal disclaimers. |
| **Module J** | **NIRBHAYA AI Assistant** | **Implemented** | Trauma-informed conversational assistant with provider-independent cloud adapter (Gemini/OpenAI/Claude) and a robust offline rule-based safety engine. |
| **Module K** | **Safety & Rights News** | **Implemented** | Verified awareness feed with Supreme Court directives, cyber advisories, key safety lessons, and bookmarks. |
| **Module L** | **Empowerment Hub** | **Implemented** | Directory of verified government schemes (Mudra Yojana, DISHA, SWADHAR Greh, STEP, NALSA) with benefits and official links. |
| **Module M** | **Emergency Directory** | **Implemented** | Direct-dial directory for official Indian helplines: 112 (ERSS), 1091 (Women Police), 181 (Women in Distress), 1930 (Cybercrime), 1516 (NALSA), and 7827170170 (NCW). |
| **Module N** | **Settings & Privacy** | **Implemented** | Account profile customization, configurable Quick-Exit target URL, external AI consent toggles, location permissions, JSON data export, and emergency data wipe. |
| **Module O** | **Safety Map** | **Implemented** | User-triggered browser geolocation shown on an OpenStreetMap map, with location-sharing disclosure and direct emergency-call links. |

---

## 3. Implemented vs. Planned Integrations

### Genuinely Implemented
- **Synthesized Dual-Tone Emergency Siren:** 100% offline Web Audio API sound generator (850Hz modulated sawtooth/square wave) with Start, Stop, Mute, and volume controls.
- **National Emergency SOS Dialer:** System-native `tel:112` protocol trigger with automated SMS dispatch to configured Trusted Circle contacts.
- **Simulated Incoming Call Pretext:** Web Audio synthesized phone ringtone, realistic incoming call screen (Accept/Decline), call timer, and suggested pretext dialogue.
- **Heuristic Threat & Extortion Analyzer:** Rule-based NLP pattern matcher that flags blackmail, violence, sexual solicitation, doxxing, and cyberstalking.
- **Media Container & EXIF Inspector:** Safe upload validation, image dimension and duration calculation, hardware metadata inspection, and temporary file sanitization.
- **Client-Side Resilient Storage:** Incident and feature data use browser localStorage with complete JSON backup export and emergency data wipe.
- **Password-Backed Accounts:** Account name, email, phone, and Werkzeug password hash are stored in the backend SQLite database. Authentication uses an HttpOnly Flask session cookie. Profile preferences remain local to the browser.
- **Language Rollout, Phase 1:** English and Hindi translations cover navigation and the Safety Map. Profile/Settings offer English plus all 22 Eighth Schedule language choices; additional selected languages are saved as preferences and will fall back to English until translated.
- **Safety Map:** Uses browser geolocation only after the user requests it. Coordinates are sent to OpenStreetMap to render the map; no location is requested automatically.
- **Provider-Independent AI Interface:** Backend endpoint supporting Google Gemini and OpenAI when API keys are provided, with zero-dependency local rule-based safety fallback.
- **Printable Legal Evidence Export:** Formatted HTML report generator with Section 65B Indian Evidence Act / Section 63 BSA disclaimers.

### Planned for Future Scaled Deployments
- **Pretrained Neural Deepfake Models:** Heavy deep neural networks (e.g. MesoNet or FaceForensics++) for frame-by-frame deepfake probability scoring.
- **Automated SMS Gateway:** Direct server-side cellular SMS delivery via Twilio or Gupshup (currently utilizes device native SMS client).
- **Supabase Cloud Sync:** Realtime cloud PostgreSQL sync across devices (currently utilizes client-side storage with optional Supabase client config).

---

## 4. Technology Stack

- **Frontend:** React 18, TypeScript, Vite, React Router v6, Lucide React icons, Web Audio API, Geolocation API, CSS Design Tokens.
- **Backend:** Python 3.13, Flask 3.1, Flask-CORS, Pillow (PIL), Requests, Python-Dotenv.
- **Testing:** Vitest for TypeScript business logic, Python `unittest` for backend services.

---

## 5. Getting Started & Setup Instructions

### Prerequisites
- Node.js (v18+ recommended)
- Python (v3.10+ recommended)

### 1. Frontend Setup
```powershell
cd frontend
npm install
npm run build   # Verify production bundle
npm test        # Run unit tests
npm run dev     # Start development server on http://localhost:3000
```

### 2. Backend Setup
```powershell
cd backend
pip install -r requirements.txt
python -m unittest discover -s tests   # Run backend tests
python app.py                          # Starts API on http://localhost:5000
```

The SQLite account database is created as `backend/nirbhaya_accounts.sqlite3` after the first registration. For a persistent deployment, set a stable random `SECRET_KEY`, set `SESSION_COOKIE_SECURE=true` when serving over HTTPS, and set `CORS_ORIGINS` to the frontend origin. Do not use the development defaults on a public deployment.

---

## 6. Security, Privacy & Safety Notes

1. **Quick Exit & Browser History:** The Quick-Exit button immediately redirects your browser tab to a neutral site (e.g. AccuWeather). However, web browsers do not allow web applications to wipe browser history for security reasons. Users in high-risk domestic living situations should always access NIRBHAYA in a Private / Incognito window.
2. **Data Minimization:** No evidence records, journal logs, or pasted harassment texts are ever uploaded to external AI providers unless the user explicitly checks the "Privacy Consent" toggle in Settings or Digital Guardian.
3. **Emergency Siren Honesty:** The Emergency Siren produces loud local audio to attract bystander attention; it does not automatically dispatch police. The platform explicitly distinguishes siren activation from calling 112.
4. **Media Retention:** Temporary media uploaded to the Deepfake Detective backend is deleted immediately in a `finally` block to protect user privacy.
5. **Account Deployment:** Passwords are stored as Werkzeug password hashes, not plaintext. Email/phone ownership verification, password recovery, rate limiting, and production hosting configuration are not implemented; do not treat the local development server as a production identity provider.
6. **Official Facility Pins:** The Safety Map does not claim nearby facilities are verified. The Mission Shakti portal is linked for official scheme information, but no public nationwide geocoded facility directory was found for placing accurate One Stop Centre pins.

---

## 7. Hackathon Demo Script

1. **Home Dashboard:** Showcase active state indicators, one-click SOS (112), and the Emergency Siren.
2. **Emergency Siren:** Click "Activate Siren" to demonstrate the loud Web Audio synthesis. Show Mute and Stop controls.
3. **Fake Call Simulation:** In the header, click "Fake Call" to trigger a 3-second delay incoming call pretext with realistic audio and script.
4. **Digital Guardian:** Paste the sample blackmail scenario (`"Transfer the money into bitcoin or else I will leak your private video"`). Click "Analyze Text Patterns" to view the detected threats, advice, and click "Save to Evidence Vault".
5. **Deepfake Detective:** Upload a sample image/video to inspect container EXIF metadata, view StopNCII guidelines, and link findings to an incident.
6. **NIRBHAYA Pathway:** Select "Domestic Abuse" or "Blackmail", complete the urgent safety check, and interact with the action plan.
7. **Legal Support & Helplines:** Filter female advocates by city and practice area; view verified helplines (112, 1930, 181, 1516).
8. **Evidence Vault:** View the logged incident, filter records, and click "Export / Print Summary" to generate the printable consultation report.
