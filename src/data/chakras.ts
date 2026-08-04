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
    name: '海底轮',
    nameEn: 'Root Chakra',
    sanskrit: 'Muladhara',
    color: 'chakra-root',
    hex: '#C4816B',
    location: '脊柱底部',
    element: '土',
    crystals: ['红石榴石', '红碧玉', '黑曜石'],
    affirmation: '我安全，我扎根，我属于这片大地。',
    icon: 'Mountain',
  },
  {
    id: 'sacral',
    name: '脐轮',
    nameEn: 'Sacral Chakra',
    sanskrit: 'Svadhisthana',
    color: 'chakra-sacral',
    hex: '#D49A6A',
    location: '肚脐下方',
    element: '水',
    crystals: ['红玉髓', '月光石', '橙色方解石'],
    affirmation: '我拥抱创造力，我感受生命的流动。',
    icon: 'Droplets',
  },
  {
    id: 'solar',
    name: '太阳轮',
    nameEn: 'Solar Plexus',
    sanskrit: 'Manipura',
    color: 'chakra-solar',
    hex: '#D4B76A',
    location: '胃部',
    element: '火',
    crystals: ['黄水晶', '虎眼石', '琥珀'],
    affirmation: '我充满力量，我勇敢行动，我相信自己。',
    icon: 'Sun',
  },
  {
    id: 'heart',
    name: '心轮',
    nameEn: 'Heart Chakra',
    sanskrit: 'Anahata',
    color: 'chakra-heart',
    hex: '#8AA88A',
    location: '胸腔中央',
    element: '风',
    crystals: ['玫瑰晶', '绿玉髓', '粉碧玺'],
    affirmation: '我给予爱，我接受爱，我的心是敞开的。',
    icon: 'Heart',
  },
  {
    id: 'throat',
    name: '喉轮',
    nameEn: 'Throat Chakra',
    sanskrit: 'Vishuddha',
    color: 'chakra-throat',
    hex: '#8AA4B8',
    location: '喉咙',
    element: '以太',
    crystals: ['海蓝宝', '蓝纹玛瑙', '天河石'],
    affirmation: '我说出真相，我表达自我，我被听见。',
    icon: 'MessageCircle',
  },
  {
    id: 'third-eye',
    name: '眉心轮',
    nameEn: 'Third Eye',
    sanskrit: 'Ajna',
    color: 'chakra-third-eye',
    hex: '#8A8EB8',
    location: '眉心',
    element: '光',
    crystals: ['紫水晶', '青金石', '萤石'],
    affirmation: '我信任直觉，我洞察真相，我的视野清晰。',
    icon: 'Eye',
  },
  {
    id: 'crown',
    name: '顶轮',
    nameEn: 'Crown Chakra',
    sanskrit: 'Sahasrara',
    color: 'chakra-crown',
    hex: '#9B8EC4',
    location: '头顶',
    element: '意识',
    crystals: ['白水晶', '紫锂辉石', '月光石'],
    affirmation: '我与宇宙合一，我接受神圣指引，我是光。',
    icon: 'Sparkles',
  },
]
