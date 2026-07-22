export type TravelerSeed = {
  id: string
  name: string
  role: string
  color: string
  avatar: string
  isDirectorCandidate?: boolean
}

export const TRAVELERS: TravelerSeed[] = [
  {
    id: 'shannon',
    name: 'Shannon',
    role: 'Birthday lead / Director',
    color: '#e07a5f',
    avatar: '/travelers/shannon-ellie.png',
    isDirectorCandidate: true,
  },
  {
    id: 'william',
    name: 'William',
    role: 'Family',
    color: '#3d8b8a',
    avatar: '/travelers/william.png',
  },
  {
    id: 'sophia',
    name: 'Sophia',
    role: 'Family',
    color: '#f2a65a',
    avatar: '/travelers/sophia.png',
  },
  {
    id: 'ellie',
    name: 'Ellie',
    role: 'Family',
    color: '#7eb09b',
    avatar: '/travelers/ellie.png',
  },
]

export const HERO_IMAGE = '/hero/escape-room-family.png'
export const FAMILY_CARTOON_HERO = '/travelers/sophia-william-shannon-ellie.png'
export const ALT_HERO_IMAGE = '/travelers/sophia-william-shannon-ellie.png'
