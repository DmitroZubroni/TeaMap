// We use CARTO's free, no-API-key "Positron" vector style (OpenMapTiles
// schema, © OpenStreetMap contributors / © CARTO — attribution is preserved
// automatically by MapLibre's AttributionControl) as the style URL passed
// straight to MapLibre, and recolor its layers in place once MapLibre has
// successfully loaded it. We deliberately do NOT fetch/parse the style JSON
// ourselves before handing it to the map: letting MapLibre own that request
// means we don't duplicate its request/retry/CORS handling, and a fetch
// failure on our side can never leave the map stuck with nothing rendered.
export const STYLE_URL = 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'

const PALETTE = {
  background: '#EEE6D3',
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

// Recolors an already-loaded style's layers via setPaintProperty. Safe to
// call multiple times (e.g. again after setStyle). Any single layer failing
// to update is caught and skipped so one unexpected layer shape can't stop
// the rest of the palette from applying.
export function applyTeaPalette(map) {
  const layers = map.getStyle()?.layers || []

  for (const layer of layers) {
    try {
      const id = layer.id || ''
      const sourceLayer = layer['source-layer'] || ''
      const key = `${id} ${sourceLayer}`

      if (layer.type === 'background') {
        map.setPaintProperty(layer.id, 'background-color', PALETTE.background)
      } else if (layer.type === 'fill') {
        if (includesAny(key, ['water'])) {
          map.setPaintProperty(layer.id, 'fill-color', PALETTE.water)
        } else if (includesAny(key, ['park', 'wood', 'forest', 'landcover', 'vegetation'])) {
          map.setPaintProperty(layer.id, 'fill-color', PALETTE.park)
        } else if (includesAny(key, ['building'])) {
          map.setPaintProperty(layer.id, 'fill-color', PALETTE.building)
          map.setPaintProperty(layer.id, 'fill-opacity', 0.6)
        } else {
          map.setPaintProperty(layer.id, 'fill-color', PALETTE.landcover)
        }
      } else if (layer.type === 'line') {
        if (includesAny(key, ['water', 'river', 'stream', 'waterway'])) {
          map.setPaintProperty(layer.id, 'line-color', PALETTE.waterLine)
        } else if (includesAny(key, ['boundary', 'admin'])) {
          const disputed = includesAny(key, ['disputed'])
          map.setPaintProperty(layer.id, 'line-color', disputed ? PALETTE.boundaryDisputed : PALETTE.boundary)
          if (!disputed) map.setPaintProperty(layer.id, 'line-dasharray', [2, 1.5])
        } else if (includesAny(key, ['building'])) {
          map.setPaintProperty(layer.id, 'line-color', PALETTE.building)
        } else if (includesAny(key, ['highway', 'road', 'street', 'motorway', 'trunk', 'primary'])) {
          map.setPaintProperty(layer.id, 'line-color', PALETTE.road)
        } else {
          map.setPaintProperty(layer.id, 'line-color', PALETTE.roadMinor)
        }
      } else if (layer.type === 'symbol') {
        const hasText = layer.layout && layer.layout['text-field']
        if (hasText) {
          map.setPaintProperty(layer.id, 'text-color', includesAny(key, ['country']) ? PALETTE.text : PALETTE.textMuted)
          map.setPaintProperty(layer.id, 'text-halo-color', PALETTE.textHalo)
          map.setPaintProperty(layer.id, 'text-halo-width', 1.2)
        }
      }
    } catch {
      // Skip layers whose paint properties don't match what we expect —
      // never let one odd layer break the whole recolor pass.
    }
  }
}
