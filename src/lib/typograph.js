/**
 * typograph.js — Russian typographic rules according to studio methodology (Rule Т10)
 */
export function typograph(text) {
  if (!text || typeof text !== 'string') return text || ''

  return text
    // Non-breaking space after 1-2 letter prepositions/conjunctions
    .replace(/(^|[\s(«"„])([ввооиусккяпозаиздоотнапоподнадсооббезиз-под]+)\s+/gi, '$1$2\u00A0')
    // Em-dash replacement with non-breaking space before it
    .replace(/(\s+)([-—–])(\s+)/g, '\u00A0— ')
    // Non-breaking space between number and unit/word
    .replace(/(\d+)\s+([а-яa-z%]+)/gi, '$1\u00A0$2')
    .trim()
}
