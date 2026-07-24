#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'

const generated = JSON.parse(
  readFileSync('/tmp/spot-overrides-generated.json', 'utf8'),
)

const manual = {
  'arcadia-pops': { lat: 35.6586, lng: -97.3351 },
  'andy-alligators-norman': { lat: 35.2078, lng: -97.4129 },
  'caddo-lake': { lat: 32.7008, lng: -94.1238 },
  'shreveport-auditorium': { lat: 32.5151, lng: -93.7499 },
  'bellingrath-gardens': { lat: 30.4326, lng: -88.1392 },
  'naval-aviation': { lat: 30.3496, lng: -87.2774 },
  'natchez-bluff': { lat: 31.5604, lng: -91.4033 },
  'dockery-farms': { lat: 33.7182, lng: -90.6273 },
  'canton-trade-days': { lat: 32.5565, lng: -95.8639 },
  'main-event-grapevine': { lat: 32.9369, lng: -97.0792 },
  'golden-triangle-mall': { lat: 33.2148, lng: -97.1167 },
  'lafayette-zoo': { lat: 30.1478, lng: -91.9614 },
  'zoo-nw-florida': { lat: 30.7541, lng: -86.4447, name: 'Emerald Coast Zoo' },
  'beavers-bend': { lat: 34.0217, lng: -94.7392 },
  'wakulla-springs': { lat: 30.2347, lng: -84.3027 },
  'eden-gardens': { lat: 30.3768, lng: -86.1205 },
  'palo-duro-canyon': { lat: 34.9372, lng: -101.6368 },
  'lake-murray-sp': { lat: 34.1289, lng: -97.0434 },
  'river-market-lr': { lat: 34.7472, lng: -92.2688 },
  'wilderness-safari-ar': { lat: 36.2917, lng: -94.5083 },
  'cadillac-ranch': { lat: 35.1872, lng: -101.9871 },
  'big-texan-steak': { lat: 35.1936, lng: -101.9145 },
  'alexandria-riverfront': { lat: 31.3089, lng: -92.4455 },
  'pensacola-boardwalk': { lat: 30.3335, lng: -87.1402 },
}

const all = { ...generated, ...manual }
const lines = Object.entries(all)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([id, v]) => {
    const name = v.name ? `,\n    name: ${JSON.stringify(v.name)}` : ''
    return `  '${id}': { lat: ${v.lat}, lng: ${v.lng}${name} },`
  })

const file = `/**
 * Verified coordinates geocoded from street addresses.
 * Regenerate with: node scripts/geocode-queries-only.mjs && node scripts/build-spot-overrides.mjs
 */
export const SPOT_COORDINATE_OVERRIDES: Record<
  string,
  { lat: number; lng: number; name?: string }
> = {
${lines.join('\n')}
}
`

writeFileSync('/workspace/src/data/spotCoordinateOverrides.ts', file)
console.log('Wrote', Object.keys(all).length, 'overrides')
