import { useCallback, useEffect, useRef, useState } from 'react'
import MapView from './components/MapView'
import Sidebar from './components/Sidebar'
import Toast from './components/Toast'
import TeaPanel from './components/TeaPanel'
import { getCountries, getCategories, getTeaIndex } from './lib/api'

export default function App() {
  const mapRef = useRef(null)
  const [countries, setCountries] = useState([])
  const [categories, setCategories] = useState([])
  const [allTeas, setAllTeas] = useState([]) // every tea across every active country, for global search
  const [nav, setNav] = useState({ stage: 'world', country: null, region: null, regions: [], teas: [] })
  const [selectedTea, setSelectedTea] = useState(null) // { countryId, teaId }
  const [toast, setToast] = useState(null)

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

  const handlePickGlobalTea = useCallback((tea) => {
    mapRef.current?.flyToCountryId(tea.countryId)
    setSelectedTea({ countryId: tea.countryId, teaId: tea.id })
  }, [])

  return (
    <div className="relative w-full h-svh overflow-hidden bg-ink">
      <MapView
        ref={mapRef}
        countries={countries}
        onSelectTea={handleSelectTea}
        onNav={setNav}
        onToast={setToast}
      />

      <Sidebar
        nav={nav}
        onHome={() => mapRef.current?.flyHome()}
        countries={countries}
        categories={categories}
        allTeas={allTeas}
        onPickCountry={(id) => mapRef.current?.flyToCountryId(id)}
        onPickRegion={(region) => mapRef.current?.flyToRegion(region)}
        onBackToRegions={() => mapRef.current?.clearRegionFocus()}
        onSelectTea={handleSelectTea}
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
