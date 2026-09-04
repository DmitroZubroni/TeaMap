import { useEffect, useState } from 'react'

// Возвращает значение, которое обновляется только после того, как
// пользователь перестал печатать на `delay` миллисекунд — избавляет от
// пересчёта фильтрации на каждое нажатие клавиши.
export function useDebouncedValue(value, delay = 200) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
