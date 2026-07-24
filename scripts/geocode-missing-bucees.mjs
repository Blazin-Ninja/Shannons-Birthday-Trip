const missing = [
  ['bucees-loxley-al', "Buc-ee's Robertsdale Alabama"],
  ['bucees-johnstown-co', "Buc-ee's Berthoud Colorado"],
  ['bucees-brunswick-ga', "Buc-ee's Brunswick Georgia"],
  ['bucees-huber-heights-oh', "Buc-ee's Huber Heights Ohio"],
  ['bucees-amarillo-tx', "Buc-ee's Amarillo Texas"],
  ['bucees-bastrop-tx', "Buc-ee's Bastrop Texas"],
  ['bucees-denton-tx', "Buc-ee's Denton Texas"],
  ['bucees-ennis-tx', "Buc-ee's Ennis Texas"],
  ['bucees-freeport-east-tx', "Buc-ee's Freeport Texas"],
  ['bucees-hillsboro-tx', "Buc-ee's Hillsboro Texas"],
  ['bucees-lake-jackson-hwy-tx', "Buc-ee's Lake Jackson Texas"],
  ['bucees-lake-jackson-332-tx', '598 Hwy 332 Lake Jackson TX'],
  ['bucees-luling-tx', "Buc-ee's Luling Texas"],
  ['bucees-madisonville-tx', "Buc-ee's Madisonville Texas"],
  ['bucees-melissa-tx', "Buc-ee's Melissa Texas"],
  ['bucees-terrell-tx', "Buc-ee's Terrell Texas"],
  ['bucees-waller-tx', "Buc-ee's Waller Texas"],
  ['bucees-wharton-tx', "Buc-ee's Wharton Texas"],
]

for (const [id, q] of missing) {
  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({ q, format: 'json', limit: '1' })
  const res = await fetch(url, {
    headers: { 'User-Agent': 'ShannonsBirthdayTrip/1.0' },
  })
  const data = await res.json()
  if (data[0]) {
    console.log(`${id}: ${data[0].lat}, ${data[0].lon}`)
  } else {
    console.log(`${id}: FAIL`)
  }
  await new Promise((r) => setTimeout(r, 1100))
}
