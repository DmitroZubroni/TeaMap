import { categoryColor } from './categoryStyle'

export function createCountryPin({ name, icon, active }) {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = [
    'group flex items-center gap-2 rounded-full pl-2 pr-3.5 py-1.5',
    'font-body text-[13px] font-semibold whitespace-nowrap',
    'shadow-pin border transition-transform duration-150 ease-out',
    'hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold',
    'animate-pin-in cursor-pointer',
    active
      ? 'bg-ink text-porcelain border-gold/70'
      : 'bg-porcelain/90 text-ink-soft border-ink/10 opacity-70 grayscale hover:opacity-90',
  ].join(' ')

  el.innerHTML = `
    <span class="grid place-items-center w-6 h-6 rounded-full text-[15px] ${active ? 'bg-gold/20' : 'bg-ink/5'}">${icon}</span>
    <span>${name}</span>
    ${active ? '<span class="w-1.5 h-1.5 rounded-full bg-gold"></span>' : '<span class="text-[10px] uppercase tracking-wide text-ink-soft/60">скоро</span>'}
  `
  return el
}

export function createRegionPin({ name }) {
  const el = document.createElement('button')
  el.type = 'button'
  el.className = [
    'group flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1',
    'bg-jade/90 text-porcelain border border-porcelain/30 shadow-pin',
    'font-body text-[12px] font-medium whitespace-nowrap',
    'transition-transform duration-150 ease-out hover:-translate-y-0.5',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold animate-pin-in cursor-pointer',
  ].join(' ')
  el.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" class="opacity-90">
      <path d="M3 20L9 8L13 15L16 10L21 20H3Z" fill="currentColor"/>
    </svg>
    <span>${name}</span>
  `
  return el
}

export function createTeaPin({ name, category }) {
  const color = categoryColor(category)
  const el = document.createElement('button')
  el.type = 'button'
  el.className = [
    'group relative grid place-items-center w-4 h-4 rounded-full',
    'border-2 border-porcelain shadow-pin animate-pin-in cursor-pointer',
    'transition-transform duration-150 ease-out hover:scale-125',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold',
  ].join(' ')
  el.style.backgroundColor = color

  const tooltip = document.createElement('span')
  tooltip.className = [
    'pointer-events-none absolute bottom-[130%] left-1/2 -translate-x-1/2',
    'whitespace-nowrap rounded-md bg-ink text-porcelain text-[11px] font-medium',
    'px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-pin',
  ].join(' ')
  tooltip.textContent = name
  el.appendChild(tooltip)

  return el
}
