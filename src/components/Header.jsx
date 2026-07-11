import { useState } from 'react'
import { categoryColor } from '../lib/categoryStyle'

function Breadcrumb({ nav, onHome }) {
  const crumbs = ['Мир']
  if (nav.country) crumbs.push(nav.country.name)
  if (nav.region) crumbs.push(nav.region)

  return (
    <div className="flex items-center gap-1.5 bg-ink rounded-full px-3 py-1.5 shrink-0">
      {crumbs.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-porcelain/30 text-xs">/</span>}
          <button
            type="button"
            onClick={i === 0 ? onHome : undefined}
            className={`text-[12.5px] font-medium whitespace-nowrap ${
              i === crumbs.length - 1
                ? 'text-gold-soft'
                : 'text-porcelain/70 hover:text-porcelain transition-colors'
            } ${i === 0 ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {c}
          </button>
        </span>
      ))}
    </div>
  )
}

function LegendMenu({ categories }) {
  const [open, setOpen] = useState(false)
  if (!categories.length) return null

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Что означают цвета точек"
        className={`grid place-items-center w-9 h-9 rounded-full border transition-colors ${
          open ? 'bg-ink text-porcelain border-ink' : 'bg-ink/5 text-ink border-ink/10 hover:bg-ink/10'
        }`}
      >
        <span className="font-display text-sm italic">i</span>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 bg-porcelain border border-ink/10 rounded-2xl px-4 py-3 shadow-panel w-56 animate-panel-in z-10">
          <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/60 mb-2">
            цвет точки = цвет настоя
          </p>
          <div className="grid grid-cols-1 gap-1">
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
        </div>
      )}
    </div>
  )
}

function CountryPicker({ countries, current, onPick }) {
  const active = countries.filter((c) => c.teaCount > 0)
  if (active.length === 0) return null

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {active.map((c) => {
        const isCurrent = current?.id === c.id
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onPick(c.id)}
            className={[
              'flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1.5 border transition-colors',
              'text-[12.5px] font-medium whitespace-nowrap',
              isCurrent ? 'bg-gold text-ink border-gold' : 'bg-ink/5 text-ink border-ink/10 hover:bg-ink/10',
            ].join(' ')}
          >
            <span className="grid place-items-center w-5 h-5 rounded-full bg-white/40 text-[12px]">{c.icon}</span>
            <span>{c.name}</span>
          </button>
        )
      })}
    </div>
  )
}

export default function Header({ nav, onHome, countries, categories, onPickCountry }) {
  return (
    <header className="absolute top-0 inset-x-0 z-20 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 sm:px-5 py-3 bg-porcelain/95 backdrop-blur-sm border-b border-ink/10 shadow-panel">
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0">
          <p className="font-display text-lg text-ink leading-none">茶 · Атлас чая</p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ink-soft/60 mt-0.5 hidden sm:block">
            карта чайных регионов мира
          </p>
        </div>
        <Breadcrumb nav={nav} onHome={onHome} />
      </div>

      <div className="flex items-center gap-2">
        <CountryPicker countries={countries} current={nav.country} onPick={onPickCountry} />
        <LegendMenu categories={categories} />
      </div>
    </header>
  )
}
