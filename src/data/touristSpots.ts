export type SpotKind = 'landmark' | 'food' | 'nature' | 'fun' | 'stop'

export type TouristSpot = {
  id: string
  name: string
  lat: number
  lng: number
  segment: string
  blurb: string
  kind: SpotKind
  brand?: string
  viaDfwOnly?: boolean
}

export const TOURIST_SPOTS: TouristSpot[] = [
  {
    id: 'okc-bricktown',
    name: 'Bricktown',
    lat: 35.4654,
    lng: -97.5101,
    segment: 'okc-shreveport',
    blurb: 'OKC kickoff energy — canals, lights, and a last hometown bite.',
    kind: 'fun',
  },
  {
    id: 'okc-myriad',
    name: 'Myriad Botanical Gardens',
    lat: 35.4658,
    lng: -97.5183,
    segment: 'okc-shreveport',
    blurb: 'A calm OKC stretch before the highway miles begin.',
    kind: 'nature',
  },
  {
    id: 'shreveport-sciport',
    name: 'Sci-Port Discovery Center',
    lat: 32.5155,
    lng: -93.7473,
    segment: 'shreveport',
    blurb: 'Hands-on stop if the kids need to move after the drive.',
    kind: 'fun',
  },
  {
    id: 'shreveport-riverfront',
    name: 'Shreveport Riverfront',
    lat: 32.5145,
    lng: -93.7492,
    segment: 'shreveport',
    blurb: 'Red River walk for sunset photos on Shannon’s birthday trip.',
    kind: 'nature',
  },
  {
    id: 'bucees-pass-christian',
    name: "Buc-ee's Pass Christian",
    lat: 30.3742,
    lng: -89.2475,
    segment: 'shreveport-pensacola',
    blurb: 'I-10 Exit 24 — beaver nuggets and famously clean pit stops (~0 min detour).',
    kind: 'stop',
    brand: "Buc-ee's",
  },
  {
    id: 'bucees-loxley',
    name: "Buc-ee's Loxley",
    lat: 30.6185,
    lng: -87.7369,
    segment: 'shreveport-pensacola',
    blurb: 'I-10 Exit 49 — last mega-stop before Pensacola beach energy.',
    kind: 'stop',
    brand: "Buc-ee's",
  },
  {
    id: 'bucees-pass-christian-return',
    name: "Buc-ee's Pass Christian (return)",
    lat: 30.3742,
    lng: -89.2475,
    segment: 'pensacola-lakevillage',
    blurb: 'Same I-10 beaver stop heading west toward Arkansas.',
    kind: 'stop',
    brand: "Buc-ee's",
  },
  {
    id: 'bucees-loxley-return',
    name: "Buc-ee's Loxley (leaving beach)",
    lat: 30.6185,
    lng: -87.7369,
    segment: 'pensacola-lakevillage',
    blurb: 'First fuel + snack reload after Pensacola on the way to Lake Village.',
    kind: 'stop',
    brand: "Buc-ee's",
  },
  {
    id: 'pensacola-beach',
    name: 'Pensacola Beach',
    lat: 30.3322,
    lng: -87.1408,
    segment: 'pensacola',
    blurb: 'Sugar-white sand and emerald water — Shannon’s birthday peak days.',
    kind: 'nature',
  },
  {
    id: 'fort-pickens',
    name: 'Fort Pickens',
    lat: 30.3269,
    lng: -87.2831,
    segment: 'pensacola',
    blurb: 'Historic fort + Gulf Islands National Seashore trails.',
    kind: 'landmark',
  },
  {
    id: 'naval-aviation',
    name: 'National Naval Aviation Museum',
    lat: 30.3496,
    lng: -87.2774,
    segment: 'pensacola',
    blurb: 'Indoor cool-down with jets and Blue Angels lore.',
    kind: 'landmark',
  },
  {
    id: 'pensacola-boardwalk',
    name: 'Pensacola Beach Boardwalk',
    lat: 30.3335,
    lng: -87.1402,
    segment: 'pensacola',
    blurb: 'Dinner, shops, and birthday-night lights by the water.',
    kind: 'food',
  },
  {
    id: 'lake-village-delta',
    name: 'Mississippi River Delta views',
    lat: 33.3285,
    lng: -91.16,
    segment: 'lakevillage',
    blurb: 'Quiet overnight stretch before the final push home.',
    kind: 'nature',
  },
  {
    id: 'bucees-denton',
    name: "Buc-ee's Denton",
    lat: 33.1846,
    lng: -97.1331,
    segment: 'okc-shreveport',
    blurb: 'Only if the crew takes OKC → DFW → I-20.',
    kind: 'stop',
    brand: "Buc-ee's",
    viaDfwOnly: true,
  },
  {
    id: 'bucees-terrell',
    name: "Buc-ee's Terrell",
    lat: 32.7357,
    lng: -96.2753,
    segment: 'okc-shreveport',
    blurb: 'I-20 east of Dallas — DFW corridor only.',
    kind: 'stop',
    brand: "Buc-ee's",
    viaDfwOnly: true,
  },
]
