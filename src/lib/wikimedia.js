// Looks up a representative photo for a tea region/mountain from Wikimedia
// Commons at runtime. Commons content is freely licensed for this kind of
// use; we keep the request minimal (one thumbnail) and cache results so we
// never ask twice for the same query. If nothing suitable is found (which
// happens often — many mountains simply have no Commons coverage), callers
// should fall back to an illustrated placeholder rather than show nothing.
const cache = new Map()

export async function fetchCommonsImage(query) {
  if (!query) return null
  if (cache.has(query)) return cache.get(query)

  const url =
    'https://commons.wikimedia.org/w/api.php?' +
    new URLSearchParams({
      action: 'query',
      generator: 'search',
      gsrnamespace: '6',
      gsrsearch: query,
      gsrlimit: '1',
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      iiurlwidth: '700',
      format: 'json',
      origin: '*',
    })

  try {
    const res = await fetch(url)
    if (!res.ok) throw new Error('commons request failed')
    const data = await res.json()
    const pages = data?.query?.pages
    const page = pages ? Object.values(pages)[0] : null
    const info = page?.imageinfo?.[0]
    if (!info) {
      cache.set(query, null)
      return null
    }
    const rawArtist = info.extmetadata?.Artist?.value || ''
    const result = {
      url: info.thumburl || info.url,
      attribution: rawArtist.replace(/<[^>]+>/g, '').trim(),
      sourcePage: info.descriptionurl,
    }
    cache.set(query, result)
    return result
  } catch {
    cache.set(query, null)
    return null
  }
}
