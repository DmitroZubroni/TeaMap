// Данные о чае запрашиваются в рантайме (никогда не бандлятся в JS), поэтому
// сайт всегда показывает актуальные данные без пересборки. Основной
// источник — публичный репозиторий на GitHub, ветка `main`, через
// raw.githubusercontent.com — быстро (CDN Fastly, ~50–200 мс по замерам),
// CORS открыт, обновления появляются сразу после пуша в репозиторий. Если
// он вдруг окажется недоступен (сбой сети, репозиторий стал приватным,
// лимиты запросов) — используется резервная копия, собранная в бандл из
// /public/tea-data, чтобы сайт работал в любом случае.
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
