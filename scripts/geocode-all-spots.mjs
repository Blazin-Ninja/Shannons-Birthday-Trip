#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const QUERIES = {
  'arcadia-pops': '660 W Highway 66, Arcadia, OK 73007',
  'main-event-okc': '1441 W Memorial Rd, Oklahoma City, OK 73114',
  'dave-busters-okc': '5500 N May Ave, Oklahoma City, OK 73112',
  'brickopolis-okc': '101 S Mickey Mantle Dr, Oklahoma City, OK 73104',
  'penn-square-mall': '1901 NW Expressway, Oklahoma City, OK 73118',
  'andy-alligators-norman': '2000 S Interstate 35, Norman, OK 73072',
  'okc-zoo': '2000 Remington Pl, Oklahoma City, OK 73111',
  'science-museum-okc': '2020 Remington Pl, Oklahoma City, OK 73111',
  'frontier-city': '11501 N I-35 Service Rd, Oklahoma City, OK 73131',
  'white-water-bay-okc': '3908 W Reno Ave, Oklahoma City, OK 73107',
  'nic-zoo': '1700 NE 63rd St, Oklahoma City, OK 73111',
  'tucker-garage-okc': '3247 W Hefner Rd, Oklahoma City, OK 73120',
  'okc-memorial': '620 N Harvey Ave, Oklahoma City, OK 73102',
  'okc-bricktown': 'Bricktown, Oklahoma City, OK',
  'dallas-reunion': '300 Reunion Tower Blvd, Dallas, TX 75207',
  'tyler-rose-garden': '420 Rose Park Dr, Tyler, TX 75702',
  'caddo-lake': '245 Park Rd 2, Karnack, TX 75661',
  'shreveport-auditorium': '705 Elvis Presley Ave, Shreveport, LA 71101',
  'shreveport-sciport': '820 Clyde Fant Pkwy, Shreveport, LA 71101',
  'bossier-boardwalk': '540 Boardwalk Blvd, Bossier City, LA 71111',
  'lafayette-acadian': '200 Greenleaf Dr, Lafayette, LA 70506',
  'baton-rouge-capitol': '900 N 3rd St, Baton Rouge, LA 70802',
  'uss-alabama': '2703 Battleship Pkwy, Mobile, AL 36602',
  'bellingrath-gardens': '12401 Bellingrath Gardens Rd, Theodore, AL 36582',
  'gulf-shores': '101 Gulf Shores Pkwy, Gulf Shores, AL 36542',
  'destin-harbor': '400 Harbor Blvd, Destin, FL 32541',
  'navarre-pier': '8579 Gulf Blvd, Navarre, FL 32566',
  'pensacola-beach': 'Pensacola Beach, FL',
  'fort-pickens': '1400 Fort Pickens Rd, Pensacola Beach, FL 32561',
  'naval-aviation': '175 Radford Blvd, Pensacola, FL 32508',
  'seaside-fl': 'Seaside, FL 32459',
  'panama-city-beach': 'Panama City Beach, FL',
  'natchez-bluff': 'Natchez Bluff Park, Natchez, MS',
  'vicksburg-nmp': '3201 Clay St, Vicksburg, MS 39183',
  'grammy-museum': '800 W Sunflower Rd, Cleveland, MS 38732',
  'greenville-delta': '1950 Lisa Dr, Greenville, MS 38701',
  'dockery-farms': '229 Highway 8, Ruleville, MS 38771',
  'little-rock-central': '1500 Park St, Little Rock, AR 72202',
  'hot-springs': '101 Reserve St, Hot Springs, AR 71901',
  'fort-smith': '301 Parker Ave, Fort Smith, AR 72901',
  'tulsa-golden-driller': '4145 E 21st St, Tulsa, OK 74114',
  'route66-clinton': '2229 W Gary Blvd, Clinton, OK 73601',
  'winstar-casino': '777 Casino Ave, Thackerville, OK 73459',
  'magnolia-market': '601 Webster Ave, Waco, TX 76706',
  'dr-pepper-museum': '300 S 5th St, Waco, TX 76701',
  'cameron-park-zoo': '1701 N 4th St, Waco, TX 76707',
  'hawaiian-falls-waco': '900 Lake Shore Dr, Waco, TX 76708',
  'canton-trade-days': 'First Monday Trade Days, Canton, TX',
  'grapevine-mills': '3000 Grapevine Mills Pkwy, Grapevine, TX 76051',
  'galleria-dallas': '13350 Dallas Pkwy, Dallas, TX 75240',
  'hurricane-harbor-arlington': '1800 E Lamar Blvd, Arlington, TX 76006',
  'main-event-grapevine': '900 E State Hwy 114, Grapevine, TX 76051',
  'medieval-times-dallas': '2020 N Stemmons Fwy, Dallas, TX 75207',
  'golden-triangle-mall': '2201 S I-35E, Denton, TX 76205',
  'six-flags-over-texas': '2201 Road to Six Flags, Arlington, TX 76011',
  'dallas-world-aquarium': '1801 N Griffin St, Dallas, TX 75202',
  'perot-museum': '2201 N Field St, Dallas, TX 75201',
  'shreveport-aquarium': '601 Clyde Fant Pkwy, Shreveport, LA 71101',
  'rw-norton-art': '4747 Creswell Ave, Shreveport, LA 71106',
  'herby-ks': '453 E Kings Hwy, Shreveport, LA 71105',
  'superior-grill-shreveport': '6123 Bayou Dr, Bossier City, LA 71112',
  'splash-shreveport': '7670 W 70th St, Shreveport, LA 71129',
  'lafayette-zoo': '5601 Highway 90 E, Broussard, LA 70518',
  'lafayette-science': '433 Jefferson St, Lafayette, LA 70501',
  'johnsons-boucaniere': '1111 St John St, Lafayette, LA 70501',
  'gulf-islands-waterpark': '17200 16th St, Gulfport, MS 39503',
  'alabama-gulf-coast-zoo': '1204 Gulf Shores Pkwy, Gulf Shores, AL 36542',
  'original-oyster-house': '3733 Battleship Pkwy, Spanish Fort, AL 36527',
  'gulf-breeze-zoo': '5701 Gulf Breeze Pkwy, Gulf Breeze, FL 32563',
  'big-kahunas': '1007 US-98, Destin, FL 32541',
  'track-destin': '11355 US-98, Destin, FL 32550',
  'peg-leg-petes': '1010 Fort Pickens Rd, Pensacola Beach, FL 32561',
  'zoo-nw-florida': '5262 Deer Springs Dr, Crestview, FL 32539',
  'waterville-usa': '18955 Gulf Blvd, Gulf Shores, AL 36542',
  'grand-marlin': '400 Pensacola Beach Blvd, Pensacola Beach, FL 32561',
  'mississippi-aquarium': '2100 E Beach Blvd, Gulfport, MS 39501',
  'doe-brookhaven': "Doe's Eat Place, 502 Nelson St, Greenville, MS 38701",
  'crystal-bridges': '600 Museum Way, Bentonville, AR 72712',
  'museum-of-discovery': '500 President Clinton Ave, Little Rock, AR 72201',
  'whole-hog-cafe': '2516 Cantrell Rd, Little Rock, AR 72202',
  'beavers-bend': '4350 S Highway 259A, Broken Bow, OK 74728',
  'tabasco-factory': '32 Wisteria Rd, Avery Island, LA 70513',
  'oak-mountain-state-park': '200 Terrace Dr, Pelham, AL 35124',
  'noccalula-falls': '1500 Noccalula Rd, Gadsden, AL 35904',
  'wakulla-springs': '465 Wakulla Park Dr, Crawfordville, FL 32327',
  'eden-gardens': '181 Eden Gardens Rd, Santa Rosa Beach, FL 32459',
  'ship-island': '1040 23rd Ave, Gulfport, MS 39501',
  'oxford-square': 'Oxford Square, Oxford, MS 38655',
  'palo-duro-canyon': '11450 Park Road 5, Canyon, TX 79015',
  'turner-falls': 'I-35 & Hwy 77, Davis, OK 73030',
  'chickasaw-nra': '901 W 1st St, Sulphur, OK 73086',
  'lake-murray-sp': '3323 State Park Rd, Ardmore, OK 73401',
  'outlets-little-rock': '11201 Bass Pro Pkwy, Little Rock, AR 72210',
  'river-market-lr': 'River Market District, Little Rock, AR',
  'wild-river-country': '6820 Cantrell Rd, Little Rock, AR 72207',
  'pinnacle-hills-promenade': '2203 S Promenade Blvd, Rogers, AR 72758',
  'wilderness-safari-ar': '2912 Safari Rd, Gentry, AR 72734',
  'sallisaw-casino': '1621 W Ruth Ave, Sallisaw, OK 74955',
  'elk-city-route66': '2717 W Highway 66, Elk City, OK 73644',
  'cadillac-ranch': '13651 I-40 Frontage Rd, Amarillo, TX 79124',
  'big-texan-steak': '7701 E Interstate 40, Amarillo, TX 79118',
  'incredible-pizza-tulsa': '8314 E 71st St, Tulsa, OK 74133',
  'woodland-hills-mall': '7021 S Memorial Dr, Tulsa, OK 74133',
  'alexandria-riverfront': 'Alexandria Levee Park, Alexandria, LA',
  'shreveport-riverfront': '500 Clyde Fant Pkwy, Shreveport, LA 71101',
  'rws-casino': '500 Clyde Fant Pkwy, Shreveport, LA 71101',
  'greenville-walnut': '211 S Walnut St, Greenville, MS 38701',
  'pensacola-boardwalk': 'Pensacola Beach Boardwalk, FL',
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
    if (!id || !name || !lat || !lng) continue
    spots.push({ id, name, lat: Number(lat), lng: Number(lng) })
  }
  return spots
}

