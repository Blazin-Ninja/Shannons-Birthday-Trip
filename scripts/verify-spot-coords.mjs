#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const SEG_STATE = {
  'okc-shreveport': 'Oklahoma',
  shreveport: 'Louisiana',
  'shreveport-navarre': 'Louisiana',
  navarre: 'Florida',
  'navarre-greenville': 'Mississippi',
  greenville: 'Mississippi',
  'greenville-okc': 'Arkansas',
}

function haversineMi(a, b) {
  const R = 3958.8
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

function extractSpots(file) {
  const text = readFileSync(file, 'utf8')
  const spots = []
  const blocks = text.split(/\{\s*\n/).slice(1)
  for (const block of blocks) {
    const id = block.match(/id:\s*'([^']+)'/)?.[1]
    const name =
      block.match(/name:\s*'([^']*)'/)?.[1] ??
      block.match(/name:\s*"([^"]*)"/)?.[1]
    const lat = block.match(/lat:\s*([-\d.]+)/)?.[1]
    const lng = block.match(/lng:\s*([-\d.]+)/)?.[1]
    const segment = block.match(/segment:\s*'([^']+)'/)?.[1]
    if (!id || !name || !lat || !lng) continue
    if (id.startsWith('bucees-')) continue
    spots.push({ id, name, lat: Number(lat), lng: Number(lng), segment, file })
  }
  return spots
}

async function geocode(query) {
  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({ q: query, format: 'json', limit: '1' })
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ShannonsBirthdayTrip/1.0 (coord-verify)' },
  })
  const data = await res.json()
  if (!data[0]) return null
  return { lat: Number(data[0].lat), lng: Number(data[0].lon), label: data[0].display_name }
}

const files = [
  '/workspace/src/data/touristSpots.ts',
  '/workspace/src/data/touristSpotsCorridor.ts',
  '/workspace/src/data/touristSpotsExtra.ts',
]

const spots = files.flatMap(extractSpots)
const issues = []

for (const spot of spots) {
  await sleep(1100)
  const state = SEG_STATE[spot.segment] ?? 'USA'
  const query = `${spot.name}, ${state}`
  const geo = await geocode(query)
  if (!geo) {
    issues.push({ ...spot, status: 'geocode_failed', query })
    console.log(`FAIL ${spot.id}`)
    continue
  }
  const miles = haversineMi({ lat: spot.lat, lng: spot.lng }, geo)
  if (miles > 2) {
    issues.push({
      ...spot,
      status: 'mismatch',
      miles: Math.round(miles * 10) / 10,
      suggested: { lat: geo.lat, lng: geo.lng },
      resolvedAs: geo.label,
      query,
    })
    console.log(`MISMATCH ${spot.id}: ${miles.toFixed(1)} mi — ${query}`)
  } else {
    console.log(`OK ${spot.id} (${miles.toFixed(1)} mi)`)
  }
}

writeFileSync('/tmp/spot-coord-audit.json', JSON.stringify(issues, null, 2))
console.log(`\n${issues.length} issues -> /tmp/spot-coord-audit.json`)
