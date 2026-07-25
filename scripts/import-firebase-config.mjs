#!/usr/bin/env node
/**
 * Writes .env from firebase-config.json (Firebase console → Web app → config).
 * Usage: node scripts/import-firebase-config.mjs [path-to-config.json]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const configPath = resolve(process.argv[2] ?? 'firebase-config.json')
const envPath = resolve('.env')
const examplePath = resolve('.env.example')

if (!existsSync(configPath)) {
  console.error(`Missing ${configPath}`)
  console.error('Copy firebase-config.example.json → firebase-config.json and fill from Firebase console.')
  process.exit(1)
}

const raw = JSON.parse(readFileSync(configPath, 'utf8'))
const required = [
  'apiKey',
  'authDomain',
  'databaseURL',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
]

for (const key of required) {
  if (!raw[key] || String(raw[key]).includes('YOUR_')) {
    console.error(`firebase-config.json: missing or placeholder value for "${key}"`)
    process.exit(1)
  }
}

let envTemplate = readFileSync(examplePath, 'utf8')
const lines = envTemplate.split('\n')
const map = {
  VITE_FIREBASE_API_KEY: raw.apiKey,
  VITE_FIREBASE_AUTH_DOMAIN: raw.authDomain,
  VITE_FIREBASE_DATABASE_URL: raw.databaseURL,
  VITE_FIREBASE_PROJECT_ID: raw.projectId,
  VITE_FIREBASE_STORAGE_BUCKET: raw.storageBucket,
  VITE_FIREBASE_MESSAGING_SENDER_ID: raw.messagingSenderId,
  VITE_FIREBASE_APP_ID: raw.appId,
}

const out = lines.map((line) => {
  const m = line.match(/^([A-Z_]+)=/)
  if (!m) return line
  const key = m[1]
  if (map[key]) return `${key}=${map[key]}`
  return line
})

writeFileSync(envPath, out.join('\n') + '\n')
console.log(`Wrote ${envPath} from ${configPath}`)
console.log('Run: npm run build && npm run android:sync')
