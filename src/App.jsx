import { useCallback, useEffect, useMemo, useRef, useState, Suspense, lazy } from 'react'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import TeaPanel from './components/TeaPanel'
import { getCountries, getCategories, getTeaIndex } from './lib/api'
import { I18nProvider, useI18n } from './lib/i18n'
import { useFavorites } from './lib/favorites'

// maplibre-gl — самая тяжёлая зависимость в приложении. Вынос её в отдельный
// чанк позволяет сайдбару/каркасу отрисоваться и стать интерактивным сразу,
// пока карта грузится отдельно за своим собственным индикатором загрузки, не
// блокируя первую отрисовку всей страницы.
const MapView = lazy(() => import('./components/MapView'))

function MapLoading() {
  const { t } = useI18n()
  return (
    <div className="absolute inset-0 grid place-items-center bg-ink">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-porcelain/20 border-t-gold animate-spin" />
        <p className="font-mono text-[11px] uppercase tracking-widest text-porcelain/50">{t('mapLoading')}</p>
      </div>
    </div>
  )
}

// Разбирает URL вида ?country=china&region=wuyi&tea=da_hong_pao в объект
// маршрута. Query-параметры на корневом пути выбраны намеренно: они не
// требуют никакой особой настройки на хостинге (в отличие от «красивых»
// путей вида /china/wuyi/da_hong_pao, которым нужен SPA-fallback на сервере,
// которого может не быть на статическом хостинге).
function parseRoute(search) {
  const params = new URLSearchParams(search)
  const countryId = params.get('country')
  if (!countryId) return null
  return {
    countryId,
    regionId: params.get('region') || null,
    teaId: params.get('tea') || null,
  }
}

function routeToUrl(nav, selectedTea) {
  const params = new URLSearchParams()
  if (nav.country) {
    params.set('country', nav.country.id)
    if (nav.region && nav.regionId) params.set('region', nav.regionId)
    if (selectedTea) params.set('tea', selectedTea.teaId)
  }
  const search = params.toString()
  return search ? `${window.location.pathname}?${search}` : window.location.pathname
}

