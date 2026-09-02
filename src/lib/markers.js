import { categoryColor } from './categoryStyle'

// ВАЖНО: MapLibre позиционирует каждую метку, напрямую записывая
// `element.style.transform` в корневой элемент, переданный в `new
// maplibregl.Marker({ element })`. Наша собственная CSS-анимация появления
// (`animate-pin-in`) тоже анимирует свойство `transform` — а CSS-анимация,
// нацеленная на `transform`, побеждает этот инлайн-стиль, пока она «в силе»,
// а с `animation-fill-mode: both` она «в силе» навсегда после запуска. Эти
// два механизма боролись за одно и то же свойство, и позиционирующий
// transform от MapLibre никогда не побеждал — в итоге каждая метка
// рендерилась с чистым scale(1) без единого пикселя сдвига: визуально
// застревала в точке (0,0) карты вместо своей настоящей географической
// позиции.
//
// Исправление: анимация появления теперь живёт на ВНУТРЕННЕМ элементе-
// обёртке, и клики тоже вешаются на него. ВНЕШНИЙ элемент (то, что
// возвращается отсюда и передаётся в `Marker`) никогда не трогается нашим
// CSS по свойству `transform` — MapLibre получает над ним полный контроль.
function wrap(inner, onClick) {
  inner.classList.add('animate-pin-in')
  if (onClick) inner.addEventListener('click', onClick)
  const outer = document.createElement('div')
  outer.appendChild(inner)
  return outer
}

export function createCountryPin({ name, icon, active, onClick }) {
  const inner = document.createElement('button')
  inner.type = 'button'
  inner.className = [
    'group flex items-center gap-2 rounded-full pl-2 pr-3.5 py-1.5',
    'font-body text-[13px] font-semibold whitespace-nowrap',
    'shadow-pin border transition-transform duration-150 ease-out',
    'hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold',
    'cursor-pointer',
    active
      ? 'bg-ink text-porcelain border-gold/70'
      : 'bg-porcelain/90 text-ink-soft border-ink/10 opacity-70 grayscale hover:opacity-90',
  ].join(' ')

  inner.innerHTML = `
    <span class="grid place-items-center w-6 h-6 rounded-full text-[15px] ${active ? 'bg-gold/20' : 'bg-ink/5'}">${icon}</span>
    <span>${name}</span>
    ${active ? '<span class="w-1.5 h-1.5 rounded-full bg-gold"></span>' : '<span class="text-[10px] uppercase tracking-wide text-ink-soft/60">скоро</span>'}
  `
  return wrap(inner, onClick)
}

export function createRegionPin({ name, onClick }) {
  const inner = document.createElement('button')
  inner.type = 'button'
  inner.className = [
    'group flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1',
    'bg-jade/90 text-porcelain border border-porcelain/30 shadow-pin',
    'font-body text-[12px] font-medium whitespace-nowrap',
    'transition-transform duration-150 ease-out hover:-translate-y-0.5',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold cursor-pointer',
  ].join(' ')
  inner.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="opacity-90">
      <path d="M3 20L9 8L13 15L16 10L21 20H3Z" fill="currentColor"/>
    </svg>
    <span>${name}</span>
  `
  return wrap(inner, onClick)
}

export function createTeaPin({ name, category, labeled = false, onClick }) {
  const color = categoryColor(category)

  if (labeled) {
    const inner = document.createElement('button')
    inner.type = 'button'
    inner.className = [
      'group flex items-center gap-1.5 rounded-full pl-1 pr-3 py-1',
      'bg-porcelain border shadow-pin cursor-pointer',
      'font-body text-[12px] font-medium text-ink whitespace-nowrap',
      'transition-transform duration-150 ease-out hover:-translate-y-0.5',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold',
    ].join(' ')
    inner.style.borderColor = color
    inner.innerHTML = `
      <span class="w-3 h-3 rounded-full border border-porcelain shrink-0" style="background:${color}"></span>
      <span>${name}</span>
    `
    return wrap(inner, onClick)
  }

  const inner = document.createElement('button')
  inner.type = 'button'
  inner.className = [
    'group relative grid place-items-center w-4 h-4 rounded-full',
    'border-2 border-porcelain shadow-pin cursor-pointer',
    'transition-transform duration-150 ease-out hover:scale-125',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold',
  ].join(' ')
  inner.style.backgroundColor = color

  const tooltip = document.createElement('span')
  tooltip.className = [
    'pointer-events-none absolute bottom-[130%] left-1/2 -translate-x-1/2',
    'whitespace-nowrap rounded-md bg-ink text-porcelain text-[11px] font-medium',
    'px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-pin',
  ].join(' ')
  tooltip.textContent = name
  inner.appendChild(tooltip)

  return wrap(inner, onClick)
}
