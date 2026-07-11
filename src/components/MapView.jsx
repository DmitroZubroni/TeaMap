import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { STYLE_URL, applyTeaPalette } from '../lib/mapStyle'
import { getRegions, getTeaIndex } from '../lib/api'
import { COUNTRY_CENTROIDS } from '../lib/countryMeta'
import { createCountryPin, createRegionPin, createTeaPin } from '../lib/markers'

const WORLD_MAX = 3.2
const LABEL_ZOOM = 8
const LOAD_TIMEOUT_MS = 12000

const MapView = forwardRef(function MapView({ countries, onSelectTea, onNav, onToast }, ref) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const worldMarkersRef = useRef([])
  const regionMarkersRef = useRef([])
  const teaMarkersRef = useRef([])

  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [zoom, setZoom] = useState(1.8)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedRegionName, setSelectedRegionName] = useState(null)
  const [regionsData, setRegionsData] = useState([])
  const [teasData, setTeasData] = useState([])

  const stage = zoom <= WORLD_MAX ? 'world' : selectedRegionName ? 'region-focus' : 'country'
  const labelsOn = zoom >= LABEL_ZOOM

  // --- init map once ---
  useEffect(() => {
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center: [45, 25],
      zoom: 1.8,
      minZoom: 1.4,
      maxZoom: 13,
      attributionControl: { compact: true },
    })
    mapRef.current = map

    const timeout = setTimeout(() => {
      setLoadError((prev) => prev ?? 'Карта долго не отвечает. Проверьте соединение и обновите страницу.')
    }, LOAD_TIMEOUT_MS)

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.on('zoom', () => setZoom(map.getZoom()))
    map.on('zoomend', () => {
      if (map.getZoom() <= WORLD_MAX) {
        setSelectedCountry(null)
        setSelectedRegionName(null)
      }
    })
    map.on('load', () => {
      clearTimeout(timeout)
      try {
        applyTeaPalette(map)
      } catch {
        // If recoloring fails for any reason, fall back to the stock
        // CARTO look rather than blocking the map from showing at all.
      }
      setReady(true)
    })
    map.on('error', (e) => {
      console.error('Map error:', e?.error || e)
      // Only block the UI for a failure before the map has ever finished
      // loading — once it's up, isolated tile/glyph errors shouldn't nuke
      // an otherwise-working map.
      if (!map.loaded()) {
        setLoadError((prev) => prev ?? 'Не удалось загрузить карту. Проверьте соединение и обновите страницу.')
      }
    })

    return () => {
      clearTimeout(timeout)
      map.remove()
    }
  }, [])

  // --- notify parent of breadcrumb state ---
  useEffect(() => {
    onNav?.({ stage, country: selectedCountry, region: selectedRegionName })
  }, [stage, selectedCountry, selectedRegionName]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCountryData = useCallback(async (country) => {
    const [regions, teas] = await Promise.all([getRegions(country.id), getTeaIndex(country.id)])
    setRegionsData(regions)
    setTeasData(teas)
    setSelectedCountry(country)
    return regions
  }, [])

  const flyToCountry = useCallback(async (country) => {
    if (!country || country.teaCount === 0) {
      onToast?.(`${country?.name ?? 'Эта страна'} — данные скоро появятся`)
      return
    }
    const regions = await loadCountryData(country)
    const map = mapRef.current
    if (regions.length) {
      const bounds = regions.reduce(
        (b, r) => b.extend([r.lng, r.lat]),
        new maplibregl.LngLatBounds([regions[0].lng, regions[0].lat], [regions[0].lng, regions[0].lat])
      )
      map.fitBounds(bounds, { padding: 90, duration: 1100, maxZoom: 5.5 })
    } else {
      const c = COUNTRY_CENTROIDS[country.id]
      map.flyTo({ center: [c.lng, c.lat], zoom: 4.5, duration: 1100 })
    }
  }, [onToast, loadCountryData])

  // --- detect which country we're looking at when the person pans/zooms
  // the map by hand, rather than only when they click a world pin ---
  useEffect(() => {
    if (!ready || !mapRef.current) return
    const map = mapRef.current

    const detect = () => {
      if (map.getZoom() <= WORLD_MAX) return
      const center = map.getCenter()
      const active = countries.filter((c) => c.teaCount > 0 && COUNTRY_CENTROIDS[c.id])
      let nearest = null
      let nearestDist = Infinity
      for (const c of active) {
        const p = COUNTRY_CENTROIDS[c.id]
        const d = Math.hypot(p.lat - center.lat, p.lng - center.lng)
        if (d < nearestDist) {
          nearestDist = d
          nearest = c
        }
      }
      const DETECT_RADIUS_DEG = 22
      const match = nearest && nearestDist <= DETECT_RADIUS_DEG ? nearest : null

      setSelectedCountry((prev) => {
        if (match?.id === prev?.id) return prev
        if (match) loadCountryData(match)
        else {
          setRegionsData([])
          setTeasData([])
        }
        return match
      })
    }

    map.on('moveend', detect)
    return () => map.off('moveend', detect)
  }, [ready, countries, loadCountryData])

  // --- world-stage country pins ---
  useEffect(() => {
    if (!ready || !mapRef.current) return
    worldMarkersRef.current.forEach((m) => m.remove())
    worldMarkersRef.current = []
    if (stage !== 'world') return

    countries.forEach((country) => {
      const centroid = COUNTRY_CENTROIDS[country.id]
      if (!centroid) return
      const el = createCountryPin({ name: country.name, icon: country.icon, active: country.teaCount > 0 })
      el.addEventListener('click', () => flyToCountry(country))
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([centroid.lng, centroid.lat])
        .addTo(mapRef.current)
      worldMarkersRef.current.push(marker)
    })
  }, [ready, stage, countries, flyToCountry])

  // --- region pins: shown together with tea pins once a country is loaded ---
  useEffect(() => {
    if (!ready || !mapRef.current) return
    regionMarkersRef.current.forEach((m) => m.remove())
    regionMarkersRef.current = []
    if (stage === 'world' || !selectedCountry) return

    regionsData.forEach((region) => {
      const el = createRegionPin({ name: region.name })
      el.addEventListener('click', () => {
        setSelectedRegionName(region.name)
        mapRef.current.flyTo({ center: [region.lng, region.lat], zoom: Math.max(region.zoom, 8), duration: 900 })
      })
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([region.lng, region.lat])
        .addTo(mapRef.current)
      regionMarkersRef.current.push(marker)
    })
  }, [ready, stage, selectedCountry, regionsData])

  // --- tea pins: shown together with region pins as soon as a country is loaded ---
  useEffect(() => {
    if (!ready || !mapRef.current) return
    teaMarkersRef.current.forEach((m) => m.remove())
    teaMarkersRef.current = []
    if (stage === 'world' || !selectedCountry) return

    teasData.forEach((tea) => {
      const el = createTeaPin({ name: tea.name, category: tea.category, labeled: labelsOn })
      el.addEventListener('click', () => onSelectTea(selectedCountry.id, tea.id))
      const marker = new maplibregl.Marker({ element: el, anchor: labelsOn ? 'left' : 'center' })
        .setLngLat([tea.lng, tea.lat])
        .addTo(mapRef.current)
      teaMarkersRef.current.push(marker)
    })
  }, [ready, stage, selectedCountry, teasData, labelsOn, onSelectTea])

  useImperativeHandle(ref, () => ({
    flyHome() {
      mapRef.current?.flyTo({ center: [45, 25], zoom: 1.8, duration: 1000 })
    },
    flyToCountryId(id) {
      const country = countries.find((c) => c.id === id)
      if (country) flyToCountry(country)
    },
  }))

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="w-full h-full" />
      {loadError && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-ink/90 px-6 text-center">
          <div className="max-w-sm">
            <p className="font-display text-xl text-porcelain mb-2">Карта не загрузилась</p>
            <p className="text-porcelain/70 text-sm">{loadError}</p>
          </div>
        </div>
      )}
    </div>
  )
})

export default MapView