function AppInner() {
  const mapRef = useRef(null)
  const [countries, setCountries] = useState([])
  const [categories, setCategories] = useState([])
  const [allTeas, setAllTeas] = useState([]) // every tea across every active country, for global search
  const [nav, setNav] = useState({
    stage: 'world',
    country: null,
    region: null,
    regionId: null,
    regions: [],
    teas: [],
    loading: false,
  })
  const [selectedTea, setSelectedTea] = useState(null) // { countryId, teaId }
  const [toast, setToast] = useState(null)
  const [hiddenCategories, setHiddenCategories] = useState(() => new Set())
  const [pendingRoute, setPendingRoute] = useState(() => parseRoute(window.location.search))
  const { favorites, toggleFavorite, isFavorite } = useFavorites()

  useEffect(() => {
    getCountries().then(setCountries)
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    const active = countries.filter((c) => c.teaCount > 0)
    if (!active.length) return
    let cancelled = false
    Promise.all(
      active.map((c) => getTeaIndex(c.id).then((teas) => teas.map((t) => ({ ...t, countryId: c.id }))))
    ).then((lists) => {
      if (!cancelled) setAllTeas(lists.flat())
    })
    return () => {
      cancelled = true
    }
  }, [countries])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const handleSelectTea = useCallback((countryId, teaId) => {
    setSelectedTea({ countryId, teaId })
  }, [])

  const handleSelectTeaAndFly = useCallback((countryId, tea) => {
    mapRef.current?.flyToTeaInCountry(countryId, tea)
    setSelectedTea({ countryId, teaId: tea.id })
  }, [])

  const handlePickGlobalTea = useCallback((tea) => {
    mapRef.current?.flyToTeaInCountry(tea.countryId, tea)
    setSelectedTea({ countryId: tea.countryId, teaId: tea.id })
  }, [])

  const toggleCategory = useCallback((catId) => {
    setHiddenCategories((prev) => {
      const next = new Set(prev)
      if (next.has(catId)) next.delete(catId)
      else next.add(catId)
      return next
    })
  }, [])

  // --- ссылка → приложение: реагируем на кнопки «назад/вперёд» браузера ---
  useEffect(() => {
    const onPopState = () => setPendingRoute(parseRoute(window.location.search))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  // --- ссылка → приложение: постепенно «долетаем» до того, что указано в
  // URL, по шагу за раз (страна → регион → чай), пересчитываясь по мере
  // того, как асинхронно подгружаются данные ---
  useEffect(() => {
    if (!pendingRoute || !countries.length) return
    const country = countries.find((c) => c.id === pendingRoute.countryId)
    if (!country || country.teaCount === 0) {
      setPendingRoute(null)
      return
    }

    if (nav.country?.id !== pendingRoute.countryId) {
      mapRef.current?.flyToCountryId(pendingRoute.countryId)
      return
    }
    if (nav.loading) return

    if (pendingRoute.regionId && nav.regionId !== pendingRoute.regionId) {
      const region = nav.regions.find((r) => r.id === pendingRoute.regionId)
      if (region) {
        mapRef.current?.flyToRegion(region)
        return
      }
    }
    if (!pendingRoute.regionId && nav.region) {
      mapRef.current?.clearRegionFocus()
      return
    }

    if (pendingRoute.teaId) {
      if (!selectedTea || selectedTea.teaId !== pendingRoute.teaId) {
        const tea = nav.teas.find((t) => t.id === pendingRoute.teaId)
        if (tea) setSelectedTea({ countryId: pendingRoute.countryId, teaId: tea.id })
      }
    } else if (selectedTea) {
      setSelectedTea(null)
    }

    setPendingRoute(null)
  }, [pendingRoute, countries, nav, selectedTea])

  // --- приложение → ссылка: отражаем текущую навигацию в URL, пока сами не
  // заняты «долётом» по входящей ссылке (иначе эффекты будут спорить друг с
  // другом за адресную строку) ---
  useEffect(() => {
    if (pendingRoute) return
    const newUrl = routeToUrl(nav, selectedTea)
    const current = window.location.pathname + window.location.search
    if (newUrl !== current) {
      window.history.pushState(null, '', newUrl)
    }
  }, [nav.country, nav.region, nav.regionId, selectedTea, pendingRoute]) // eslint-disable-line react-hooks/exhaustive-deps

  const favoriteTeas = useMemo(
    () => allTeas.filter((tea) => favorites.has(`${tea.countryId}:${tea.id}`)),
    [allTeas, favorites]
  )

  return (
    <div className="relative w-full h-svh overflow-hidden bg-ink">
      <Suspense fallback={<MapLoading />}>
        <MapView
          ref={mapRef}
          countries={countries}
          hiddenCategories={hiddenCategories}
          onSelectTea={handleSelectTea}
          onNav={setNav}
          onToast={setToast}
        />
      </Suspense>

      <Sidebar
        nav={nav}
        onHome={() => mapRef.current?.flyHome()}
        countries={countries}
        categories={categories}
        allTeas={allTeas}
        favoriteTeas={favoriteTeas}
        hiddenCategories={hiddenCategories}
        onToggleCategory={toggleCategory}
        onPickCountry={(id) => mapRef.current?.flyToCountryId(id)}
        onPickRegion={(region) => mapRef.current?.flyToRegion(region)}
        onBackToRegions={() => mapRef.current?.clearRegionFocus()}
        onSelectTea={(countryId, tea) => handleSelectTeaAndFly(countryId, tea)}
        onPickGlobalTea={handlePickGlobalTea}
      />
      <Toast message={toast} />

      {selectedTea && (
        <TeaPanel
          countryId={selectedTea.countryId}
          teaId={selectedTea.teaId}
          isFavorite={isFavorite(selectedTea.countryId, selectedTea.teaId)}
          onToggleFavorite={() => toggleFavorite(selectedTea.countryId, selectedTea.teaId)}
          onClose={() => setSelectedTea(null)}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <I18nProvider>
      <AppInner />
    </I18nProvider>
  )
}
