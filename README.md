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

1. Create a Firebase project + **Realtime Database**.
2. Paste web config into `.env`:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

3. Example rules for a private family trip node (tighten before wide sharing):

```json
{
  "rules": {
    "trips": {
      "shannon-birthday-2026": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

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
