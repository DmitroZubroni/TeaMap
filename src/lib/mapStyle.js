// Предварительно оптимизированный стиль с запечённой чайной палитрой и
// прямыми эндпоинтами тайлов (без лишних запросов к tiles.json).
export const STYLE_URL = '/map/style.json'
export const FALLBACK_STYLE_URL = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

export const LIGHT_TEA_PALETTE = {
  background: '#EFECE2',
  landcover: '#E5DFCE',
  park: '#D7DFCE',
  water: '#30546C',
  waterLine: '#224053',
  boundary: '#B45309',
  boundaryDisputed: '#C79A5E',
  road: '#DDD3BA',
  roadMinor: '#E6DEC9',
  building: '#E2D7BE',
  text: '#142018',
  textHalo: '#F6F4ED',
  textMuted: '#495B4F',
}

export const DARK_TEA_PALETTE = {
  background: '#0C1410',
  landcover: '#131D17',
  park: '#18271F',
  water: '#142733',
  waterLine: '#1C3647',
  boundary: '#8A6225',
  boundaryDisputed: '#B48439',
  road: '#1B2921',
  roadMinor: '#16221B',
  building: '#17241D',
  text: '#E2E8E4',
  textHalo: '#0C1410',
  textMuted: '#7E9585',
}

function includesAny(str, needles) {
  if (!str) return false
  const s = str.toLowerCase()
  return needles.some((n) => s.includes(n))
}

// Перекрашивает слои карты под текущую тему (светлая/тёмная чайная палитра).
export function applyTeaPalette(map, isDark = false) {
  if (!map || !map.getStyle) return
  const layers = map.getStyle()?.layers || []
  const palette = isDark ? DARK_TEA_PALETTE : LIGHT_TEA_PALETTE

  for (const layer of layers) {
    try {
      const id = layer.id || ''
      const sourceLayer = layer['source-layer'] || ''
      const key = `${id} ${sourceLayer}`

      if (layer.type === 'background') {
        map.setPaintProperty(layer.id, 'background-color', palette.background)
      } else if (layer.type === 'fill') {
        if (includesAny(key, ['water'])) {
          map.setPaintProperty(layer.id, 'fill-color', palette.water)
        } else if (includesAny(key, ['park', 'wood', 'forest', 'landcover', 'vegetation'])) {
          map.setPaintProperty(layer.id, 'fill-color', palette.park)
        } else if (includesAny(key, ['building'])) {
          map.setPaintProperty(layer.id, 'fill-color', palette.building)
          map.setPaintProperty(layer.id, 'fill-opacity', isDark ? 0.4 : 0.6)
        } else {
          map.setPaintProperty(layer.id, 'fill-color', palette.landcover)
        }
      } else if (layer.type === 'line') {
        if (includesAny(key, ['water', 'river', 'stream', 'waterway'])) {
          map.setPaintProperty(layer.id, 'line-color', palette.waterLine)
        } else if (includesAny(key, ['boundary', 'admin'])) {
          const disputed = includesAny(key, ['disputed'])
          map.setPaintProperty(layer.id, 'line-color', disputed ? palette.boundaryDisputed : palette.boundary)
          if (!disputed) map.setPaintProperty(layer.id, 'line-dasharray', [2, 1.5])
        } else if (includesAny(key, ['building'])) {
          map.setPaintProperty(layer.id, 'line-color', palette.building)
        } else if (includesAny(key, ['highway', 'road', 'street', 'motorway', 'trunk', 'primary'])) {
          map.setPaintProperty(layer.id, 'line-color', palette.road)
        } else {
          map.setPaintProperty(layer.id, 'line-color', palette.roadMinor)
        }
      } else if (layer.type === 'symbol') {
        const hasText = layer.layout && layer.layout['text-field']
        if (hasText) {
          map.setPaintProperty(layer.id, 'text-color', includesAny(key, ['country']) ? palette.text : palette.textMuted)
          map.setPaintProperty(layer.id, 'text-halo-color', palette.textHalo)
          map.setPaintProperty(layer.id, 'text-halo-width', 1.2)
        }
      }
    } catch {
      // Игнорируем несовместимые слои
    }
  }
}
