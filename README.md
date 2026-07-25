# Shannon’s Birthday Trip

Installable family road-trip app for **Shannon’s birthday**: OKC → Shreveport → Pensacola → Lake Village → OKC.

**Stack:** Vite + React + TypeScript + Framer Motion + Leaflet + Capacitor (Android) + Firebase Realtime Database (with localStorage fallback).

## Features (V1)

- Animated Shannon birthday hero (family photos)
- First-launch traveler picker (Shannon, William, Sophia, Ellie, Matthew, Celina)
- Shannon Director PIN unlock for Agree / Veto on family plans
- Live trip status (where / leaving / headed)
- Live location sharing + family map
- Tourist spots + I-10 Buc-ee’s (≤20 min detour)
- Day-by-day itinerary + Pensacola birthday peak

## Quick start (web)

```bash
npm install
cp .env.example .env   # Windows: copy .env.example .env
npm run dev
```

Open the local URL. Without Firebase config, the app uses **localStorage** (works on one device / same browser profile).

### Director PIN

Default in `.env.example`: `shannon2026`  
Set `VITE_SHANNON_DIRECTOR_PIN` to whatever Shannon should use.

## Firebase (multi-phone live sync)

**Phones only see each other’s live GPS when Firebase is configured in the build.** Without it, the map shows “Offline mode” and each phone works alone.

### Quick setup (about 5 minutes)

```bash
npm run firebase:guide          # prints step-by-step console instructions
```

1. [Firebase console](https://console.firebase.google.com/) → **Create project** (e.g. `shannons-birthday-trip`).
2. **Build → Realtime Database → Create database** → United States → start in **test mode** (we deploy proper rules below).
3. **Project settings → Your apps → Add app → Web** → copy the `firebaseConfig` JSON.
4. Save it as `firebase-config.json` (see `firebase-config.example.json`).
5. Run:

```bash
npm run env:from-firebase       # writes .env from firebase-config.json
npm run firebase:login          # one-time Google sign-in for CLI
npm run firebase:deploy-rules   # deploy database.rules.json
npm run build                   # verify "Live sync on" in the app
npm run android:build-release   # APK with Firebase baked in
```

Trip data lives at `trips/shannon-birthday-2026` (override with `VITE_TRIP_PATH` in `.env`).

Rules file: [`database.rules.json`](./database.rules.json) — open read/write on the trip node for family sideload use. Tighten before sharing widely.

## Android APK

```bash
npm run build
npx cap add android    # first time only
npx cap sync android
npx cap open android
```

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.  
Sideload the APK; enable install from that source on family phones.

Location permission is requested when someone taps **Share my location**. Keep the app open while sharing (V1 is foreground-only).

## Product plan

See [PLAN.md](./PLAN.md) and [data/bucees-route.md](./data/bucees-route.md).
