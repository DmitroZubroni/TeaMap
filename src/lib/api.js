// Tea data is fetched at runtime (never bundled into the JS) so the site
// always reflects the latest data without a rebuild. Primary source is the
// public GitHub repo's `main` branch via raw.githubusercontent.com — fast
// (Fastly CDN, ~50-200ms in testing), open CORS, and updates the moment
// something is pushed there. If that's ever unreachable (network hiccup,
// repo made private, rate limiting), we fall back to the copy bundled at
// build time under /public/tea-data, so the site still works either way.
const GITHUB_BASE = 'https://raw.githubusercontent.com/DmitroZubroni/TeaMenuFoundation/main'
const LOCAL_BASE = '/tea-data'

const cache = new Map()

async function fetchFrom(base, path) {
  const res = await fetch(`${base}/${path}`)
  if (!res.ok) throw new Error(`Не удалось загрузить ${path}: ${res.status}`)
  return res.json()
}

async function fetchJSON(path) {
  if (cache.has(path)) return cache.get(path)
  let data
  try {
    data = await fetchFrom(GITHUB_BASE, path)
  } catch (err) {
    try {
      data = await fetchFrom(LOCAL_BASE, path)
    } catch {
      throw err
    }
  }
  cache.set(path, data)
  return data
}

export function getCountries() {
  return fetchJSON('countries.json')
}

export function getCategories() {
  return fetchJSON('categories.json')
}

export function getSources() {
  return fetchJSON('sources.json')
}

export function getTeaIndex(countryId) {
  return fetchJSON(`teas/${countryId}.json`).catch(() => [])
}

export function getRegions(countryId) {
  return fetchJSON(`regions/${countryId}.json`).catch(() => [])
}

export function getTeaDetail(countryId, teaId) {
  return fetchJSON(`tea-details/${countryId}/${teaId}.json`)
}
