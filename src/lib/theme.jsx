import { createContext, useContext, useEffect, useState, useMemo } from 'react'

const THEME_STORAGE_KEY = 'teamap_theme'

const ThemeContext = createContext({
  theme: 'system',
  setTheme: () => {},
  resolvedTheme: 'light',
})

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'system'
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'system'
    } catch {
      return 'system'
    }
  })

  const [systemDark, setSystemDark] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  // Watch for system color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e) => setSystemDark(e.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const resolvedTheme = useMemo(() => {
    if (theme === 'dark') return 'dark'
    if (theme === 'light') return 'light'
    return systemDark ? 'dark' : 'light'
  }, [theme, systemDark])

  // Apply class to html element and update meta tags
  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement

    root.classList.remove('light', 'dark')
    root.classList.add(resolvedTheme)
    root.style.colorScheme = resolvedTheme

    // Update meta theme-color if present
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    const themeBg = resolvedTheme === 'dark' ? '#0D1410' : '#F7F5EE'
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeBg)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = themeBg
      document.head.appendChild(meta)
    }
  }, [resolvedTheme])

  const setTheme = (newTheme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme)
    } catch {
      // ignore
    }
  }

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      resolvedTheme,
    }),
    [theme, resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
