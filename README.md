# Shannon’s Birthday Trip

Installable family road-trip app for **Shannon’s birthday**: OKC → Shreveport → Pensacola → Lake Village → OKC.

**Stack:** Vite + React + TypeScript + Framer Motion + Leaflet + Capacitor (Android) + live cloud sync (Mantle by default, Firebase optional).

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

Open the local URL. Live sync works out of the box via the shared `VITE_MANTLE_NS` channel (phones share status, plans, and map pins). Optional Firebase config upgrades to Realtime Database if you prefer.

### Family URL (GitHub Pages)

After Pages is enabled on the repo:

**https://blazin-ninja.github.io/Shannons-Birthday-Trip/**

On Android Chrome: open the link → menu → **Add to Home screen** for an app-like icon.

### Director PIN

Default in `.env.example`: `shannon2026`  
Set `VITE_SHANNON_DIRECTOR_PIN` to whatever Shannon should use.

## Firebase (optional upgrade)

1. Create a Firebase project + **Realtime Database**.
2. Paste web config into `.env` (`VITE_FIREBASE_*`). When Firebase is configured, it takes priority over Mantle sync.
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
npx cap sync android
npx cap open android
```

In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.  
Sideload the APK; enable install from that source on family phones.

Location permission is requested when someone taps **Share my location**. Keep the app open while sharing (V1 is foreground-only).

## Product plan

See [PLAN.md](./PLAN.md) and [data/bucees-route.md](./data/bucees-route.md).
