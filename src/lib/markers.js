import { teaIconMarkup } from './teaIcons'
import { categoryColor } from './categoryStyle'

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
    'shadow-pin border transition-all duration-150 ease-out',
    'hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    'cursor-pointer',
    active
      ? 'bg-surface text-text border-primary/50 hover:border-primary shadow-sm'
      : 'bg-surface-2/90 text-muted border-border opacity-75 grayscale hover:opacity-95',
  ].join(' ')

  inner.innerHTML = `
    <span class="grid place-items-center w-6 h-6 rounded-full text-[15px] ${
      active ? 'bg-primary-soft text-primary' : 'bg-surface text-muted'
    }">${teaIconMarkup(icon)}</span>
    <span class="text-text">${name}</span>
    ${
      active
        ? '<span class="w-2 h-2 rounded-full bg-accent ring-2 ring-surface"></span>'
        : '<span class="text-[9.5px] font-mono uppercase tracking-wider text-muted">скоро</span>'
    }
  `
  return wrap(inner, onClick)
}

export function createRegionPin({ name, onClick }) {
  const inner = document.createElement('button')
  inner.type = 'button'
  inner.className = [
    'group flex items-center gap-1.5 rounded-full pl-2 pr-3.5 py-1',
    'bg-primary text-on-primary border border-surface/30 shadow-pin',
    'font-body text-[12px] font-medium whitespace-nowrap',
    'transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-primary-hover',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer',
  ].join(' ')
  inner.innerHTML = `
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" class="opacity-95 text-on-primary">
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
      'group flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1',
      'bg-surface border shadow-pin cursor-pointer',
      'font-body text-[12px] font-medium text-text whitespace-nowrap',
      'transition-all duration-150 ease-out hover:-translate-y-0.5 hover:shadow-md',
      'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    ].join(' ')
    inner.style.borderColor = color
    inner.innerHTML = `
      <span class="w-3 h-3 rounded-full border-2 border-surface shrink-0 shadow-sm" style="background:${color}"></span>
      <span class="text-text">${name}</span>
    `
    return wrap(inner, onClick)
  }

  const inner = document.createElement('button')
  inner.type = 'button'
  inner.className = [
    'group relative grid place-items-center w-4 h-4 rounded-full',
    'border-2 border-surface shadow-pin cursor-pointer',
    'transition-all duration-150 ease-out hover:scale-125 hover:z-20',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  ].join(' ')
  inner.style.backgroundColor = color

  const tooltip = document.createElement('span')
  tooltip.className = [
    'pointer-events-none absolute bottom-[135%] left-1/2 -translate-x-1/2',
    'whitespace-nowrap rounded-lg bg-surface text-text text-[11px] font-medium border border-border',
    'px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shadow-pin z-30',
  ].join(' ')
  tooltip.textContent = name
  inner.appendChild(tooltip)

  return wrap(inner, onClick)
}
