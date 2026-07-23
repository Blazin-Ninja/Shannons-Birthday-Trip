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
      'Leave at 7:00 AM from home. Land at the Hilton Shreveport on Market St around 3–4 PM. Shannon’s birthday road trip begins.',
    address: '6400 NW 24th St, Oklahoma City → Hilton Shreveport, 104 Market St',
  },
  {
    id: 'd2',
    dateLabel: 'Sun 7/28',
    title: 'Explore Shreveport!!',
    detail:
      'Full day in Shreveport / Bossier — riverfront, food, and a slow celebration pace. Second night at the Hilton on Market St.',
    address: 'Hilton Shreveport · 104 Market St, Shreveport, LA 71101',
  },
  {
    id: 'd3',
    dateLabel: 'Mon 7/29',
    title: 'Shreveport → Navarre',
    detail:
      'Leave by 12:00 PM. I-49 / I-10 east all day — Buc-ee’s, Gulf views, and arrive at Hampton Inn & Suites Navarre around 10–11 PM.',
    address: 'Hilton Shreveport → Hampton Inn & Suites, 7710 Navarre Pkwy',
  },
  {
    id: 'd4',
    dateLabel: 'Tue 7/30',
    title: 'Gulf Coast day one',
    detail:
      'Explore Navarre, Pensacola Beach, and the coast from Hampton Inn & Suites. Live. Laugh. Love.',
    address: 'Hampton Inn & Suites Navarre · 7710 Navarre Pkwy, FL 32566',
    birthdayPeak: true,
  },
  {
    id: 'd5',
    dateLabel: 'Wed 7/31',
    title: 'Gulf Coast day two',
    detail:
      'Another full birthday-peak day on the water — propose plans on the map and let Shannon call the shots.',
    address: 'Hampton Inn & Suites Navarre · 7710 Navarre Pkwy, FL 32566',
    birthdayPeak: true,
  },
  {
    id: 'd6',
    dateLabel: 'Thu 8/1',
    title: 'Navarre → Greenville',
    detail:
      'Leave by 12:00 PM. Roll west on I-10 and up into the Delta — overnight at Hotel 27 on Walnut St around 9:00 PM.',
    address: 'Hampton Inn Navarre → Hotel 27, 211 S Walnut St, Greenville, MS',
  },
  {
    id: 'd7',
    dateLabel: 'Fri 8/2',
    title: 'Go the fuck home!',
    detail:
      'Greenville → OKC. Maybe stop and say hi to AR family — who cares when you get home, it’s home.',
    address: 'Hotel 27, 211 S Walnut St, Greenville, MS → 6400 NW 24th St, Oklahoma City',
  },
]