async function geocode(query) {
  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({ q: query, format: 'json', limit: '1' })
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ShannonsBirthdayTrip/1.0 (coord-verify-all)' },
  })
  const data = await res.json()
  if (!data[0]) return null
  return { lat: Number(data[0].lat), lng: Number(data[0].lon) }
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

const files = [
  '/workspace/src/data/touristSpots.ts',
  '/workspace/src/data/touristSpotsCorridor.ts',
  '/workspace/src/data/touristSpotsExtra.ts',
  '/workspace/src/data/buceesLocations.ts',
]

const spots = files.flatMap(extractSpots)
const overrides = {}
const issues = []

for (const spot of spots) {
  const query = QUERIES[spot.id] ?? spot.description?.match(/at ([^.]+)\./)?.[1]
  if (!query && spot.id.startsWith('bucees-')) {
    const block = readFileSync('/workspace/src/data/buceesLocations.ts', 'utf8')
    const m = block.match(new RegExp(`id: '${spot.id}'[\\s\\S]*?description: 'Official Buc-ee's travel center[^']* at ([^.]+)\\.`))
    const addr = m?.[1]
    if (addr) {
      const geo = await (async () => {
        await sleep(1100)
        return geocode(addr)
      })()
      if (geo) {
        const miles = haversineMi({ lat: spot.lat, lng: spot.lng }, geo)
        if (miles > 0.3) {
          overrides[spot.id] = { lat: Math.round(geo.lat * 1e6) / 1e6, lng: Math.round(geo.lng * 1e6) / 1e6 }
          console.log(`FIX ${spot.id}: ${miles.toFixed(1)} mi`)
        }
      }
    }
    continue
  }
  if (!query) {
    console.log(`SKIP ${spot.id} (no query)`)
    continue
  }
  await sleep(1100)
  const geo = await geocode(query)
  if (!geo) {
    issues.push({ id: spot.id, query, status: 'fail' })
    console.log(`FAIL ${spot.id}`)
    continue
  }
  const miles = haversineMi({ lat: spot.lat, lng: spot.lng }, geo)
  if (miles > 0.5) {
    overrides[spot.id] = {
      lat: Math.round(geo.lat * 1e6) / 1e6,
      lng: Math.round(geo.lng * 1e6) / 1e6,
    }
    console.log(`FIX ${spot.id}: ${miles.toFixed(1)} mi — ${query}`)
  } else {
    console.log(`OK ${spot.id}`)
  }
}

writeFileSync('/tmp/spot-overrides-generated.json', JSON.stringify(overrides, null, 2))
console.log(`\n${Object.keys(overrides).length} overrides`)
