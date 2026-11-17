// Authored tea-field instruments: no platform-dependent emoji glyphs.
export const teaPaths = {
  light: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l2 2m10 10 2 2M5 19l2-2M17 7l2-2',
  dark: 'M18 16A8 8 0 0 1 8 5a8 8 0 1 0 10 11ZM17 3v4m-2-2h4',
  system: 'M3 4h18v13H3zM8 21h8m-4-4v4M7 8h10',
  leaf: 'M5 20C5 10 11 4 21 3c-1 10-6 16-14 15M5 20 17 7M10 14l-1-5m4 2 5 1',
  location: 'M12 21s7-7 7-12A7 7 0 0 0 5 9c0 5 7 12 7 12ZM9 9a3 3 0 1 0 6 0 3 3 0 0 0-6 0',
  favorite: 'M6 3h12v19l-6-4-6 4ZM9 8c2-3 5-2 6-3-1 4-3 6-6 5m0 3 4-5',
  close: 'm6 6 12 12M18 6 6 18',
  china: 'm3 8 5-1 2-4 4 3 4-1 3 5-3 3-1 5-5 1-3-3-4-1z',
  india: 'm5 4 5 1 4-2 3 4 4 1-4 3-3 10-4-5-1-5-4-3z',
  sri_lanka: 'M12 3c1 5 6 9 6 14a6 6 0 0 1-12 0c0-4 4-9 6-14Z',
  taiwan: 'M16 3c2 4-1 12-6 18-4-5 1-15 6-18Z',
  japan: 'm17 3 3 2-2 4-3 1-1 4-4 2-2 4-4 1 2-4 4-3 2-5 4-2z',
  vietnam: 'm7 3 5 1 1 4-2 3 5 6-1 4-6-1 3-3-4-5 1-4z',
  russia: 'm2 7 5 1 2-3 6 2 3-2 4 4-2 4-5-1-2 4-5-2-4 1z',
  thailand: 'm7 3 7 1-1 5 3 3-3 3 1 5 4 1-6 1-3-6 1-5-4-3z',
}
export function teaIconMarkup(name) {
  const path = teaPaths[name] || teaPaths.leaf
  return `<svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`
}
