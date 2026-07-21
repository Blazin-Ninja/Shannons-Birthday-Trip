import { publicAsset } from '../lib/assets'

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
    avatar: publicAsset('travelers/shannon-ellie.png'),
    isDirectorCandidate: true,
  },
  {
    id: 'william',
    name: 'William',
    role: 'Family',
    color: '#3d8b8a',
    avatar: publicAsset('travelers/william.png'),
  },
  {
    id: 'sophia',
    name: 'Sophia',
    role: 'Family',
    color: '#f2a65a',
    avatar: publicAsset('travelers/sophia.png'),
  },
  {
    id: 'ellie',
    name: 'Ellie',
    role: 'Family',
    color: '#7eb09b',
    avatar: publicAsset('travelers/ellie.png'),
  },
  {
    id: 'matthew',
    name: 'Matthew',
    role: 'Trip guest',
    color: '#4a6fa5',
    avatar: publicAsset('travelers/matthew-celina.png'),
  },
  {
    id: 'celina',
    name: 'Celina',
    role: 'Trip guest',
    color: '#c77d99',
    avatar: publicAsset('travelers/matthew-celina.png'),
  },
]

export const HERO_IMAGE = publicAsset('hero/disney-family-hero.png')
export const ALT_HERO_IMAGE = publicAsset(
  'travelers/sophia-william-shannon-ellie.png',
)
