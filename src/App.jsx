import { useCallback, useEffect, useRef, useState, Suspense, lazy } from 'react'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import TeaPanel from './components/TeaPanel'
import { getCountries, getCategories, getTeaIndex } from './lib/api'
import { I18nProvider, useI18n } from './lib/i18n'

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

function AppInner() {
  const mapRef = useRef(null)
  const [countries, setCountries] = useState([])
  const [categories, setCategories] = useState([])
  const [allTeas, setAllTeas] = useState([]) // every tea across every active country, for global search
  const [nav, setNav] = useState({ stage: 'world', country: null, region: null, regions: [], teas: [] })
  const [selectedTea, setSelectedTea] = useState(null) // { countryId, teaId }
  const [toast, setToast] = useState(null)
  const [hiddenCategories, setHiddenCategories] = useState(() => new Set())

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
