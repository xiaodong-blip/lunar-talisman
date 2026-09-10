export interface Chakra {
  id: string
  name: string
  nameEn: string
  sanskrit: string
  color: string
  hex: string
  location: string
  element: string
  crystals: string[]
  affirmation: string
  icon: string
}

export const chakras: Chakra[] = [
  {
    id: 'root',
    name: 'Grounding',
    nameEn: 'Root Chakra',
    sanskrit: 'Muladhara',
    color: 'chakra-root',
    hex: '#C4816B',
    location: 'Base of the spine',
    element: 'Earth',
    crystals: ['Garnet', 'Red Jasper', 'Obsidian'],
    affirmation: 'I am safe, grounded, and at home in my body.',
    icon: 'Mountain',
  },
  {
    id: 'sacral',
    name: 'Creative Flow',
    nameEn: 'Sacral Chakra',
    sanskrit: 'Svadhisthana',
    color: 'chakra-sacral',
    hex: '#D49A6A',
    location: 'Below the navel',
    element: 'Water',
    crystals: ['Carnelian', 'Moonstone', 'Orange Calcite'],
    affirmation: 'I welcome creativity and let life move through me.',
    icon: 'Droplets',
  },
  {
    id: 'solar',
    name: 'Confidence',
    nameEn: 'Solar Plexus',
    sanskrit: 'Manipura',
    color: 'chakra-solar',
    hex: '#D4B76A',
    location: 'Upper abdomen',
    element: 'Fire',
    crystals: ['Citrine', "Tiger's Eye", 'Amber'],
    affirmation: 'I trust my power, take clear action, and believe in myself.',
    icon: 'Sun',
  },
  {
    id: 'heart',
    name: 'Love & Compassion',
    nameEn: 'Heart Chakra',
    sanskrit: 'Anahata',
    color: 'chakra-heart',
    hex: '#8AA88A',
    location: 'Centre of the chest',
    element: 'Air',
    crystals: ['Rose Quartz', 'Green Chalcedony', 'Pink Tourmaline'],
    affirmation: 'I give love, receive love, and make room for tenderness.',
    icon: 'Heart',
  },
  {
    id: 'throat',
    name: 'Expression & Clarity',
    nameEn: 'Throat Chakra',
    sanskrit: 'Vishuddha',
    color: 'chakra-throat',
    hex: '#8AA4B8',
    location: 'Throat and voice',
    element: 'Ether',
    crystals: ['Aquamarine', 'Blue Lace Agate', 'Amazonite'],
    affirmation: 'I speak with honesty, listen with care, and let my voice be heard.',
    icon: 'MessageCircle',
  },
  {
    id: 'third-eye',
    name: 'Intuition & Focus',
    nameEn: 'Third Eye',
    sanskrit: 'Ajna',
    color: 'chakra-third-eye',
    hex: '#8A8EB8',
    location: 'Space between the brows',
    element: 'Light',
    crystals: ['Amethyst', 'Lapis Lazuli', 'Fluorite'],
    affirmation: 'I trust my intuition, notice clearly, and make room for insight.',
    icon: 'Eye',
  },
  {
    id: 'crown',
    name: 'Stillness & Spirituality',
    nameEn: 'Crown Chakra',
    sanskrit: 'Sahasrara',
    color: 'chakra-crown',
    hex: '#9B8EC4',
    location: 'Crown of the head',
    element: 'Consciousness',
    crystals: ['Clear Quartz', 'Kunzite', 'Moonstone'],
    affirmation: 'I welcome stillness, perspective, and a wider sense of connection.',
    icon: 'Sparkles',
  },
]
