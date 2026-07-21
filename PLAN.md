# Shannon’s Birthday Trip — Android App

## Goal

An **installable Android app** for **Shannon’s birthday** road trip that:

- Constantly reinforces this trip is **for Shannon’s birthday**
- Shows **live GPS** of each family member on one map
- Lets **anyone propose plans** along the way
- Makes **Shannon the prime director** — she alone can **agree** or **veto** proposals
- Highlights tourist spots along the route and shared trip status
- Feels highly animated and celebratory

## Defaults (locked in)

- **Delivery:** Capacitor + React → Android APK (sideload; no Play Store for v1). Browser preview still works from the same build.
- **Identity:** Display name + avatar color on first open. Optional **“I am Shannon (Director)”** unlock with a **trip PIN** (set in `.env` / config, shared only with Shannon). Everyone else is a Family Member.
- **Plans workflow:** Any user can add a plan (title, optional place/notes, optional day/segment). Plans start as **Pending**. Shannon can **Agree** (approved) or **Veto** (rejected) with optional short note. Approved plans appear on the map when they have coordinates and in an “Shannon said yes” list.
- **Live location:** Foreground GPS → Firebase per user while Sharing is on.
- **Birthday voice:** Copy, section labels, empty states, and motion all restate Shannon’s birthday (not only the hero).
- **Stack:** Vite + React + TS + Framer Motion + Capacitor + Firebase + Leaflet + `@capacitor/geolocation`.

## Shannon as prime director

```mermaid
flowchart LR
  anyone[Any family member]
  propose[Propose a plan]
  pending[Pending]
  shannon[Shannon Director]
  agree[Agreed]
  veto[Vetoed]
  anyone --> propose --> pending
  shannon -->|Agree| agree
  shannon -->|Veto| veto
  pending --> shannon
```

- Family Members: propose, edit/withdraw **their own** pending plans, view all statuses.
- Shannon (PIN unlocked on that device): Agree / Veto any pending plan; can also propose like everyone else (her proposals auto-agree).
- Non-Shannon devices never see Agree/Veto controls.
- PIN is local unlock for director powers on that phone (not a full account system).

## Birthday reiteration (throughout the app)

Not a one-time banner — recurring cues:

- App name / splash: **Shannon’s Birthday Trip**
- Hero: Shannon as brand-level title
- Section headers tied to her: “Plans for Shannon,” “Shannon’s call,” “Birthday route,” etc.
- Pending/approved empty states: e.g. “Nothing pending — suggest something for Shannon’s birthday”
- Map chrome / footer microcopy reminding it’s her celebration
- Pensacola section framed as birthday peak days
- Soft recurring motion (confetti burst when Shannon **Agrees** a plan)

## Architecture

```mermaid
flowchart TD
  phones[Android phones with APK]
  cap[Capacitor Geolocation]
  ui[React UI]
  fb[Firebase Realtime DB]
  phones --> cap --> ui
  ui -->|users locations status plans| fb
  fb -->|live sync| ui
```

### Firebase data shape

```ts
// /trips/shannon-birthday-2026/status
{
  whereWeAre: string;
  leavingAt: string;
  headedTo: string;
  updatedAt: number;
  updatedBy?: string;
}

// /trips/shannon-birthday-2026/users/{userId}
{
  name: string;
  color: string;
  lat: number;
  lng: number;
  updatedAt: number;
  sharing: boolean;
}

// /trips/shannon-birthday-2026/plans/{planId}
{
  title: string;
  notes?: string;
  placeName?: string;
  lat?: number;
  lng?: number;
  segment?: string;      // optional tie to route day/leg
  createdById: string;
  createdByName: string;
  createdAt: number;
  status: 'pending' | 'agreed' | 'vetoed';
  decidedAt?: number;
  decisionNote?: string; // Shannon’s optional comment
}
```

Director PIN is **not** stored in Firebase (lives in app env: `VITE_SHANNON_DIRECTOR_PIN`). Unlock flag stored on device after Shannon enters it.

## Trip itinerary

| Day | Plan |
|-----|------|
| Sat 7/27 | OKC → Shreveport (~9 AM → 3–4 PM) |
| Sun 7/28 | Full day in Shreveport |
| Mon 7/29 | Shreveport → Pensacola (~10 AM → 10–11 PM) |
| Tue–Wed 7/30–31 | Two full days in Pensacola (birthday peak) |
| Thu 8/1 | Pensacola → Lake Village, AR (~10 AM → 8 PM) |
| Fri 8/2 | Lake Village → OKC (possible family stop) |

## App structure

1. **First-launch setup** — name, color; optional “Unlock Shannon Director” with PIN; short note that location is family-trip only and plans need Shannon’s OK.
2. **Hero** — Shannon’s Birthday Trip (dominant brand + motion).
3. **Live family map** — each user; destination; route; tourist spots; pins for **Agreed** plans.
4. **Sharing controls** — location on/off; recenter.
5. **Plans for Shannon** (core section)
   - Compose: title, notes, optional place / link to a tourist spot, optional day
   - Tabs or filters: Pending · Agreed · Vetoed
   - Shannon-only Agree / Veto actions on pending items
   - Celebration animation on Agree
6. **Trip status** — where / leaving / headed.
7. **Itinerary timeline** — Sat 7/27–Fri 8/2 fixed schedule.
8. **Near you / tourist spots** — curated corridor picks.
9. **Pensacola birthday peak**
10. **Footer** — birthday sign-off.

## Live location behavior

- Permission on first Sharing enable; publish ~every 5–10s while app open.
- Stale users dim after ~2 minutes.
- No background tracking when app is killed (v1).

## Tourist spots

Curated spots by route segment. Users can tap a spot → “Propose this for Shannon” pre-fills a plan. Active segment from trip status + optional distance boost from GPS.

## Visual direction

Gulf teal / sugar-sand / sunset coral / night navy; expressive birthday typography; intentional motion; Shannon brand-first; no purple / cream-terracotta / newspaper defaults. Plans UI is interaction-first (not a card dump in the hero).

## Project layout (to build)

- `src/components/Hero.tsx`, `UserSetup.tsx`, `SharingToggle.tsx`, `TripMap.tsx`, `NearYou.tsx`, `LiveStatus.tsx`, `PlansBoard.tsx`, `PlanComposer.tsx`, `PlanCard.tsx`, `Timeline.tsx`, `Pensacola.tsx`
- `src/lib/firebase.ts`, `location.ts`, `segments.ts`, `identity.ts`, `director.ts`
- `src/data/itinerary.ts`, `stops.ts`, `touristSpots.ts`
- Capacitor Android project + `.env.example` (`VITE_FIREBASE_*`, `VITE_SHANNON_DIRECTOR_PIN`)
- `README.md` — Firebase, PIN, APK install

## What you need to provide once

1. Firebase Realtime Database + rules for the trip node.
2. A short **Shannon Director PIN** (you choose; put in `.env`).
3. Android Studio to build the APK; family enables install from that source.

## Out of scope (v1)

- Play Store / iPhone
- Full accounts (email/password)
- Background GPS when app closed
- Turn-by-turn nav / paid Places API
- Push notifications for new proposals (can add later)
- Booking/payments

## Success check

- APK installs; each user has a name and live map presence
- Anyone can propose plans; only Shannon’s PIN-unlocked device can Agree/Veto
- Agreed plans show up clearly (list + map when geo’d)
- App repeatedly frames the trip as **Shannon’s birthday**
- Tourist spots and itinerary still support the drive
