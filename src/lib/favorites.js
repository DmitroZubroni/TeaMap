import { useCallback, useState } from 'react'

const STORAGE_KEY = 'tea-atlas:favorites'

export function favoriteKey(countryId, teaId) {
  return `${countryId}:${teaId}`
}

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    // localStorage может быть недоступен (приватный режим браузера, отключены
    // куки и т.п.) — тихо откатываемся к пустому списку, не роняя сайт.
    return new Set()
  }
}

function persistFavorites(set) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]))
  } catch {
    // см. комментарий выше — просто не сохраняем между визитами.
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState(loadFavorites)

  const toggleFavorite = useCallback((countryId, teaId) => {
    setFavorites((prev) => {
      const key = favoriteKey(countryId, teaId)
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      persistFavorites(next)
      return next
    })
  }, [])

  const isFavorite = useCallback((countryId, teaId) => favorites.has(favoriteKey(countryId, teaId)), [favorites])

  return { favorites, toggleFavorite, isFavorite }
}
