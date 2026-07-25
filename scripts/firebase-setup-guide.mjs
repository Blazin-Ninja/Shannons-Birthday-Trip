#!/usr/bin/env node
/**
 * Prints Firebase console setup steps and validates .env when present.
 */
import { readFileSync, existsSync } from 'node:fs'

const envPath = '.env'

console.log(`
Shannon's Birthday Trip — Firebase setup (one-time)

1. Open https://console.firebase.google.com/
2. Create a project (e.g. "Shannons Birthday Trip")
3. Build → Realtime Database → Create database → United States → Start in TEST mode
4. Project settings (gear) → Your apps → Add app → Web (</>)
   App nickname: Shannon Birthday Trip Web
5. Copy the firebaseConfig object into firebase-config.json (see firebase-config.example.json)
6. Run: npm run env:from-firebase
7. Deploy rules: npm run firebase:deploy-rules   (requires: npm run firebase:login)
8. Rebuild APK: npm run android:build-release

Trip data path: trips/shannon-birthday-2026
`)

if (!existsSync(envPath)) {
  console.log('Status: .env not found — live sync between phones is OFF until step 6.')
  process.exit(0)
}

const env = readFileSync(envPath, 'utf8')
const hasKey = /VITE_FIREBASE_API_KEY=\S+/.test(env) && !env.includes('VITE_FIREBASE_API_KEY=\n')
const hasUrl = /VITE_FIREBASE_DATABASE_URL=https:\/\/.+/.test(env)

if (hasKey && hasUrl) {
  console.log('Status: .env looks configured — run npm run build to enable Live sync.')
} else {
  console.log('Status: .env exists but Firebase vars look incomplete.')
}
