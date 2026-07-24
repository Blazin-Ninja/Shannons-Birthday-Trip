#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'

const FALLBACK = {
  'bucees-johnstown-co': { lat: 40.3347, lng: -104.9818 },
  'bucees-lake-jackson-332-tx': { lat: 29.0442, lng: -95.4584 },
}

const raw = JSON.parse(readFileSync('/tmp/bucees-coords.json', 'utf8'))

const lines = raw.map((s) => {
  const coords = s.lat
    ? { lat: s.lat, lng: s.lng }
    : FALLBACK[s.id] ?? { lat: 0, lng: 0 }
  const name = `Buc-ee's ${s.city.replace(/,.*$/, '')}`
  return `  {
    id: '${s.id}',
    name: ${JSON.stringify(name)},
    lat: ${coords.lat},
    lng: ${coords.lng},
    segment: 'okc-shreveport',
    blurb: 'Buc-ee\\'s #${s.num} — cleanest restrooms, beaver nuggets, and Texas-sized snacks.',
    description: 'Official Buc-ee\\'s travel center #${s.num} at ${s.address.replace(/'/g, "\\'")}.',
    websiteUrl: 'https://buc-ees.com/locations/',
    kind: 'stop' as const,
    brand: "Buc-ee's",
    alwaysOnMap: true,
  },`
})

const file = `import type { TouristSpot } from './touristSpots'

/** All open Buc-ee's locations — always shown on the map with the beaver logo. */
export const BUCEES_LOCATIONS: TouristSpot[] = [
${lines.join('\n')}
]
`

writeFileSync('/workspace/src/data/buceesLocations.ts', file)
console.log('Wrote', raw.length, 'locations')
