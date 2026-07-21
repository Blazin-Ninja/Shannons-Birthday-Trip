export type TravelerSeed = {
  id: string
  name: string
  role: string
  color: string
  avatar: string
  isDirectorCandidate?: boolean
}

const asset = (path: string) =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

export const TRAVELERS: TravelerSeed[] = [
  {
    id: 'shannon',
    name: 'Shannon',
    role: 'Birthday lead / Director',
    color: '#e07a5f',
    avatar: asset('travelers/shannon-ellie.png'),
    isDirectorCandidate: true,
  },
  {
    id: 'william',
    name: 'William',
    role: 'Family',
    color: '#3d8b8a',
    avatar: asset('travelers/william.png'),
  },
  {
    id: 'sophia',
    name: 'Sophia',
    role: 'Family',
    color: '#f2a65a',
    avatar: asset('travelers/sophia.png'),
  },
  {
    id: 'ellie',
    name: 'Ellie',
    role: 'Family',
    color: '#7eb09b',
    avatar: asset('travelers/ellie.png'),
  },
  {
    id: 'matthew',
    name: 'Matthew',
    role: 'Trip guest',
    color: '#4a6fa5',
    avatar: asset('travelers/matthew-celina.png'),
  },
  {
    id: 'celina',
    name: 'Celina',
    role: 'Trip guest',
    color: '#c77d99',
    avatar: asset('travelers/matthew-celina.png'),
  },
]

export const HERO_IMAGE = asset('hero/escape-room-family.png')
export const ALT_HERO_IMAGE = asset('travelers/sophia-william-shannon-ellie.png')
