const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow'

// IndexNow ownership keys are intentionally public: the same key must be served
// from the site root so search engines can verify this domain before accepting URLs.
export const INDEXNOW_KEY = 'd1003ee4c3e3a73628942ada824cc41d42e28228e8241ceb'

function siteOrigin() {
  const configured = process.env.SITE_URL || 'https://lunartalisman.com'
  try {
    return new URL(configured).origin
  } catch {
    return 'https://lunartalisman.com'
  }
}

export function indexNowKeyLocation() {
  return `${siteOrigin()}/${INDEXNOW_KEY}.txt`
}

export function indexNowUrl(path) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return null
  try {
    return new URL(path, siteOrigin()).href
  } catch {
    return null
  }
}

function ownCanonicalUrls(paths) {
  const origin = siteOrigin()
  return [...new Set(paths.map(indexNowUrl).filter((url) => url?.startsWith(`${origin}/`)))].slice(
    0,
    10_000,
  )
}

export async function submitIndexNow(paths) {
  const urlList = ownCanonicalUrls(Array.isArray(paths) ? paths : [])
  if (!urlList.length) {
    return { attempted: false, accepted: false, submitted: 0, status: 0 }
  }

  const origin = new URL(siteOrigin())
  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': 'Lunar-Talisman-IndexNow/1.0',
    },
    body: JSON.stringify({
      host: origin.hostname,
      key: INDEXNOW_KEY,
      keyLocation: indexNowKeyLocation(),
      urlList,
    }),
  })

  return {
    attempted: true,
    accepted: response.ok,
    submitted: urlList.length,
    status: response.status,
  }
}
