import { useState } from 'react'
import { categoryColor } from '../lib/categoryStyle'

function Breadcrumb({ nav, onHome }) {
  const crumbs = ['Мир']
  if (nav.country) crumbs.push(nav.country.name)
  if (nav.region) crumbs.push(nav.region)

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-ink/25 text-xs">/</span>}
          <button
            type="button"
            onClick={i === 0 ? onHome : undefined}
            className={`text-[12.5px] font-medium whitespace-nowrap ${
              i === crumbs.length - 1 ? 'text-gold' : 'text-ink/55 hover:text-ink transition-colors'
            } ${i === 0 ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {c}
          </button>
        </span>
      ))}
    </div>
  )
}

function SectionLabel({ children }) {
  return <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/50">{children}</p>
}

function CountryList({ countries, current, onPick }) {
  const sorted = [...countries].sort((a, b) => b.teaCount - a.teaCount)
  return (
    <div className="flex flex-col gap-1">
      {sorted.map((c) => {
        const active = c.teaCount > 0
        const isCurrent = current?.id === c.id
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onPick(c.id)}
            className={[
              'flex items-center gap-2 rounded-xl px-2 py-1.5 text-left transition-colors',
              isCurrent ? 'bg-gold/25' : 'hover:bg-ink/5',
              !active && 'opacity-55',
            ].join(' ')}
          >
            <span className="grid place-items-center w-6 h-6 rounded-full bg-ink/5 text-[13px] shrink-0">
              {c.icon}
            </span>
            <span className="text-[13px] text-ink flex-1 truncate">{c.name}</span>
            {active ? (
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isCurrent ? 'bg-gold' : 'bg-jade'}`} />
            ) : (
              <span className="text-[9px] uppercase tracking-wide text-ink-soft/50 shrink-0">скоро</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function LegendList({ categories }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full"
      >
        <SectionLabel>цвет точки = цвет настоя</SectionLabel>
        <span className={`text-ink-soft/50 text-[10px] transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="grid grid-cols-1 gap-1 mt-2 animate-panel-in">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full border border-ink/10 shrink-0"
                style={{ backgroundColor: categoryColor(cat.id) }}
              />
              <span className="text-[12px] text-ink/80 leading-tight">{cat.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ nav, onHome, countries, categories, onPickCountry }) {
  const [expanded, setExpanded] = useState(true)

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label="Открыть меню"
        className="absolute top-4 left-4 z-20 grid place-items-center w-11 h-11 rounded-full bg-porcelain/80 backdrop-blur-md border border-ink/10 shadow-panel text-ink font-display text-lg"
      >
        茶
      </button>
    )
  }

  return (
    <aside className="absolute top-4 left-4 bottom-4 z-20 w-64 max-w-[80vw] flex flex-col bg-porcelain/75 backdrop-blur-md border border-ink/10 rounded-2xl shadow-panel overflow-hidden">
      <div className="flex items-start justify-between px-4 pt-4 pb-3 shrink-0">
        <div>
          <p className="font-display text-lg text-ink leading-none">茶 · Атлас чая</p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ink-soft/60 mt-1">
            карта чайных регионов
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-label="Свернуть меню"
          className="text-ink/40 hover:text-ink transition-colors text-sm leading-none mt-1"
        >
          ✕
        </button>
      </div>

      <div className="px-4 pb-3 shrink-0">
        <Breadcrumb nav={nav} onHome={onHome} />
      </div>

      <div className="h-px bg-ink/10 shrink-0" />

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <SectionLabel>страны</SectionLabel>
          <CountryList countries={countries} current={nav.country} onPick={onPickCountry} />
        </div>

        <div className="h-px bg-ink/10" />

        <LegendList categories={categories} />
      </div>
    </aside>
  )
}
