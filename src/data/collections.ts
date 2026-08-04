export interface Collection {
  id: string
  name: string
  subtitle: string
  description: string
  image: string
  itemCount: number
  chakraColor: 'crown' | 'heart' | 'solar'
  chakraName: string
  gradient: string
}

export const collections: Collection[] = [
  {
    id: 'zodiac',
    name: '星座守护',
    subtitle: 'Zodiac Collection',
    description:
      '十二星座专属水晶，每颗都由对应脉轮能量加持，唤醒你的星盘力量。',
    image: 'https://images.unsplash.com/photo-1599658880436-c617b95cbc3f?w=600',
    itemCount: 12,
    chakraColor: 'crown',
    chakraName: '顶轮',
    gradient:
      'linear-gradient(135deg, rgba(155,142,196,0.2), rgba(155,142,196,0.05))',
  },
  {
    id: 'chakra',
    name: '脉轮疗愈',
    subtitle: 'Chakra Collection',
    description: '七脉轮完整疗愈套装，每颗水晶精准对应你的能量中心。',
    image: 'https://images.unsplash.com/photo-1605100802531-9abce0fdda72?w=600',
    itemCount: 7,
    chakraColor: 'heart',
    chakraName: '心轮',
    gradient:
      'linear-gradient(135deg, rgba(138,168,138,0.2), rgba(138,168,138,0.05))',
  },
  {
    id: 'lunar',
    name: '月相仪式',
    subtitle: 'Lunar Collection',
    description: '从新月到满月，每一件水晶都由特定月相时刻加持。',
    image: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=600',
    itemCount: 8,
    chakraColor: 'solar',
    chakraName: '太阳轮',
    gradient:
      'linear-gradient(135deg, rgba(212,183,106,0.2), rgba(212,183,106,0.05))',
  },
]
