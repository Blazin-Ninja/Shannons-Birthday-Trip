export type ItineraryDay = {
  id: string
  dateLabel: string
  title: string
  detail: string
  address?: string
  birthdayPeak?: boolean
}

export const ITINERARY: ItineraryDay[] = [
  {
    id: 'd1',
    dateLabel: 'Sat 7/27',
    title: 'OKC → Shreveport',
    detail:
      'Leave at 7:00 AM from home. Land in Shreveport around 3–4 PM. Shannon’s birthday road trip begins.',
    address: '6400 NW 24th St, Oklahoma City → 104 Market St, Shreveport',
  },
  {
    id: 'd2',
    dateLabel: 'Sun 7/28',
    title: 'Explore Shreveport!!',
    detail:
      'Full day in Shreveport / Bossier — riverfront, food, and a slow celebration pace. Second night at Market St.',
    address: '104 Market St, Shreveport, LA 71101',
  },
  {
    id: 'd3',
    dateLabel: 'Mon 7/29',
    title: 'Shreveport → Navarre',
    detail:
      'Leave by 12:00 PM. I-49 / I-10 east all day — Buc-ee’s, Gulf views, and be home at the beach rental around 10–11 PM.',
    address: '104 Market St, Shreveport → 7710 Navarre Pkwy, Navarre, FL',
  },
  {
    id: 'd4',
    dateLabel: 'Tue 7/30',
    title: 'Gulf Coast day one',
    detail:
      'Explore Navarre, Pensacola Beach, and the coast. Live. Laugh. Love.',
    address: '7710 Navarre Pkwy, Navarre, FL 32566',
    birthdayPeak: true,
  },
  {
    id: 'd5',
    dateLabel: 'Wed 7/31',
    title: 'Gulf Coast day two',
    detail:
      'Another full birthday-peak day on the water — propose plans on the map and let Shannon call the shots.',
    address: '7710 Navarre Pkwy, Navarre, FL 32566',
    birthdayPeak: true,
  },
  {
    id: 'd6',
    dateLabel: 'Thu 8/1',
    title: 'Navarre → Greenville',
    detail:
      'Leave by 12:00 PM. Roll west on I-10 and up into the Delta — target Greenville around 9:00 PM for the night.',
    address: '7710 Navarre Pkwy, Navarre → 211 S Walnut St, Greenville, MS',
  },
  {
    id: 'd7',
    dateLabel: 'Fri 8/2',
    title: 'Go the fuck home!',
    detail:
      'Greenville → OKC. Maybe stop and say hi to AR family — who cares when you get home, it’s home.',
    address: '211 S Walnut St, Greenville, MS → 6400 NW 24th St, Oklahoma City',
  },
]
