// The categorical palette is not arbitrary — each color approximates the
// actual color of the brewed liquor for that tea category. This is the
// signature visual idea of the atlas: color-code by what's in the cup.
export const CATEGORY_COLORS = {
  white: '#EFDFA0',
  green: '#7FA579',
  yellow: '#E0BB5C',
  oolong_light: '#D3AA51',
  oolong_dark: '#A9682E',
  red: '#B0492A',
  dark_sheng: '#8C6A3F',
  dark_shu: '#452B1C',
  dark_other: '#6B4A30',
}

export function categoryColor(id) {
  return CATEGORY_COLORS[id] || '#8A8372'
}
