import { useEffect } from 'react'

type PageMeta = {
  title: string
  description: string
  noindex?: boolean
  structuredData?: Record<string, unknown>
}

const containsChinese = /[\u3400-\u9fff]/
const SITE_ORIGIN = 'https://lunartalisman.com'
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/og-image.svg`

function englishMeta(value: string, fallback: string) {
  return containsChinese.test(value) ? fallback : value
}

export function usePageMeta({
  title,
  description,
  noindex = false,
  structuredData,
}: PageMeta) {
  const serializedStructuredData = structuredData ? JSON.stringify(structuredData) : ''

  useEffect(() => {
    const safeTitle = englishMeta(title, 'Lunar Talisman · Crystal Rituals')
    const safeDescription = englishMeta(
      description,
      'Discover crystal talismans shaped by moonlight, ritual, and the seven chakras.',
    )

    document.title = safeTitle

    let descriptionMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    )

    if (!descriptionMeta) {
      descriptionMeta = document.createElement('meta')
      descriptionMeta.name = 'description'
      document.head.appendChild(descriptionMeta)
    }

    descriptionMeta.content = safeDescription

    const canonicalUrl = `${SITE_ORIGIN}${window.location.pathname}`
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = canonicalUrl

    const setMeta = (property: string, content: string) => {
      let meta = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('property', property)
        document.head.appendChild(meta)
      }
      meta.content = content
    }

    setMeta('og:title', safeTitle)
    setMeta('og:description', safeDescription)
    setMeta('og:url', canonicalUrl)
    setMeta('og:type', 'website')
    setMeta('og:site_name', 'Lunar Talisman')
    setMeta('og:locale', 'en_US')
    setMeta('og:image', DEFAULT_OG_IMAGE)
    setMeta('og:image:alt', 'Lunar Talisman crystal jewelry and chakra rituals')

    let twitterCard = document.querySelector<HTMLMetaElement>('meta[name="twitter:card"]')
    if (!twitterCard) {
      twitterCard = document.createElement('meta')
      twitterCard.name = 'twitter:card'
      document.head.appendChild(twitterCard)
    }
    twitterCard.content = 'summary_large_image'

    const setNameMeta = (name: string, content: string) => {
      let meta = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.name = name
        document.head.appendChild(meta)
      }
      meta.content = content
    }

    setNameMeta('author', 'Lunar Talisman')
    setNameMeta('twitter:title', safeTitle)
    setNameMeta('twitter:description', safeDescription)
    setNameMeta('twitter:image', DEFAULT_OG_IMAGE)
    setNameMeta('twitter:image:alt', 'Lunar Talisman crystal jewelry and chakra rituals')

    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    robots.content = noindex ? 'noindex, nofollow, noarchive' : 'index, follow'

    let alternate = document.querySelector<HTMLLinkElement>('link[rel="alternate"][hreflang="en"]')
    if (!alternate) {
      alternate = document.createElement('link')
      alternate.rel = 'alternate'
      alternate.hreflang = 'en'
      document.head.appendChild(alternate)
    }
    alternate.href = canonicalUrl

    let defaultAlternate = document.querySelector<HTMLLinkElement>(
      'link[rel="alternate"][hreflang="x-default"]',
    )
    if (!defaultAlternate) {
      defaultAlternate = document.createElement('link')
      defaultAlternate.rel = 'alternate'
      defaultAlternate.hreflang = 'x-default'
      document.head.appendChild(defaultAlternate)
    }
    defaultAlternate.href = canonicalUrl

    const scriptId = 'lunar-talisman-page-jsonld'
    const existingScript = document.getElementById(scriptId)
    if (!serializedStructuredData) {
      existingScript?.remove()
      return
    }

    const script = existingScript ?? document.createElement('script')
    script.id = scriptId
    script.setAttribute('type', 'application/ld+json')
    script.textContent = serializedStructuredData
    if (!existingScript) document.head.appendChild(script)
  }, [description, noindex, serializedStructuredData, title])
}
