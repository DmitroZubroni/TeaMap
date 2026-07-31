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

  // --- defensively re-measure the container; guards against any stale
  // size MapLibre may have captured before layout fully settled ---
  useEffect(() => {
    if (!ready || !mapRef.current) return
    const map = mapRef.current
    map.resize()
    const onResize = () => map.resize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [ready])
  useEffect(() => {
    onNav?.({
      stage,
      country: selectedCountry,
      region: selectedRegionName,
      regions: regionsData,
      teas: teasData,
    })
  }, [stage, selectedCountry, selectedRegionName, teasData, regionsData]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Country selection now only ever happens via an explicit click (a world
  // pin, or the sidebar's country list) — see flyToCountry / flyToCountryId.
  // We used to also guess the "current" country from the map center on
  // every pan/zoom, but that heuristic (nearest active-country centroid)
  // breaks down badly once multiple countries are active: a small country's
  // centroid can be geographically closer to a neighboring big country's
  // region than that region is to its own country's centroid (e.g. Taiwan's
  // centroid is closer to Wuyishan than mainland China's own centroid is),
  // silently swapping the selected country to the wrong one mid-navigation.
  // Explicit selection has no such ambiguity.

  // --- world-stage country pins ---
  useEffect(() => {
    if (!ready || !mapRef.current) return
    worldMarkersRef.current.forEach((m) => m.remove())
    worldMarkersRef.current = []
    if (stage !== 'world') return

    countries.forEach((country) => {
      const centroid = COUNTRY_CENTROIDS[country.id]
      if (!centroid) return
      const el = createCountryPin({
        name: country.name,
        icon: country.icon,
        active: country.teaCount > 0,
        onClick: () => flyToCountry(country),
      })
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
      try {
        const el = createRegionPin({
          name: region.name,
          onClick: () => {
            setSelectedRegionName(region.name)
            mapRef.current.flyTo({ center: [region.lng, region.lat], zoom: Math.max(region.zoom, 8), duration: 900 })
          },
        })
        const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' })
          .setLngLat([region.lng, region.lat])
          .addTo(mapRef.current)
        regionMarkersRef.current.push(marker)
      } catch (err) {
        console.error('Не удалось отрисовать метку региона', region, err)
      }
    })
  }, [ready, stage, selectedCountry, regionsData])

  // --- tea pins: shown together with region pins as soon as a country is loaded ---
  useEffect(() => {
    if (!ready || !mapRef.current) return
    teaMarkersRef.current.forEach((m) => m.remove())
    teaMarkersRef.current = []
    if (stage === 'world' || !selectedCountry) return

    // Several teas often share the exact same coordinate (same mountain/
    // garden). Left as-is they'd render as a single stacked, unclickable
    // dot, so duplicates are fanned out in a small circle around the
    // shared point — small enough to still read as "one place" when
    // zoomed out, wide enough to be individually clickable up close.
    const groups = new Map()
    teasData.forEach((tea) => {
      const key = `${tea.lat.toFixed(4)},${tea.lng.toFixed(4)}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(tea)
    })
    const OFFSET_DEG = 0.006
    const positioned = []
    groups.forEach((group) => {
      if (group.length === 1) {
        positioned.push({ tea: group[0], lat: group[0].lat, lng: group[0].lng })
        return
      }
      group.forEach((tea, i) => {
        const angle = (i / group.length) * 2 * Math.PI
        positioned.push({
          tea,
          lat: tea.lat + OFFSET_DEG * Math.sin(angle),
          lng: tea.lng + OFFSET_DEG * Math.cos(angle),
        })
      })
    })

    positioned.forEach(({ tea, lat, lng }) => {
      try {
        const el = createTeaPin({
          name: tea.name,
          category: tea.category,
          labeled: labelsOn,
          onClick: () => {
            console.info('[tea-atlas] клик по точке чая:', tea.id, 'страна:', selectedCountry.id)
            onSelectTea(selectedCountry.id, tea.id)
          },
        })
        const marker = new maplibregl.Marker({ element: el, anchor: labelsOn ? 'left' : 'center' })
          .setLngLat([lng, lat])
          .addTo(mapRef.current)
        teaMarkersRef.current.push(marker)
      } catch (err) {
        console.error('Не удалось отрисовать точку чая', tea, err)
      }
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
    flyToRegion(region) {
      if (!region || !mapRef.current) return
      setSelectedRegionName(region.name)
      mapRef.current.flyTo({ center: [region.lng, region.lat], zoom: Math.max(region.zoom, 8), duration: 900 })
    },
    clearRegionFocus() {
      setSelectedRegionName(null)
    },
  }))

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="w-full h-full" />
      {!ready && !loadError && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-ink pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-porcelain/20 border-t-gold animate-spin" />
            <p className="font-mono text-[11px] uppercase tracking-widest text-porcelain/50">Загружаю карту…</p>
          </div>
        </div>
      )}
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
