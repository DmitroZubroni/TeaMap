import { useMemo, useState } from 'react'
import { categoryColor } from '../lib/categoryStyle'

// tea.region (e.g. "Сиху, Ханчжоу") and region.name (e.g. "Сиху (Ханчжоу)")
// don't always match exactly in the source data — different punctuation,
// extra location detail, etc. Normalize both and check for a substring
// match in either direction rather than requiring strict equality.
function normalizeRegion(s) {
  return s
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .replace(/[,.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function regionsMatch(a, b) {
  const na = normalizeRegion(a)
  const nb = normalizeRegion(b)
  return na.includes(nb) || nb.includes(na)
}

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

function RegionList({ regions, onPick }) {
  if (!regions.length) return null
  return (
    <div className="flex flex-col gap-1">
      {regions.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => onPick(r)}
          className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-ink/5 transition-colors"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="shrink-0 text-jade">
            <path d="M3 20L9 8L13 15L16 10L21 20H3Z" fill="currentColor" />
          </svg>
          <span className="text-[13px] text-ink flex-1 truncate">{r.name}</span>
        </button>
      ))}
    </div>
  )
}

function TeaRow({ tea, onPick, countryIcon }) {
  return (
    <button
      type="button"
      onClick={() => onPick(tea)}
      className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-ink/5 transition-colors w-full"
    >
      <span
        className="w-2 h-2 rounded-full border border-ink/10 shrink-0"
        style={{ backgroundColor: categoryColor(tea.category) }}
      />
      <span className="text-[13px] text-ink flex-1 truncate">{tea.name}</span>
      {countryIcon && <span className="text-[12px] shrink-0 opacity-70">{countryIcon}</span>}
    </button>
  )
}

function TeaListFlat({ teas, onPick }) {
  if (!teas.length) return <p className="text-[13px] text-ink-soft/60 px-2">Чаи этого региона пока не добавлены.</p>
  return (
    <div className="flex flex-col gap-0.5">
      {teas.map((t) => (
        <TeaRow key={t.id} tea={t} onPick={onPick} />
      ))}
    </div>
  )
}

function ReferenceTab({ categories, teas, countries, onPick }) {
  const [query, setQuery] = useState('')
  const iconByCountry = Object.fromEntries(countries.map((c) => [c.id, c.icon]))
  const showCountryIcon = new Set(teas.map((t) => t.countryId)).size > 1

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q
      ? teas.filter((t) => t.name.toLowerCase().includes(q) || (t.region || '').toLowerCase().includes(q))
      : teas
    const byCategory = new Map()
    filtered.forEach((t) => {
      if (!byCategory.has(t.category)) byCategory.set(t.category, [])
      byCategory.get(t.category).push(t)
    })
    return byCategory
  }, [teas, query])

  return (
    <div className="flex flex-col gap-4">
      <div>
        <SectionLabel>цвет точки = цвет настоя</SectionLabel>
        <div className="grid grid-cols-1 gap-1 mt-2">
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

      {teas.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="h-px bg-ink/10" />
          <SectionLabel>все чаи · поиск по всем странам</SectionLabel>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Название или регион…"
            className="w-full text-[13px] bg-ink/5 rounded-lg px-3 py-1.5 placeholder:text-ink-soft/40 text-ink outline-none focus:bg-ink/10 transition-colors"
          />
          <div className="flex flex-col gap-3 mt-1">
            {categories
              .filter((cat) => grouped.has(cat.id))
              .map((cat) => (
                <div key={cat.id}>
                  <p className="text-[10px] text-ink-soft/50 uppercase tracking-wide mb-1 px-2">{cat.name}</p>
                  <div className="flex flex-col gap-0.5">
                    {grouped.get(cat.id).map((t) => (
                      <TeaRow
                        key={`${t.countryId}-${t.id}`}
                        tea={t}
                        onPick={onPick}
                        countryIcon={showCountryIcon ? iconByCountry[t.countryId] : null}
                      />
                    ))}
                  </div>
                </div>
              ))}
            {query && grouped.size === 0 && (
              <p className="text-[13px] text-ink-soft/60 px-2">Ничего не найдено.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Sidebar({
  nav,
  onHome,
  countries,
  categories,
  allTeas,
  onPickCountry,
  onPickRegion,
  onBackToRegions,
  onSelectTea,
  onPickGlobalTea,
}) {
  const [expanded, setExpanded] = useState(
    () => typeof window === 'undefined' || window.innerWidth >= 640
  )
  const [view, setView] = useState('nav') // 'nav' | 'reference'

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label="Открыть меню"
        className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 grid place-items-center w-11 h-11 rounded-full bg-porcelain/80 backdrop-blur-md border border-ink/10 shadow-panel text-ink font-display text-lg"
      >
        茶
      </button>
    )
  }

  const regionTeas = nav.region ? nav.teas.filter((t) => regionsMatch(t.region || '', nav.region)) : []
  const pickTea = (t) => onSelectTea(nav.country.id, t)

  return (
    <aside className="absolute top-2 left-2 right-2 bottom-2 sm:right-auto sm:bottom-4 sm:top-4 sm:left-4 sm:w-72 z-20 flex flex-col bg-porcelain/75 backdrop-blur-md border border-ink/10 rounded-2xl shadow-panel overflow-hidden">
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
        {nav.country && (
          <p className="font-mono text-[10px] text-ink-soft/50 mt-1">
            {nav.teas.length} точек чая · {nav.regions.length} регионов
          </p>
        )}
      </div>

      <div className="flex gap-1 px-4 shrink-0">
        <button
          type="button"
          onClick={() => setView('nav')}
          className={[
            'flex-1 text-[12px] font-medium py-1.5 rounded-lg transition-colors',
            view === 'nav' ? 'bg-ink text-porcelain' : 'text-ink-soft/60 hover:bg-ink/5',
          ].join(' ')}
        >
          Навигация
        </button>
        <button
          type="button"
          onClick={() => setView('reference')}
          className={[
            'flex-1 text-[12px] font-medium py-1.5 rounded-lg transition-colors',
            view === 'reference' ? 'bg-ink text-porcelain' : 'text-ink-soft/60 hover:bg-ink/5',
          ].join(' ')}
        >
          Справочник
        </button>
      </div>

      <div className="h-px bg-ink/10 shrink-0 mt-3" />

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 flex flex-col gap-4">
        {view === 'nav' ? (
          <>
            <div className="flex flex-col gap-2">
              <SectionLabel>страны</SectionLabel>
              <CountryList countries={countries} current={nav.country} onPick={onPickCountry} />
            </div>

            {nav.country && nav.regions.length > 0 && (
              <>
                <div className="h-px bg-ink/10" />
                {!nav.region ? (
                  <div className="flex flex-col gap-2">
                    <SectionLabel>регионы · клик покажет чаи региона</SectionLabel>
                    <RegionList regions={nav.regions} onPick={onPickRegion} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={onBackToRegions}
                      className="flex items-center gap-1.5 text-[12px] text-ink-soft/60 hover:text-ink transition-colors w-fit"
                    >
                      <span>←</span>
                      <span>Все регионы</span>
                    </button>
                    <SectionLabel>{nav.region} · клик открывает карточку</SectionLabel>
                    <TeaListFlat teas={regionTeas} onPick={pickTea} />
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <ReferenceTab categories={categories} teas={allTeas} countries={countries} onPick={onPickGlobalTea} />
        )}
      </div>
    </aside>
  )
}
