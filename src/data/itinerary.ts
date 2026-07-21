export type ItineraryDay = {
  id: string
  dateLabel: string
  title: string
  detail: string
  birthdayPeak?: boolean
}

export const ITINERARY: ItineraryDay[] = [
  {
    id: 'd1',
    dateLabel: 'Sat 7/27',
    title: 'OKC → Shreveport',
    detail: 'Leave ~9:00 AM. Arrive Shreveport around 3–4 PM. Shannon’s birthday road trip begins.',
  },
  {
    id: 'd2',
    dateLabel: 'Sun 7/28',
    title: 'Explore Shreveport',
    detail: 'Full day in Shreveport / Bossier — stretch, eat well, celebrate the journey.',
  },
  {
    id: 'd3',
    dateLabel: 'Mon 7/29',
    title: 'Shreveport → Pensacola',
    detail: 'Leave by 10:00 AM. Long drive day — aim for Pensacola around 10–11 PM. Hit those I-10 Buc-ee’s.',
  },
  {
    id: 'd4',
    dateLabel: 'Tue–Wed 7/30–7/31',
    title: 'Pensacola birthday peak',
    detail: 'Two full days on the Gulf for Shannon’s birthday — beach, boardwalk, Fort Pickens vibes.',
    birthdayPeak: true,
  },
  {
    id: 'd5',
    dateLabel: 'Thu 8/1',
    title: 'Pensacola → Lake Village',
    detail: 'Leave by 10:00 AM. Overnight in Lake Village, Arkansas (~8 PM).',
  },
  {
    id: 'd6',
    dateLabel: 'Fri 8/2',
    title: 'Lake Village → OKC',
    detail: 'Head home. Optional family stop along the way. Shannon’s birthday trip wrap.',
  },
]
