import { useEffect } from 'react'

type PageMeta = {
  title: string
  description: string
  noindex?: boolean
  structuredData?: Record<string, unknown>
}

const containsChinese = /[\u3400-\u9fff]/

function englishMeta(value: string, fallback: string) {
  return containsChinese.test(value) ? fallback : value
}

export function usePageMeta({
  title,
  description,
  noindex = false,
  structuredData,
}: PageMeta) {
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

    const canonicalUrl = `${window.location.origin}${window.location.pathname}`
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

    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    robots.content = noindex ? 'noindex, nofollow, noarchive' : 'index, follow'

    const scriptId = 'lunar-talisman-page-jsonld'
    const existingScript = document.getElementById(scriptId)
    if (!structuredData) {
      existingScript?.remove()
      return
    }

    const script = existingScript ?? document.createElement('script')
    script.id = scriptId
    script.setAttribute('type', 'application/ld+json')
    script.textContent = JSON.stringify(structuredData)
    if (!existingScript) document.head.appendChild(script)
  }, [description, noindex, structuredData, title])
}
