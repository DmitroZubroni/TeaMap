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

// Searching Wikimedia Commons for a SPECIFIC named tea ("Da Hong Pao") is
// unreliable — most single-origin teas have zero dedicated coverage, so the
// search falls back to unrelated/incorrect photos. Searching by category
// instead ("dry oolong tea leaves") is far more likely to return a genuine,
// representative photo of loose dry leaf for that style — it won't be the
// exact cultivar, but it's honestly representative rather than a wrong guess.
export const CATEGORY_IMAGE_QUERY = {
  white: 'white tea dry leaves loose',
  green: 'green tea dry leaves loose',
  yellow: 'yellow tea dry leaves China',
  oolong_light: 'oolong tea rolled dry leaves',
  oolong_dark: 'dark roasted oolong tea leaves',
  red: 'black tea dry leaves loose',
  dark_sheng: 'raw pu-erh tea cake sheng',
  dark_shu: 'ripe pu-erh tea shu cha',
  dark_other: 'liu bao dark tea China leaves',
}

export function categoryImageQuery(id) {
  return CATEGORY_IMAGE_QUERY[id] || 'loose leaf tea dry leaves'
}
