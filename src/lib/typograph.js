/**
 * typograph.js — Русская типографика студии «Калибр» (Правило Т10).
 * Неразрывные пробелы после предлогов и союзов, перед частицами и тире,
 * в разрядах чисел, с единицами измерения, в инициалах и телефонах.
 * Парные кавычки-«ёлочки» и „лапки“, длинное тире, многоточие.
 */

const NBSP = '\u00A0'

// Короткие служебные слова, которые не должны оставаться в конце строки
const SHORT = 'без|для|над|под|при|про|изо|обо|ото|что|как|или|чем|где|кто'
const AFTER_SHORT = new RegExp(`(?<=^|[\\s(«„"—])([А-ЯЁа-яёA-Za-z]{1,2}|${SHORT})\\s+(?=\\S)`, 'giu')
const PHONE = /(?:\+7|(?<!\d)8)[ \t\u00A0-]?\(?\d{3}\)?[ \t\u00A0-]?\d{3}[ \t\u00A0-]?\d{2}[ \t\u00A0-]?\d{2}(?!\d)/g
const PARTICLES = /\s+(ли|ль|же|ж|бы|б)(?=[\s.,!?;:…)»“]|$)/giu

function quotes(text) {
  let depth = 0
  let out = ''
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch !== '"') {
      out += ch
      continue
    }
    const prev = i === 0 ? ' ' : text[i - 1]
    const opening = /[\s([{«„—–-]/u.test(prev)
    if (!opening && depth === 0 && /\d/.test(prev)) {
      out += '″' // знак дюйма: 17" → 17″
      continue
    }
    if (opening) {
      out += depth === 0 ? '«' : '„'
      depth++
    } else {
      depth = Math.max(0, depth - 1)
      out += depth === 0 ? '»' : '“'
    }
  }
  return out
}

export function typograph(input) {
  if (!input || typeof input !== 'string') return input || ''
  let s = quotes(input)

  s = s.replace(/\.{3}/g, '…')

  // Телефон целиком: «+7 999 123 45 67», «8 800 555 35 35»
  s = s.replace(PHONE, (phone) => phone.replace(/[ \t]/g, NBSP))

  // Тире: «слово - слово», «слово -- слово» → неразрывный пробел + длинное тире
  s = s.replace(/[ \t ]+(?:-{1,2}|–|—)(?=\s)/g, `${NBSP}—`)

  // Разряды: «4 500 000»
  s = s.replace(/(?<=\d) (?=\d{3}(?!\d))/g, NBSP)

  // Число и единица или знак: «10 мин», «500 ₽», «5 кг», «№ 5»
  s = s.replace(/(\d)[ \t]+(?=[^\s\d][^\s]{0,4}(?=[\s.,!?;:…)»]|$))/gu, `$1${NBSP}`)
  s = s.replace(/([№§])[ \t]*(?=\d)/g, `$1${NBSP}`)

  // Инициалы: «А. С. Пушкин»
  s = s.replace(/(?<=(?:^|[\s(«])[А-ЯЁA-Z]\.)[ \t]+(?=[А-ЯЁA-Z])/gu, NBSP)
  s = s.replace(/(?<=[А-ЯЁа-яёA-Za-z])[ \t]+(?=[А-ЯЁA-Z]\.[ \t ]?[А-ЯЁA-Z]\.)/gu, NBSP)

  s = s.replace(AFTER_SHORT, `$1${NBSP}`)
  s = s.replace(PARTICLES, `${NBSP}$1`)
  return s
}
