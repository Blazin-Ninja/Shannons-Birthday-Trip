/**
 * Regenerate driving routes from stop addresses (OSRM, matches Google Maps driving).
 * Run: node scripts/fetch-routes.mjs
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const segmentsOrder = [
  'okc-shreveport',
  'shreveport-navarre',
  'navarre-greenville',
  'greenville-okc',
]
const segmentCoords = {
  'okc-shreveport': [-97.6259, 35.4945, -93.7512, 32.5171],
  'shreveport-navarre': [-93.7512, 32.5171, -86.897, 30.4017],
  'navarre-greenville': [-86.897, 30.4017, -91.0652, 33.4116],
  'greenville-okc': [-91.0652, 33.4116, -97.6259, 35.4945],
}

async function fetchRoute(lng1, lat1, lng2, lat2) {
  const url = `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}?overview=full&geometries=geojson`
  const res = await fetch(url)
  const data = await res.json()
  return data.routes[0].geometry.coordinates.map(([lng, lat]) => [
    Math.round(lat * 1e5) / 1e5,
    Math.round(lng * 1e5) / 1e5,
  ])
}

function simplify(coords, maxPoints = 350) {
  if (coords.length <= maxPoints) return coords
  const step = Math.max(1, Math.floor(coords.length / maxPoints))
  const out = coords.filter((_, i) => i % step === 0)
  if (out[out.length - 1] !== coords[coords.length - 1]) out.push(coords[coords.length - 1])
  return out
}

function fmtCoords(coords) {
  return coords.map(([lat, lng]) => `    [${lat}, ${lng}],`).join('\n')
}

const segRoutes = {}
for (const name of segmentsOrder) {
  const [lng1, lat1, lng2, lat2] = segmentCoords[name]
  const raw = await fetchRoute(lng1, lat1, lng2, lat2)
  segRoutes[name] = simplify(raw)
  console.log(name, raw.length, '->', segRoutes[name].length)
}

let full = []
for (let i = 0; i < segmentsOrder.length; i++) {
  const pts = segRoutes[segmentsOrder[i]]
  full = full.concat(i > 0 ? pts.slice(1) : pts)
}

const header = `// Driving routes via OSRM (matches Google Maps driving between trip stops).
export type RouteSegmentId =
  | 'okc-shreveport'
  | 'shreveport-navarre'
  | 'navarre'
  | 'navarre-greenville'
  | 'greenville'
  | 'greenville-okc'
  | 'shreveport'


`

let body = 'export const SEGMENT_ROUTE_COORDS: Record<RouteSegmentId, [number, number][]> = {\n'
for (const name of segmentsOrder) {
  body += `  '${name}': [\n${fmtCoords(segRoutes[name])}\n  ],\n`
}
body += `  shreveport: [
    [32.5171, -93.7512],
    [32.525, -93.735],
    [32.51, -93.765],
  ],
  navarre: [
    [30.4017, -86.897],
    [30.395, -86.92],
    [30.41, -86.87],
  ],
  greenville: [
    [33.4116, -91.0652],
    [33.42, -91.05],
    [33.4, -91.08],
  ],
}

export const ROUTE_COORDS: [number, number][] = [
${fmtCoords(full)}
]
`

writeFileSync(join(__dirname, '../src/data/routes.ts'), header + body)
console.log('Wrote routes.ts with', full.length, 'points')
