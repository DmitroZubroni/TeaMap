import { useCallback, useEffect, useRef, useState } from 'react'
import MapView from './components/MapView'
import Breadcrumb from './components/Breadcrumb'
import Legend from './components/Legend'
import Toast from './components/Toast'
import TeaPanel from './components/TeaPanel'
import { getCountries, getCategories } from './lib/api'

export default function App() {
  const mapRef = useRef(null)
  const [countries, setCountries] = useState([])
  const [categories, setCategories] = useState([])
  const [nav, setNav] = useState({ stage: 'world', country: null, region: null })
  const [selectedTea, setSelectedTea] = useState(null) // { countryId, teaId }
  const [toast, setToast] = useState(null)

  useEffect(() => {
    getCountries().then(setCountries)
    getCategories().then(setCategories)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const handleSelectTea = useCallback((countryId, teaId) => {
    setSelectedTea({ countryId, teaId })
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

      <Breadcrumb nav={nav} onHome={() => mapRef.current?.flyHome()} />
      <Legend categories={categories} />
      <Toast message={toast} />

      {selectedTea && (
        <TeaPanel
          countryId={selectedTea.countryId}
          teaId={selectedTea.teaId}
          onClose={() => setSelectedTea(null)}
          onSelectTea={handleSelectTea}
        />
      )}
    </div>
  )
}
