// Данные о чае запрашиваются в рантайме (никогда не бандлятся в JS), поэтому
// сайт всегда показывает актуальные данные без пересборки. Основной
// источник — публичный репозиторий на GitHub, ветка `main`, через
// raw.githubusercontent.com — быстро (CDN Fastly, ~50–200 мс по замерам),
// CORS открыт, обновления появляются сразу после пуша в репозиторий. Если
// он вдруг окажется недоступен (сбой сети, репозиторий стал приватным,
// лимиты запросов) — используется резервная копия, собранная в бандл из
// /public/tea-data, чтобы сайт работал в любом случае.
import { getStoredLocale } from './locale'

const GITHUB_BASE = 'https://raw.githubusercontent.com/DmitroZubroni/TeaMenuFoundation/main'
const LOCAL_BASE = '/tea-data'

// Английская версия базы лежит в подпапке `en/` того же репозитория, зеркаля
// структуру русской версии (которая как была в корне без префикса, так там
// и остаётся). Локаль читаем один раз при загрузке страницы: переключение
// языка перезагружает страницу (см. i18n.jsx), так что «жить обновлённой»
// прямо в рантайме этому модулю не нужно.
const DATA_LOCALE = getStoredLocale()

function localizedPath(path) {
  return DATA_LOCALE === 'en' ? `en/${path}` : path
}

const cache = new Map()

async function fetchFrom(base, path) {
  const res = await fetch(`${base}/${path}`)
  if (!res.ok) throw new Error(`Не удалось загрузить ${path}: ${res.status}`)
  return res.json()
}

// Цепочка отказоустойчивости: сначала GitHub на нужном языке, если файла там
// ещё нет (перевод ещё не готов/не запушен) — GitHub на русском (лучше
// показать русский текст, чем сломать страницу), и только если GitHub
// целиком недоступен — локальная резервная копия (она пока только на
// русском, см. README).
async function fetchJSON(path) {
  const key = localizedPath(path)
  if (cache.has(key)) return cache.get(key)

  let data
  try {
    data = await fetchFrom(GITHUB_BASE, key)
  } catch (err) {
    if (key !== path) {
      // Английского файла ещё нет — тихо откатываемся на русский оригинал.
      try {
        data = await fetchFrom(GITHUB_BASE, path)
      } catch {
        data = undefined
      }
    }
    if (data === undefined) {
      try {
        data = await fetchFrom(LOCAL_BASE, key)
      } catch {
        try {
          data = await fetchFrom(LOCAL_BASE, path)
        } catch {
          throw err
        }
      }
    }
  }
  cache.set(key, data)
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
