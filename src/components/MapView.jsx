import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { STYLE_URL, applyTeaPalette } from '../lib/mapStyle'
import { getRegions, getTeaIndex } from '../lib/api'
import { COUNTRY_CENTROIDS } from '../lib/countryMeta'
import { createCountryPin, createRegionPin, createTeaPin } from '../lib/markers'
import { useI18n } from '../lib/i18n'

const WORLD_MAX = 3.2
const LABEL_ZOOM = 8
const LOAD_TIMEOUT_MS = 12000

const MapView = forwardRef(function MapView({ countries, hiddenCategories, onSelectTea, onNav, onToast }, ref) {
  const { t } = useI18n()
  const tRef = useRef(t)
  useEffect(() => {
    tRef.current = t
  }, [t])
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const worldMarkersRef = useRef([])
  const regionMarkersRef = useRef([])
  const teaMarkersRef = useRef([])

  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [zoom, setZoom] = useState(1.8)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [regionsData, setRegionsData] = useState([])
  const [teasData, setTeasData] = useState([])
  const [loadingCountry, setLoadingCountry] = useState(false)

  const stage = zoom <= WORLD_MAX ? 'world' : selectedRegion ? 'region-focus' : 'country'
  const labelsOn = zoom >= LABEL_ZOOM

  // --- инициализация карты (один раз) ---
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
      setLoadError((prev) => prev ?? tRef.current('mapLoadErrorSlow'))
    }, LOAD_TIMEOUT_MS)

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')
    map.on('zoom', () => setZoom(map.getZoom()))
    map.on('zoomend', () => {
      if (map.getZoom() <= WORLD_MAX) {
        setSelectedCountry(null)
        setSelectedRegion(null)
      }
    })
    map.on('load', () => {
      clearTimeout(timeout)
      try {
        applyTeaPalette(map)
      } catch {
        // Если перекраска почему-то не удалась — используем стандартный вид
        // CARTO, лишь бы карта не блокировалась вовсе.
      }
      setReady(true)
    })
    map.on('error', (e) => {
      console.error('Map error:', e?.error || e)
      // Блокируем интерфейс только если сбой произошёл ДО первой успешной
      // загрузки — если карта уже работает, отдельные ошибки тайлов/шрифтов
      // не должны ломать уже рабочую карту.
      if (!map.loaded()) {
        setLoadError((prev) => prev ?? tRef.current('mapLoadErrorGeneric'))
      }
    })

    return () => {
      clearTimeout(timeout)
      map.remove()
    }
  }, [])

  // --- подстраховка: заново измеряем контейнер на случай, если MapLibre
  // захватил устаревший размер до того, как вёрстка полностью устаканилась ---
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
      region: selectedRegion?.name ?? null,
      regionId: selectedRegion?.id ?? null,
      regions: regionsData,
      teas: teasData,
      loading: loadingCountry,
    })
  }, [stage, selectedCountry, selectedRegion, teasData, regionsData, loadingCountry]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadCountryData = useCallback(async (country) => {
    setLoadingCountry(true)
    try {
      const [regions, teas] = await Promise.all([getRegions(country.id), getTeaIndex(country.id)])
      setRegionsData(regions)
      setTeasData(teas)
      setSelectedCountry(country)
      return regions
    } finally {
      setLoadingCountry(false)
    }
  }, [])

  const flyToCountry = useCallback(async (country) => {
    if (!country || country.teaCount === 0) {
      onToast?.(t('countrySoonToast', country?.name ?? t('thisCountry')))
      return
    }
    setSelectedRegion(null)
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
  }, [onToast, loadCountryData, t])

  // Выбор страны теперь происходит только по явному клику (пин на карте или
  // список в сайдбаре) — см. flyToCountry / flyToCountryId. Раньше мы ещё
  // пытались угадывать «текущую» страну по центру карты при любом
  // перемещении, но эта эвристика (ближайший центр активной страны) сильно
  // ломалась, как только активных стран стало несколько: центр маленькой
  // страны может оказаться географически ближе к региону соседней большой
  // страны, чем центр самой этой большой страны (например, центр Тайваня
  // ближе к Уишаню, чем центр материкового Китая) — и страна тихо
  // подменялась не той прямо посреди навигации. Явный выбор такой
  // неоднозначности не имеет.

  // --- пины стран на мировом виде ---
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

  // --- пины регионов: показываются вместе с точками чая, как только страна загружена ---
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
            setSelectedRegion(region)
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

  // --- точки чая: показываются вместе с пинами регионов, как только страна загружена ---
  useEffect(() => {
    if (!ready || !mapRef.current) return
    teaMarkersRef.current.forEach((m) => m.remove())
    teaMarkersRef.current = []
    if (stage === 'world' || !selectedCountry) return

    // У многих чаёв совпадают координаты (одна и та же гора/сад). Если
    // оставить как есть, они бы рисовались одной точкой друг на друге, по
    // которой невозможно кликнуть отдельно — поэтому дубликаты веером
    // разводятся по маленькому кругу вокруг общей точки: на общем виде это
    // незаметно (всё ещё читается как «одно место»), а при приближении
    // каждую точку уже можно кликнуть отдельно.
    const visibleTeas = teasData.filter((tea) => !hiddenCategories?.has(tea.category))
    const groups = new Map()
    visibleTeas.forEach((tea) => {
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
          onClick: () => onSelectTea(selectedCountry.id, tea.id),
        })
        const marker = new maplibregl.Marker({ element: el, anchor: labelsOn ? 'left' : 'center' })
          .setLngLat([lng, lat])
          .addTo(mapRef.current)
        teaMarkersRef.current.push(marker)
      } catch (err) {
        console.error('Не удалось отрисовать точку чая', tea, err)
      }
    })
  }, [ready, stage, selectedCountry, teasData, labelsOn, onSelectTea, hiddenCategories])

  useImperativeHandle(ref, () => ({
    flyHome() {
      setSelectedCountry(null)
      setSelectedRegion(null)
      mapRef.current?.flyTo({ center: [45, 25], zoom: 1.8, duration: 1000 })
    },
    flyToCountryId(id) {
      const country = countries.find((c) => c.id === id)
      if (country) flyToCountry(country)
    },
    flyToRegion(region) {
      if (!region || !mapRef.current) return
      setSelectedRegion(region)
      mapRef.current.flyTo({ center: [region.lng, region.lat], zoom: Math.max(region.zoom, 8), duration: 900 })
    },
    clearRegionFocus() {
      setSelectedRegion(null)
    },
    async flyToTeaInCountry(countryId, tea) {
      if (!tea || !mapRef.current) return
      const country = countries.find((c) => c.id === countryId)
      if (country && country.id !== selectedCountry?.id) {
        setSelectedRegion(null)
        await loadCountryData(country)
      }
      mapRef.current.flyTo({ center: [tea.lng, tea.lat], zoom: Math.max(LABEL_ZOOM + 1, 9), duration: 1000 })
    },
  }))

  return (
    <div className="absolute inset-0">
      <div ref={containerRef} className="w-full h-full" />
      {!ready && !loadError && (
        <div className="absolute inset-0 z-10 grid place-items-center bg-ink pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-porcelain/20 border-t-gold animate-spin" />
            <p className="font-mono text-[11px] uppercase tracking-widest text-porcelain/50">{t('mapLoading')}</p>
          </div>
        </div>
      )}
      {loadError && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-ink/90 px-6 text-center">
          <div className="max-w-sm">
            <p className="font-display text-xl text-porcelain mb-2">{t('mapLoadError')}</p>
            <p className="text-porcelain/70 text-sm">{loadError}</p>
          </div>
        </div>
      )}
    </div>
  )
})

export default MapView
