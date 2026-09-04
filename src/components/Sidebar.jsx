import { useMemo, useState } from 'react'
import { categoryColor } from '../lib/categoryStyle'
import { useI18n } from '../lib/i18n'
import { useDebouncedValue } from '../lib/useDebouncedValue'

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold'

// tea.region (например, «Сиху, Ханчжоу») и region.name (например,
// «Сиху (Ханчжоу)») не всегда совпадают дословно в исходных данных — разная
// пунктуация, лишние уточнения местности и т.д. Нормализуем обе строки и
// проверяем вхождение в любую сторону, а не требуем точного совпадения.
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

function Breadcrumb({ nav, onHome, onCountry }) {
  const { t } = useI18n()
  const crumbs = [{ label: t('home'), onClick: onHome }]
  if (nav.country) {
    // Кликабелен, только если это не последняя (текущая) крошка — то есть
    // когда после страны ещё есть регион, и клик по стране означает «вернуться
    // к обзору страны», а не «остаться на месте».
    const isCurrent = !nav.region
    crumbs.push({ label: nav.country.name, onClick: isCurrent ? undefined : () => onCountry(nav.country.id) })
  }
  if (nav.region) crumbs.push({ label: nav.region, onClick: undefined })

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-ink/25 text-xs">/</span>}
          <button
            type="button"
            onClick={crumb.onClick}
            disabled={!crumb.onClick}
            className={`text-[12.5px] font-medium whitespace-nowrap rounded ${FOCUS_RING} ${
              i === crumbs.length - 1 ? 'text-gold' : 'text-ink/55 hover:text-ink transition-colors'
            } ${crumb.onClick ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {crumb.label}
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
  const { t } = useI18n()
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
              FOCUS_RING,
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
              <span className="text-[9px] uppercase tracking-wide text-ink-soft/50 shrink-0">{t('soon')}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

function ListSkeleton({ rows = 4 }) {
  return (
    <div className="flex flex-col gap-1">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 px-2 py-1.5">
          <span className="w-3 h-3 rounded-full bg-ink/10 shrink-0 animate-pulse" />
          <span
            className="h-3 rounded bg-ink/10 animate-pulse"
            style={{ width: `${55 + ((i * 17) % 35)}%` }}
          />
        </div>
      ))}
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
          className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-ink/5 transition-colors ${FOCUS_RING}`}
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
      className={`flex items-center gap-2 rounded-xl px-2 py-1.5 text-left hover:bg-ink/5 transition-colors w-full ${FOCUS_RING}`}
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
  const { t } = useI18n()
  if (!teas.length) return <p className="text-[13px] text-ink-soft/60 px-2">{t('noTeasInRegion')}</p>
  return (
    <div className="flex flex-col gap-0.5">
      {teas.map((tea) => (
        <TeaRow key={tea.id} tea={tea} onPick={onPick} />
      ))}
    </div>
  )
}

