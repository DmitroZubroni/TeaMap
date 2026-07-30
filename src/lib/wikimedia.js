// Looks up a representative dry-leaf photo from Wikimedia Commons at
// runtime. Commons content is freely licensed for this kind of use; we
// cache results so we never ask twice for the same query.
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
