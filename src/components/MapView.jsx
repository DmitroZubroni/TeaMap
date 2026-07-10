import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { buildTeaMapStyle } from '../lib/mapStyle'
import { getRegions, getTeaIndex } from '../lib/api'
import { COUNTRY_CENTROIDS } from '../lib/countryMeta'
import { createCountryPin, createRegionPin, createTeaPin } from '../lib/markers'

const WORLD_MAX = 3.2
const COUNTRY_MAX = 6.4

const MapView = forwardRef(function MapView({ countries, onSelectTea, onNav, onToast }, ref) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const worldMarkersRef = useRef([])
  const regionMarkersRef = useRef([])
  const teaMarkersRef = useRef([])

  const [ready, setReady] = useState(false)
  const [zoom, setZoom] = useState(1.8)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedRegionName, setSelectedRegionName] = useState(null)
  const [regionsData, setRegionsData] = useState([])
  const [teasData, setTeasData] = useState([])

  const stage = zoom <= WORLD_MAX ? 'world' : zoom <= COUNTRY_MAX ? 'region' : 'tea'

  // --- init map once ---
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const style = await buildTeaMapStyle()
      if (cancelled) return
      const map = new maplibregl.Map({
        container: containerRef.current,
        style,
        center: [45, 25],
        zoom: 1.8,
        minZoom: 1.4,
        maxZoom: 13,
        attributionControl: { compact: true },
      })
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
      map.on('zoom', () => setZoom(map.getZoom()))
      map.on('zoomend', () => {
        if (map.getZoom() <= WORLD_MAX) {
          setSelectedCountry(null)
          setSelectedRegionName(null)
        }
      })
      map.on('load', () => setReady(true))
      mapRef.current = map
    })()
    return () => {
      cancelled = true
      mapRef.current?.remove()
    }
  }, [])

  // --- notify parent of breadcrumb state ---
  useEffect(() => {
    onNav?.({ stage, country: selectedCountry, region: selectedRegionName })
  }, [stage, selectedCountry, selectedRegionName]) // eslint-disable-line react-hooks/exhaustive-deps

  const flyToCountry = useCallback(async (country) => {
    const map = mapRef.current
    if (!country || country.teaCount === 0) {
      onToast?.(`${country?.name ?? 'Эта страна'} — данные скоро появятся`)
      return
    }
    const regions = await getRegions(country.id)
    setRegionsData(regions)
    const teas = await getTeaIndex(country.id)
    setTeasData(teas)
    setSelectedCountry(country)

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
  }, [onToast])

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

  // --- region-stage pins ---
  useEffect(() => {
    if (!ready || !mapRef.current) return
    regionMarkersRef.current.forEach((m) => m.remove())
    regionMarkersRef.current = []
    if (stage !== 'region' || !selectedCountry) return

    regionsData.forEach((region) => {
      const el = createRegionPin({ name: region.name })
      el.addEventListener('click', () => {
        setSelectedRegionName(region.name)
        mapRef.current.flyTo({ center: [region.lng, region.lat], zoom: Math.max(region.zoom, COUNTRY_MAX + 0.6), duration: 900 })
      })
      const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
        .setLngLat([region.lng, region.lat])
        .addTo(mapRef.current)
      regionMarkersRef.current.push(marker)
    })
  }, [ready, stage, selectedCountry, regionsData])

  // --- tea-stage pins ---
  useEffect(() => {
    if (!ready || !mapRef.current) return
    teaMarkersRef.current.forEach((m) => m.remove())
    teaMarkersRef.current = []
    if (stage !== 'tea' || !selectedCountry) return

    teasData.forEach((tea) => {
      const el = createTeaPin({ name: tea.name, category: tea.category })
      el.addEventListener('click', () => onSelectTea(selectedCountry.id, tea.id))
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([tea.lng, tea.lat])
        .addTo(mapRef.current)
      teaMarkersRef.current.push(marker)
    })
  }, [ready, stage, selectedCountry, teasData, onSelectTea])

  useImperativeHandle(ref, () => ({
    flyHome() {
      mapRef.current?.flyTo({ center: [45, 25], zoom: 1.8, duration: 1000 })
    },
  }))

  return <div ref={containerRef} className="absolute inset-0" />
})

export default MapView
