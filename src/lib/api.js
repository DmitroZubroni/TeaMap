// All tea data ships as static JSON under /public/tea-data and is loaded at
// runtime via fetch (never bundled) so the data repo can be updated without
// a frontend rebuild. See /public/tea-data/README.md for the schema.

const BASE = '/tea-data'

const cache = new Map()

async function fetchJSON(path) {
  if (cache.has(path)) return cache.get(path)
  const res = await fetch(`${BASE}/${path}`)
  if (!res.ok) {
    throw new Error(`Не удалось загрузить ${path}: ${res.status}`)
  }
  const data = await res.json()
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
