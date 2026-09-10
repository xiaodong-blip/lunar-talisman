export type BlogCategory = 'zodiac' | 'chakra' | 'lunar' | 'crystal'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: BlogCategory
  coverImage: string
  date: string
  readTime: string
  content: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'zodiac-crystal-chakra-guide',
    title: 'How to Choose a Crystal by Color, Material, and Intention',
    excerpt: 'Use astrology as optional context, then choose a crystal by color, material, comfort, and the intention you want to carry.',
    category: 'zodiac',
    coverImage: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=1200',
    date: '2026-07-12',
    readTime: '6 min',
    content: `
## Start with the feeling you want to support

Astrology can be a playful starting point, but it does not need to decide your stone. Notice what you want to support: steadiness, creative flow, confidence, love, clarity, intuition, or stillness.

## Match color and material

- Warm red stones such as garnet and agate are traditional companions for grounding.
- Orange and golden stones such as carnelian and citrine are often chosen for creative flow and confidence.
- Pink stones such as rose quartz are commonly associated with love, compassion, and self-acceptance.
- Purple and clear stones such as amethyst and clear quartz suit quiet focus and stillness rituals.

## Choose the piece you will actually wear

Choose the piece whose color, weight, and care requirements fit your real routine. Crystal traditions are symbolic; the value is in the attention and ritual you bring to the piece.`,
  },
  {
    slug: 'seven-chakra-self-check',
    title: 'A Crystal Intention Self-Check for Everyday Wear',
    excerpt: 'Use body awareness, mood, and daily habits to notice which crystal intention feels most useful right now.',
    category: 'chakra',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200',
    date: '2026-07-15',
    readTime: '5 min',
    content: `
## Start with a simple check-in

No special tool is required. Ask: where do I feel most tense, which emotion keeps returning, and do I want more steadiness, expression, connection, or quiet focus?

## Seven intention cues

- Grounding: you want steadiness, a slower pace, or clearer boundaries.
- Creative flow: you want play, movement, or a way back into making.
- Confidence: you want a tactile cue for action and decision-making.
- Love: you want self-kindness, compassion, or a softer relationship ritual.
- Clarity: you want to speak, study, or listen with more presence.
- Intuition: you want quiet focus, dream journaling, or reflection.
- Stillness: you want a simple moonlit pause and a wider perspective.

## A small practice

Choose one cue and wear a matching stone for three days. The goal is not instant change; it is a steady reminder you can return to.`,
  },
  {
    slug: 'new-moon-crystal-ritual',
    title: 'New Moon Crystal Ritual: Set a Fresh Intention',
    excerpt: 'Use the new moon as a quiet moment to care for a stone, write an intention, and begin a new reflective cycle.',
    category: 'lunar',
    coverImage: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=1200',
    date: '2026-07-18',
    readTime: '7 min',
    content: `
## Why the new moon

The new moon is a quiet beginning. It is a useful time to tidy a space, care for a crystal, and name a direction without demanding a dramatic result.

## Prepare your space

- One crystal jewelry piece you want to wear
- Paper and a pen
- A mineral-safe cleansing method
- A quiet corner where you will not be interrupted

## Three gentle steps

Cleanse the piece, write one clear intention, then hold it for three quiet minutes. Keep the note beside your jewelry box so the intention can enter ordinary life with the piece.`,
  },
  {
    slug: 'amethyst-third-eye-secrets',
    title: 'Amethyst Meaning: Five Quiet Ways to Work with Purple Crystal',
    excerpt: 'Amethyst is traditionally associated with intuition, dreamwork, reflection, and a calmer focus ritual.',
    category: 'crystal',
    coverImage: 'https://images.unsplash.com/photo-1599658880436-c617b95cbc3f?w=1200',
    date: '2026-07-21',
    readTime: '4 min',
    content: `
## Why people choose amethyst

Amethyst's violet color is traditionally linked with intuition, insight, and the quieting of mental noise. These are symbolic meanings, not medical promises.

## Five practical rituals

1. Wear it before sleep as a cue to put the day down.
2. Keep it near a notebook when you want a quieter creative session.
3. Pair it with dream journaling and a three-minute pause.
4. Combine it with clear quartz when you want a simple, light-catching set.
5. Wear it close to the wrist or collarbone; comfort matters more than ceremony.

## Wearing note

If your attention feels crowded, choose one fixed time to wear amethyst and spend five minutes away from screens.`,
  },
  {
    slug: 'rose-quartz-heart-meditation',
    title: 'Rose Quartz Meaning: Love, Compassion, and Self-Acceptance',
    excerpt: 'Rose quartz is traditionally associated with love, self-acceptance, soft boundaries, and a gentle relationship ritual.',
    category: 'crystal',
    coverImage: 'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260525_160644_072a7f68-a101-4ded-a332-7d37707dbdd1.png&w=1280&q=85',
    date: '2026-07-24',
    readTime: '5 min',
    content: `
## Love is not only about romance

Rose quartz is often called the love stone. In traditional symbolism, its deeper theme is meeting yourself and others with softness without giving up your boundaries.

## A three-minute pause

Hold the stone in your palm and close your eyes. On the inhale, notice the space around your chest; on the exhale, let your shoulders soften.

Try the phrase: I can welcome love and keep clear boundaries.

## Everyday wear

Wear it on days when you want a gentle reminder for conversation, connection, gifting, or self-care.`,
  },
  {
    slug: 'full-moon-crystal-cleansing',
    title: 'Full Moon Crystal Cleansing: An Eight-Step Care Ritual',
    excerpt: 'Use the full moon as a reflective moment for gratitude, release, and mineral-aware crystal care.',
    category: 'lunar',
    coverImage: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200',
    date: '2026-07-28',
    readTime: '8 min',
    content: `
## Let the full moon mark a pause

The full moon can be a useful symbolic marker for gratitude and release. Keep the ritual simple and choose care methods that suit the mineral.

## Eight gentle steps

1. Clear a small surface.
2. Place the crystal on a natural cloth.
3. Choose a smoke-free, mineral-safe care method if preferred.
4. Write down three things you are ready to release.
5. Place the stone where indirect moonlight can reach it.
6. Sit for five minutes and notice your breathing.
7. Name one thing you appreciate.
8. In the morning, retrieve the crystal and wipe it gently.

## The return matters

When the ritual ends, return the piece to its box or daily rotation. Consistent, gentle care is more meaningful than a complicated ceremony.`,
  },
]
