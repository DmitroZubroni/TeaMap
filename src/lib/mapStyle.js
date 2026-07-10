// We start from CARTO's free, no-API-key "Positron" vector style (OpenMapTiles
// schema, © OpenStreetMap contributors / © CARTO — attribution is preserved
// automatically by MapLibre's AttributionControl) and recolor it in place to
// match the tea-atlas palette: warm porcelain land, deep indigo water, and
// quiet ink linework, so the "real" map reads as part of the product rather
// than a generic basemap.
const STYLE_URL = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

const PALETTE = {
  background: '#EEE6D3',
  land: '#EEE6D3',
  landcover: '#E4DCC5',
  park: '#DCE0C9',
  water: '#26445A',
  waterLine: '#1D3546',
  boundary: '#B98A46',
  boundaryDisputed: '#C79A5E',
  road: '#DCD2B4',
  roadMinor: '#E4DBC2',
  building: '#E2D8BC',
  text: '#1C2A22',
  textHalo: '#F3EEE0',
  textMuted: '#5A6B5C',
}

function includesAny(str, needles) {
  if (!str) return false
  const s = str.toLowerCase()
  return needles.some((n) => s.includes(n))
}

export async function buildTeaMapStyle() {
  const res = await fetch(STYLE_URL)
  const style = await res.json()

  style.layers = style.layers.map((layer) => {
    const id = layer.id || ''
    const sourceLayer = layer['source-layer'] || ''
    const key = `${id} ${sourceLayer}`
    const paint = { ...(layer.paint || {}) }

    if (layer.type === 'background') {
      paint['background-color'] = PALETTE.background
    } else if (layer.type === 'fill') {
      if (includesAny(key, ['water'])) {
        paint['fill-color'] = PALETTE.water
      } else if (includesAny(key, ['park', 'wood', 'forest', 'landcover', 'vegetation'])) {
        paint['fill-color'] = PALETTE.park
      } else if (includesAny(key, ['building'])) {
        paint['fill-color'] = PALETTE.building
        paint['fill-opacity'] = 0.6
      } else if (includesAny(key, ['landuse', 'land'])) {
        paint['fill-color'] = PALETTE.landcover
      } else {
        paint['fill-color'] = PALETTE.landcover
      }
    } else if (layer.type === 'line') {
      if (includesAny(key, ['water', 'river', 'stream', 'waterway'])) {
        paint['line-color'] = PALETTE.waterLine
      } else if (includesAny(key, ['boundary', 'admin'])) {
        paint['line-color'] = includesAny(key, ['disputed']) ? PALETTE.boundaryDisputed : PALETTE.boundary
        if (!includesAny(key, ['disputed'])) paint['line-dasharray'] = [2, 1.5]
      } else if (includesAny(key, ['building'])) {
        paint['line-color'] = PALETTE.building
      } else if (includesAny(key, ['highway', 'road', 'street', 'motorway', 'trunk', 'primary'])) {
        paint['line-color'] = PALETTE.road
      } else {
        paint['line-color'] = PALETTE.roadMinor
      }
    } else if (layer.type === 'symbol') {
      if (paint['text-color'] !== undefined || (layer.layout && layer.layout['text-field'])) {
        paint['text-color'] = includesAny(key, ['country']) ? PALETTE.text : PALETTE.textMuted
        paint['text-halo-color'] = PALETTE.textHalo
        paint['text-halo-width'] = 1.2
      }
    }

    return { ...layer, paint }
  })

  return style
}
