#!/usr/bin/env node
/**
 * One-off helper: geocode Buc-ee's addresses via Nominatim.
 * Usage: node scripts/geocode-bucees.mjs > /tmp/bucees-coords.json
 */
import { writeFileSync } from 'node:fs'

const STORES = [
  { id: 'bucees-athens-al', num: 57, city: 'Athens, AL', address: '2328 Lindsay Lane South, Athens, AL 35613' },
  { id: 'bucees-auburn-al', num: 58, city: 'Auburn, AL', address: "2500 Buc-ee's Blvd, Auburn, AL 36832" },
  { id: 'bucees-leeds-al', num: 43, city: 'Leeds, AL', address: "6900 Buc-ee's Blvd, Leeds, AL 35094" },
  { id: 'bucees-loxley-al', num: 42, city: 'Loxley, AL', address: '20403 County Rd 68, Robertsdale, AL 36567' },
  { id: 'bucees-goodyear-az', num: 72, city: 'Goodyear, AZ', address: '1001 N Bullard Avenue, Goodyear, AZ 85338' },
  { id: 'bucees-johnstown-co', num: 60, city: 'Johnstown, CO', address: '5201 Nugget Road, Berthoud, CO 80513' },
  { id: 'bucees-daytona-fl', num: 47, city: 'Daytona Beach, FL', address: '2330 Gateway North Drive, Daytona Beach, FL 32117' },
  { id: 'bucees-st-augustine-fl', num: 46, city: 'St. Augustine, FL', address: '200 World Commerce Pkwy, St. Augustine, FL 32092' },
  { id: 'bucees-brunswick-ga', num: 63, city: 'Brunswick, GA', address: '6900 Hwy 99, Brunswick, GA 31525' },
  { id: 'bucees-adairsville-ga', num: 52, city: 'Adairsville, GA', address: '601 Union Grove Rd SE, Adairsville, GA 30103' },
  { id: 'bucees-fort-valley-ga', num: 51, city: 'Fort Valley, GA', address: '7001 Russell Parkway, Fort Valley, GA 31030' },
  { id: 'bucees-richmond-ky', num: 55, city: 'Richmond, KY', address: "1013 Buc-ee's Boulevard, Richmond, KY 40475" },
  { id: 'bucees-smiths-grove-ky', num: 56, city: 'Smiths Grove, KY', address: '4001 Smiths Grove-Scottsville Road, Smiths Grove, KY 42171' },
  { id: 'bucees-pass-christian-ms', num: 61, city: 'Pass Christian, MS', address: '8245 Firetower Road, Pass Christian, MS 39571' },
  { id: 'bucees-springfield-mo', num: 62, city: 'Springfield, MO', address: '3284 N Beaver Rd, Springfield, MO 65803' },
  { id: 'bucees-huber-heights-oh', num: 71, city: 'Huber Heights, OH', address: '8000 State Route 235, Huber Heights, OH 45424' },
  { id: 'bucees-florence-sc', num: 53, city: 'Florence, SC', address: '3390 North Williston Road, Florence, SC 29506' },
  { id: 'bucees-crossville-tn', num: 50, city: 'Crossville, TN', address: '2045 Genesis Road, Crossville, TN 38555' },
  { id: 'bucees-kodak-tn', num: 45, city: 'Kodak, TN', address: "170 Buc-ee's Blvd, Kodak, TN 37764" },
  { id: 'bucees-mount-crawford-va', num: 69, city: 'Mount Crawford, VA', address: "6500 Buc-ee's Blvd, Mount Crawford, VA 22841" },
  { id: 'bucees-alvin-tx', num: 14, city: 'Alvin, TX', address: '780 Hwy-35 N Byp, Alvin, TX 77511' },
  { id: 'bucees-amarillo-tx', num: 66, city: 'Amarillo, TX', address: '9900 East Interstate 40, Amarillo, TX 79118' },
  { id: 'bucees-angleton-mulberry-tx', num: 13, city: 'Angleton, TX', address: '2299 E Mulberry St, Angleton, TX 77515' },
  { id: 'bucees-angleton-loop-tx', num: 21, city: 'Angleton, TX', address: '931 Loop 274, Angleton, TX 77515' },
  { id: 'bucees-angleton-west-tx', num: 25, city: 'Angleton, TX', address: '2304 W Mulberry St, Angleton, TX 77515' },
  { id: 'bucees-bastrop-tx', num: 28, city: 'Bastrop, TX', address: '1700 Highway 71 East, Bastrop, TX 78602' },
  { id: 'bucees-baytown-tx', num: 34, city: 'Baytown, TX', address: '4080 East Freeway, Baytown, TX 77521' },
  { id: 'bucees-brazoria-tx', num: 3, city: 'Brazoria, TX', address: '801 N Brooks, Brazoria, TX 77422' },
  { id: 'bucees-cypress-tx', num: 32, city: 'Cypress, TX', address: '27106 US-290, Cypress, TX 77433' },
  { id: 'bucees-denton-tx', num: 39, city: 'Denton, TX', address: '2800 S Interstate 35 E, Denton, TX 76210' },
  { id: 'bucees-eagle-lake-tx', num: 24, city: 'Eagle Lake, TX', address: '505 E Main St, Eagle Lake, TX 77434' },
  { id: 'bucees-ennis-tx', num: 48, city: 'Ennis, TX', address: '1402 South IH-45, Ennis, TX 75119' },
  { id: 'bucees-fort-worth-tx', num: 37, city: 'Fort Worth, TX', address: '15901 N Freeway, Fort Worth, TX 76177' },
  { id: 'bucees-freeport-east-tx', num: 7, city: 'Freeport, TX', address: '4231 E Hwy 332, Freeport, TX 77541' },
  { id: 'bucees-freeport-north-tx', num: 8, city: 'Freeport, TX', address: '1002 N Brazosport Blvd, Freeport, TX 77541' },
  { id: 'bucees-giddings-tx', num: 16, city: 'Giddings, TX', address: '2375 E Austin St, Giddings, TX 78942' },
  { id: 'bucees-hillsboro-tx', num: 59, city: 'Hillsboro, TX', address: '165 State Highway 77, Hillsboro, TX 76645' },
  { id: 'bucees-katy-tx', num: 40, city: 'Katy, TX', address: '27700 Katy Fwy, Katy, TX 77494' },
  { id: 'bucees-lake-jackson-oyster-tx', num: 1, city: 'Lake Jackson, TX', address: '899 Oyster Creek Drive, Lake Jackson, TX 77566' },
  { id: 'bucees-lake-jackson-hwy-tx', num: 2, city: 'Lake Jackson, TX', address: '101 N Hwy 2004, Lake Jackson, TX 77566' },
  { id: 'bucees-lake-jackson-332-tx', num: 29, city: 'Lake Jackson, TX', address: '598 Hwy 332, Lake Jackson, TX 77566' },
  { id: 'bucees-league-city-tx', num: 23, city: 'League City, TX', address: '1702 League City Pkwy, League City, TX 77573' },
  { id: 'bucees-luling-tx', num: 17, city: 'Luling, TX', address: '10070 West IH 10, Luling, TX 78648' },
  { id: 'bucees-madisonville-tx', num: 26, city: 'Madisonville, TX', address: '205 IH-45 South, Madisonville, TX 77864' },
  { id: 'bucees-melissa-tx', num: 44, city: 'Melissa, TX', address: '1550 Central Texas Expressway, Melissa, TX 75454' },
  { id: 'bucees-new-braunfels-tx', num: 22, city: 'New Braunfels, TX', address: '2760 IH 35 North, New Braunfels, TX 78130' },
  { id: 'bucees-pearland-main-tx', num: 19, city: 'Pearland, TX', address: '2541 S Main St, Pearland, TX 77584' },
  { id: 'bucees-pearland-shadow-tx', num: 20, city: 'Pearland, TX', address: '11151 Shadow Creek Pky, Pearland, TX 77584' },
  { id: 'bucees-port-lavaca-tx', num: 12, city: 'Port Lavaca, TX', address: '2318 W Main, Port Lavaca, TX 77979' },
  { id: 'bucees-richmond-tx', num: 31, city: 'Richmond, TX', address: '1243 Crabb River Rd, Richmond, TX 77469' },
  { id: 'bucees-royse-city-tx', num: 38, city: 'Royse City, TX', address: '5005 E Interstate 30, Royse City, TX 75189' },
  { id: 'bucees-temple-tx', num: 35, city: 'Temple, TX', address: '4155 N General Bruce Dr, Temple, TX 76501' },
  { id: 'bucees-terrell-tx', num: 36, city: 'Terrell, TX', address: '506 W IH 20, Terrell, TX 75160' },
  { id: 'bucees-texas-city-tx', num: 33, city: 'Texas City, TX', address: '6201 Gulf Fwy, Texas City, TX 77591' },
  { id: 'bucees-waller-tx', num: 18, city: 'Waller, TX', address: '40900 US Hwy 290 Bypass, Waller, TX 77484' },
  { id: 'bucees-wharton-tx', num: 30, city: 'Wharton, TX', address: '10484 US 59 Road, Wharton, TX 77488' },
]

async function geocode(address) {
  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({ q: address, format: 'json', limit: '1' })
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ShannonsBirthdayTrip/1.0 (family road trip app)' },
  })
  const data = await res.json()
  if (!data[0]) return null
  return { lat: Number(data[0].lat), lng: Number(data[0].lon) }
}

const results = []
for (const store of STORES) {
  const coords = await geocode(store.address)
  results.push({ ...store, ...coords })
  process.stderr.write(`Geocoded ${store.city}\n`)
  await new Promise((r) => setTimeout(r, 1100))
}

writeFileSync('/tmp/bucees-coords.json', JSON.stringify(results, null, 2))
console.log(JSON.stringify(results, null, 2))
