const KEY = 'tea-atlas:locale'

export function getStoredLocale() {
  try {
    return localStorage.getItem(KEY) || 'en'
  } catch {
    // localStorage может быть недоступен (приватный режим и т.п.) —
    // тихо откатываемся к английскому по умолчанию.
    return 'en'
  }
}

export function setStoredLocale(locale) {
  try {
    localStorage.setItem(KEY, locale)
  } catch {
    // см. комментарий выше — просто не запоминаем выбор между визитами.
  }
}
