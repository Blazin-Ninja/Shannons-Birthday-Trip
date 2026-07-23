import type { StopId } from './stops'

export type TripDestination = {
  id: string
  stopId: StopId
  name: string
  brand?: string
  address: string
  lat: number
  lng: number
  phone: string
  websiteUrl: string
  imageUrl: string
  gallery?: string[]
  checkIn?: string
  checkOut?: string
  nightsLabel: string
  tagline: string
  description: string
  amenities: string[]
  nearbySpotIds: string[]
}

export const TRIP_DESTINATIONS: TripDestination[] = [
  {
    id: 'hilton-shreveport',
    stopId: 'Shreveport',
    name: 'Hilton Shreveport',
    brand: 'Hilton',
    address: '104 Market St, Shreveport, LA 71101',
    lat: 32.5155,
    lng: -93.7495,
    phone: '(318) 698-0900',
    websiteUrl: 'https://www.hilton.com/en/hotels/shvsphf-hilton-shreveport/',
    imageUrl: '/hotels/hilton-shreveport.jpg',
    checkIn: '4:00 PM',
    checkOut: '11:00 AM',
    nightsLabel: 'Sat 7/27 – Sun 7/28 (2 nights)',
    tagline: 'Downtown riverfront tower on Market St',
    description:
      'High-rise Hilton connected to the Shreveport Convention Center in the Riverfront District. Red River views, rooftop pool, and walkable access to the aquarium, riverwalk, and Bossier nightlife across the bridge.',
    amenities: [
      'Rooftop heated pool',
      '24-hour fitness center',
      'Market 104 restaurant',
      'River & Rye lobby bar',
      'Coffee Talk Café (Starbucks)',
      'Room service',
      'Complimentary airport shuttle',
      'Free 2-mile area shuttle',
      'Convention center skybridge',
      'Non-smoking property',
    ],
    nearbySpotIds: [
      'shreveport-aquarium',
      'shreveport-sciport',
      'shreveport-riverfront',
      'bossier-boardwalk',
      'shreveport-auditorium',
      'herby-ks',
      'superior-grill-shreveport',
      'rw-norton-art',
      'splash-shreveport',
      'rws-casino',
    ],
  },
  {
    id: 'hampton-navarre',
    stopId: 'Navarre',
    name: 'Hampton Inn & Suites Navarre',
    brand: 'Hilton',
    address: '7710 Navarre Pkwy, Navarre, FL 32566',
    lat: 30.4024,
    lng: -86.9006,
    phone: '(850) 939-4848',
    websiteUrl:
      'https://www.hilton.com/en/hotels/pnsnvhx-hampton-suites-navarre/',
    imageUrl: '/hotels/hampton-navarre.jpg',
    checkIn: '3:00 PM',
    checkOut: '11:00 AM',
    nightsLabel: 'Mon 7/29 – Wed 7/31 (3 nights)',
    tagline: 'Gulf Coast home base — 1.5 miles from Navarre Beach',
    description:
      'Renovated Hampton on Navarre Parkway with complimentary hot breakfast, outdoor pool, and quick access to the beach bridge. Birthday-peak headquarters for Pensacola, Destin, and Emerald Coast day trips.',
    amenities: [
      'Free hot breakfast',
      'Outdoor swimming pool',
      'Fitness center',
      'Free Wi-Fi',
      'Free parking',
      'Meeting room',
      '24-hour front desk',
      'Business center',
      'Interior corridors',
      'Non-smoking rooms',
    ],
    nearbySpotIds: [
      'navarre-pier',
      'pensacola-beach',
      'fort-pickens',
      'naval-aviation',
      'gulf-breeze-zoo',
      'grand-marlin',
      'big-kahunas',
      'track-destin',
      'peg-leg-petes',
      'pensacola-boardwalk',
      'waterville-usa',
    ],
  },
  {
    id: 'hotel-27-greenville',
    stopId: 'Greenville',
    name: 'Hotel 27',
    address: '211 S Walnut St, Greenville, MS 38701',
    lat: 33.4114,
    lng: -91.0654,
    phone: '(662) 702-3681',
    websiteUrl: 'https://www.hotel27.org/',
    imageUrl: '/hotels/hotel-27-greenville.jpg',
    checkIn: '3:00 PM',
    checkOut: '11:00 AM',
    nightsLabel: 'Thu 8/1 (1 night)',
    tagline: 'Historic Delta boutique — the old Levee Board Building',
    description:
      'Greenville’s only boutique hotel in the restored Mississippi Levee Board buildings. Courtyard, complimentary breakfast, and a floral mural on the portico — walking distance to Doe’s Eat Place and downtown Delta history.',
    amenities: [
      'Complimentary continental breakfast',
      'Free Wi-Fi',
      'Free self parking',
      'Historic courtyard',
      'Meeting room (Mulberry)',
      'Suites with kitchenettes',
      '24-hour front desk',
      'Non-profit boutique hotel',
      'Stash Hotel Rewards',
      'Walkable downtown location',
    ],
    nearbySpotIds: [
      'doe-brookhaven',
      'greenville-walnut',
      'greenville-delta',
      'dockery-farms',
    ],
  },
]

export function destinationForStop(stopId: StopId): TripDestination | undefined {
  return TRIP_DESTINATIONS.find((d) => d.stopId === stopId)
}

export function destinationById(id: string): TripDestination | undefined {
  return TRIP_DESTINATIONS.find((d) => d.id === id)
}