function CategoryFilter({ categories, hiddenCategories, onToggleCategory }) {
  const { t } = useI18n()
  const allHidden = categories.length > 0 && categories.every((cat) => hiddenCategories.has(cat.id))

  return (
    <div>
      <div className="flex items-center justify-between">
        <SectionLabel>{t('filterTitle')}</SectionLabel>
        <button
          type="button"
          onClick={() =>
            categories.forEach((cat) => {
              const isHidden = hiddenCategories.has(cat.id)
              if (allHidden ? isHidden : !isHidden) onToggleCategory(cat.id)
            })
          }
          className={`text-[10px] text-gold hover:underline shrink-0 rounded ${FOCUS_RING}`}
        >
          {allHidden ? t('filterAll') : t('filterNone')}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-0.5 mt-2">
        {categories.map((cat) => {
          const visible = !hiddenCategories.has(cat.id)
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onToggleCategory(cat.id)}
              aria-pressed={visible}
              className={`flex items-center gap-2 rounded-lg px-1.5 py-1 hover:bg-ink/5 transition-colors ${FOCUS_RING} ${
                visible ? '' : 'opacity-40'
              }`}
            >
              <span
                className="w-3 h-3 rounded-md border border-ink/15 shrink-0 grid place-items-center"
                style={{ backgroundColor: visible ? categoryColor(cat.id) : 'transparent' }}
              >
                {visible && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4L3 6L7 1.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <span className="text-[12px] text-ink/80 leading-tight text-left flex-1 truncate">{cat.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function ReferenceTab({ categories, teas, countries, hiddenCategories, onToggleCategory, onPick }) {
  const { t } = useI18n()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebouncedValue(query, 200)
  const iconByCountry = Object.fromEntries(countries.map((c) => [c.id, c.icon]))
  const showCountryIcon = new Set(teas.map((tea) => tea.countryId)).size > 1

  const grouped = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase()
    const filtered = q
      ? teas.filter((tea) => tea.name.toLowerCase().includes(q) || (tea.region || '').toLowerCase().includes(q))
      : teas
    const byCategory = new Map()
    filtered.forEach((tea) => {
      if (!byCategory.has(tea.category)) byCategory.set(tea.category, [])
      byCategory.get(tea.category).push(tea)
    })
    return byCategory
  }, [teas, debouncedQuery])

  return (
    <div className="flex flex-col gap-4">
      <CategoryFilter categories={categories} hiddenCategories={hiddenCategories} onToggleCategory={onToggleCategory} />

      {teas.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="h-px bg-ink/10" />
          <SectionLabel>{t('allTeasSearch')}</SectionLabel>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className={`w-full text-[13px] bg-ink/5 rounded-lg px-3 py-1.5 placeholder:text-ink-soft/40 text-ink outline-none focus:bg-ink/10 transition-colors ${FOCUS_RING}`}
          />
          <div className="flex flex-col gap-3 mt-1">
            {categories
              .filter((cat) => grouped.has(cat.id))
              .map((cat) => (
                <div key={cat.id}>
                  <p className="text-[10px] text-ink-soft/50 uppercase tracking-wide mb-1 px-2">{cat.name}</p>
                  <div className="flex flex-col gap-0.5">
                    {grouped.get(cat.id).map((tea) => (
                      <TeaRow
                        key={`${tea.countryId}-${tea.id}`}
                        tea={tea}
                        onPick={onPick}
                        countryIcon={showCountryIcon ? iconByCountry[tea.countryId] : null}
                      />
                    ))}
                  </div>
                </div>
              ))}
            {debouncedQuery && grouped.size === 0 && (
              <p className="text-[13px] text-ink-soft/60 px-2">{t('nothingFound')}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function LocaleToggle() {
  const { locale, setLocale } = useI18n()
  return (
    <div className={`flex rounded-full bg-ink/5 p-0.5 shrink-0 ${FOCUS_RING}`}>
      {['en', 'ru'].map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase transition-colors ${FOCUS_RING} ${
            locale === l ? 'bg-ink text-porcelain' : 'text-ink-soft/60 hover:text-ink'
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  )
}

function FavoritesTab({ teas, countries, onPick }) {
  const { t } = useI18n()
  const iconByCountry = Object.fromEntries(countries.map((c) => [c.id, c.icon]))
  const showCountryIcon = new Set(teas.map((tea) => tea.countryId)).size > 1

  if (!teas.length) {
    return <p className="text-[13px] text-ink-soft/60 px-2">{t('noFavorites')}</p>
  }

  return (
    <div className="flex flex-col gap-0.5">
      {teas.map((tea) => (
        <TeaRow
          key={`${tea.countryId}-${tea.id}`}
          tea={tea}
          onPick={onPick}
          countryIcon={showCountryIcon ? iconByCountry[tea.countryId] : null}
        />
      ))}
    </div>
  )
}

export default function Sidebar({
  nav,
  onHome,
  countries,
  categories,
  allTeas,
  favoriteTeas,
  hiddenCategories,
  onToggleCategory,
  onPickCountry,
  onPickRegion,
  onBackToRegions,
  onSelectTea,
  onPickGlobalTea,
}) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(() => typeof window === 'undefined' || window.innerWidth >= 640)
  const [view, setView] = useState('nav') // 'nav' | 'reference' | 'favorites'

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={t('openMenu')}
        className={`absolute top-2 left-2 sm:top-4 sm:left-4 z-20 grid place-items-center w-11 h-11 rounded-full bg-porcelain/80 backdrop-blur-md border border-ink/10 shadow-panel text-ink font-display text-lg ${FOCUS_RING}`}
      >
        茶
      </button>
    )
  }

  const regionTeas = nav.region ? nav.teas.filter((tea) => regionsMatch(tea.region || '', nav.region)) : []
  const pickTea = (tea) => onSelectTea(nav.country.id, tea)

  return (
    <aside className="absolute top-2 left-2 right-2 bottom-2 sm:right-auto sm:bottom-4 sm:top-4 sm:left-4 sm:w-72 z-20 flex flex-col bg-porcelain/75 backdrop-blur-md border border-ink/10 rounded-2xl shadow-panel overflow-hidden">
      <div className="flex items-start justify-between px-4 pt-4 pb-3 shrink-0 gap-2">
        <div className="min-w-0">
          <p className="font-display text-lg text-ink leading-none truncate">{t('appTitle')}</p>
          <p className="font-mono text-[9px] uppercase tracking-widest text-ink-soft/60 mt-1 truncate">
            {t('appTagline')}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <LocaleToggle />
          <button
            type="button"
            onClick={() => setExpanded(false)}
            aria-label={t('collapseMenu')}
            className={`text-ink/40 hover:text-ink transition-colors text-sm leading-none rounded ${FOCUS_RING}`}
          >
            ✕
          </button>
        </div>
      </div>

      <div className="px-4 pb-3 shrink-0">
        <Breadcrumb nav={nav} onHome={onHome} onCountry={onPickCountry} />
        {nav.country && (
          <p className="font-mono text-[10px] text-ink-soft/50 mt-1">
            {t('teaCountLine', nav.teas.length, nav.regions.length)}
          </p>
        )}
      </div>

      <div className="flex gap-1 px-4 shrink-0">
        <button
          type="button"
          onClick={() => setView('nav')}
          className={[
            'flex-1 text-[12px] font-medium py-1.5 rounded-lg transition-colors',
            FOCUS_RING,
            view === 'nav' ? 'bg-ink text-porcelain' : 'text-ink-soft/60 hover:bg-ink/5',
          ].join(' ')}
        >
          {t('tabNav')}
        </button>
        <button
          type="button"
          onClick={() => setView('reference')}
          className={[
            'flex-1 text-[12px] font-medium py-1.5 rounded-lg transition-colors',
            FOCUS_RING,
            view === 'reference' ? 'bg-ink text-porcelain' : 'text-ink-soft/60 hover:bg-ink/5',
          ].join(' ')}
        >
          {t('tabReference')}
        </button>
        <button
          type="button"
          onClick={() => setView('favorites')}
          className={[
            'flex-1 text-[12px] font-medium py-1.5 rounded-lg transition-colors',
            FOCUS_RING,
            view === 'favorites' ? 'bg-ink text-porcelain' : 'text-ink-soft/60 hover:bg-ink/5',
          ].join(' ')}
        >
          {t('tabFavorites')}
        </button>
      </div>

      <div className="h-px bg-ink/10 shrink-0 mt-3" />

      <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3 flex flex-col gap-4">
        {view === 'nav' ? (
          <>
            {!nav.country ? (
              <div className="flex flex-col gap-2">
                <SectionLabel>{t('countries')}</SectionLabel>
                <CountryList countries={countries} current={nav.country} onPick={onPickCountry} />
              </div>
            ) : !nav.region ? (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onHome}
                  className={`flex items-center gap-1.5 text-[12px] text-ink-soft/60 hover:text-ink transition-colors w-fit rounded ${FOCUS_RING}`}
                >
                  <span>{t('allCountries')}</span>
                </button>
                <SectionLabel>
                  {nav.country.name} · {t('regionsHintClick')}
                </SectionLabel>
                {nav.loading ? <ListSkeleton /> : <RegionList regions={nav.regions} onPick={onPickRegion} />}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onBackToRegions}
                  className={`flex items-center gap-1.5 text-[12px] text-ink-soft/60 hover:text-ink transition-colors w-fit rounded ${FOCUS_RING}`}
                >
                  <span>{t('allRegions')}</span>
                </button>
                <SectionLabel>
                  {nav.region} · {t('teaHintClick')}
                </SectionLabel>
                {nav.loading ? <ListSkeleton /> : <TeaListFlat teas={regionTeas} onPick={pickTea} />}
              </div>
            )}
          </>
        ) : view === 'reference' ? (
          <ReferenceTab
            categories={categories}
            teas={allTeas}
            countries={countries}
            hiddenCategories={hiddenCategories}
            onToggleCategory={onToggleCategory}
            onPick={onPickGlobalTea}
          />
        ) : (
          <FavoritesTab teas={favoriteTeas} countries={countries} onPick={onPickGlobalTea} />
        )}
      </div>
    </aside>
  )
}
