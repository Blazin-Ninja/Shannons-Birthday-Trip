import type { TouristSpot } from './touristSpots'

type Enrichment = Pick<TouristSpot, 'description' | 'websiteUrl' | 'mapsUrl'>

const ENRICHMENTS: Record<string, Enrichment> = {
  'okc-memorial': {
    description:
      'Outdoor memorial and museum honoring the 1995 Oklahoma City bombing victims. Quiet reflection, survivor stories, and a meaningful send-off before the road trip.',
    websiteUrl: 'https://www.okcmemorial.org/',
    mapsUrl: 'https://www.google.com/maps/place/Oklahoma+City+National+Memorial+%26+Museum/',
  },
  'okc-bricktown': {
    description:
      'Brick-lined canal district with restaurants, mini-golf, water taxis, and evening lights — easy family dinner before hitting I-35.',
    websiteUrl: 'https://www.visitokc.com/things-to-do/districts/bricktown/',
    mapsUrl: 'https://www.google.com/maps/place/Bricktown,+Oklahoma+City,+OK/',
  },
  'shreveport-sciport': {
    description:
      'Hands-on science center with an IMAX dome, space exhibits, and kid-friendly labs — great rainy-day option in Shreveport.',
    websiteUrl: 'https://sciport.org/',
    mapsUrl: 'https://www.google.com/maps/place/Sci-Port+Discovery+Center/',
  },
  'naval-aviation': {
    description:
      'Free-admission naval aviation museum with historic aircraft, cockpits, and Blue Angels history. Huge hangars and AC for hot Gulf afternoons.',
    websiteUrl: 'https://www.navalaviationmuseum.org/',
    mapsUrl: 'https://www.google.com/maps/place/National+Naval+Aviation+Museum/',
  },
  'pensacola-beach': {
    description:
      'Emerald water and sugar-white sand on the Gulf — rent chairs, splash in the surf, and grab birthday photos on the Pensacola Beach sign.',
    websiteUrl: 'https://www.visitpensacola.com/beaches/pensacola-beach/',
    mapsUrl: 'https://www.google.com/maps/place/Pensacola+Beach,+FL/',
  },
  'uss-alabama': {
    description:
      'Tour the WWII battleship USS Alabama, submarine USS Drum, and aircraft pavilion on Mobile Bay. One of the best family stops on I-10.',
    websiteUrl: 'https://www.ussalabama.com/',
    mapsUrl: 'https://www.google.com/maps/place/USS+Alabama+Battleship+Memorial+Park/',
  },
  'vicksburg-nmp': {
    description:
      '16-mile driving tour of the Vicksburg siege lines with monuments, cannons, and the USS Cairo gunboat. Stretch legs and learn Civil War history.',
    websiteUrl: 'https://www.nps.gov/vick/',
    mapsUrl: 'https://www.google.com/maps/place/Vicksburg+National+Military+Park/',
  },
  'hot-springs': {
    description:
      'Historic Bathhouse Row, mountain views, and easy nature trails in America’s oldest federal reserve. Dip toes in the springs or stroll Grand Avenue.',
    websiteUrl: 'https://www.nps.gov/hosp/',
    mapsUrl: 'https://www.google.com/maps/place/Hot+Springs+National+Park/',
  },
}

export function enrichSpot(spot: TouristSpot): TouristSpot {
  const extra = ENRICHMENTS[spot.id]
  if (!extra) return spot
  return { ...spot, ...extra }
}

export function enrichSpots(spots: TouristSpot[]): TouristSpot[] {
  return spots.map(enrichSpot)
}
