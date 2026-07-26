# AGENTS.md

## Cursor Cloud specific instructions

This is a single web app (`shannons-birthday-trip`): Vite + React 19 + TypeScript, packaged for Android via Capacitor, with Firebase Realtime Database for multi-phone sync and a localStorage fallback. There is no custom backend server.

### Services

- Web app (Vite dev server) — the only service required to run/test end to end. Start with `npm run dev` (serves on port 5173, `host: true`). Standard commands live in `package.json` and `README.md`.
- Firebase Realtime Database — OPTIONAL cloud service for cross-device live sync. Without Firebase env vars the app runs in "Offline mode" using localStorage (single device), which is fully functional for local dev/testing.
- Android/Gradle build — OPTIONAL. Requires Android SDK/JDK not provided by the update script; not needed for web dev.

### Non-obvious notes

- No linter and no test runner exist in this repo. The de-facto verification/CI check is `npm run build`, which runs `tsc --noEmit` (type-check) before `vite build`.
- `.env` is gitignored. The app works without it (offline mode), but copying `.env.example` to `.env` provides the default Director PIN (`VITE_SHANNON_DIRECTOR_PIN`) used to unlock Shannon's Agree/Veto controls. The update script creates `.env` from `.env.example` if missing.
- To enable real Firebase sync, populate the `VITE_FIREBASE_*` vars in `.env` (or use `npm run env:from-firebase` with a `firebase-config.json`). `src/lib/firebase.ts` auto-detects enablement from apiKey + databaseURL + projectId.
- First-launch flow: pick a traveler, then core features (map, live status, itinerary, and the Plans proposal workflow) become available. Proposed plans persist to localStorage in offline mode.
