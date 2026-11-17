import { useMemo, useState } from 'react'
import { categoryColor } from '../lib/categoryStyle'
import { useI18n } from '../lib/i18n'
import { useDebouncedValue } from '../lib/useDebouncedValue'
import { PialaIcon } from './DonateModal'
import { typograph } from '../lib/typograph'
import TeaCeremonyHeroArt from './TeaCeremonyHeroArt'
import { EmptyState, LoadingSkeleton, StatesDemoViewer } from './States'
import { useTheme } from '../lib/theme'

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

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
    const isCurrent = !nav.region
    crumbs.push({
      label: nav.country.name,
      onClick: isCurrent ? undefined : () => onCountry(nav.country.id),
    })
  }
  if (nav.region) crumbs.push({ label: nav.region, onClick: undefined })

  return (
    <nav aria-label={t('breadcrumbLabel')} className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-muted/40 text-xs">/</span>}
          <button
            type="button"
            onClick={crumb.onClick}
            disabled={!crumb.onClick}
            className={`text-[12.5px] font-medium whitespace-nowrap rounded px-1 py-0.5 ${FOCUS_RING} ${
              i === crumbs.length - 1
                ? 'text-accent-text font-semibold'
                : 'text-muted hover:text-text transition-colors'
            } ${crumb.onClick ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {typograph(crumb.label)}
          </button>
        </span>
      ))}
    </nav>
  )
}

function SectionLabel({ children }) {
  return (
    <p className="text-sm font-medium text-muted">
      {typograph(String(children))}
    </p>
  )
}

function CountryList({ countries, current, onPick }) {
  const { t } = useI18n()
  const sorted = [...countries].sort((a, b) => b.teaCount - a.teaCount)
  return (
    <div className="flex flex-col gap-1.5">
      {sorted.map((c) => {
        const active = c.teaCount > 0
        const isCurrent = current?.id === c.id
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onPick(c.id)}
            className={[
              'flex items-center gap-3 rounded-2xl px-3 py-2.5 min-h-[44px] text-left transition-all cursor-pointer border',
              FOCUS_RING,
              isCurrent
                ? 'bg-primary-soft text-primary border-primary/30 shadow-sm font-semibold'
                : 'bg-surface hover:bg-surface-2 text-text border-transparent',
              !active && 'opacity-60 grayscale',
            ].join(' ')}
          >
            <span className="grid place-items-center w-8 h-8 rounded-full bg-surface-2 text-[15px] shrink-0 border border-border/60">
              {c.icon}
            </span>
            <span className="text-base font-medium flex-1">{typograph(c.name)}</span>
            {active ? (
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-surface ${
                  isCurrent ? 'bg-accent' : 'bg-primary'
                }`}
              />
            ) : (
              <span className="font-mono text-[9px] uppercase tracking-wider text-muted shrink-0">
                {typograph(t('soon'))}
              </span>
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
          className={`flex items-center gap-2.5 rounded-xl px-3 py-2 min-h-[44px] text-left bg-surface hover:bg-surface-2 transition-colors border border-border/40 ${FOCUS_RING}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-primary">
            <path d="M3 20L9 8L13 15L16 10L21 20H3Z" fill="currentColor" />
          </svg>
          <span className="text-base font-medium text-text flex-1">{typograph(r.name)}</span>
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
      className={`flex items-center gap-2.5 rounded-xl px-3 py-2 min-h-[44px] text-left hover:bg-surface-2 transition-colors w-full border border-transparent hover:border-border/60 ${FOCUS_RING}`}
    >
      <span
        className="w-2.5 h-2.5 rounded-full border border-surface shadow-sm shrink-0"
        style={{ backgroundColor: categoryColor(tea.category) }}
      />
      <span className="text-base text-text font-medium flex-1">{typograph(tea.name)}</span>
      {countryIcon && <span className="text-[13px] shrink-0 opacity-80">{countryIcon}</span>}
    </button>
  )
}

function TeaListFlat({ teas, onPick }) {
  const { t } = useI18n()
  if (!teas.length) {
    return (
      <EmptyState
        title={t('noTeasInRegion')}
        description={t('noTeasInRegionDesc')}
      />
    )
  }
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
          className={`text-[11px] font-medium text-accent-text hover:underline shrink-0 rounded px-1.5 py-0.5 ${FOCUS_RING}`}
        >
          {typograph(allHidden ? t('filterAll') : t('filterNone'))}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-1 mt-2">
        {categories.map((cat) => {
          const visible = !hiddenCategories.has(cat.id)
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onToggleCategory(cat.id)}
              aria-pressed={visible}
              className={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 min-h-[40px] hover:bg-surface-2 transition-colors border ${
                visible ? 'border-border/50 bg-surface' : 'border-transparent opacity-50'
              } ${FOCUS_RING}`}
            >
              <span
                className="w-3.5 h-3.5 rounded-md border border-border shrink-0 grid place-items-center shadow-sm"
                style={{ backgroundColor: visible ? categoryColor(cat.id) : 'transparent' }}
              >
                {visible && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1 4L3 6L7 1.5" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <span className="text-[12.5px] text-text font-medium leading-tight text-left flex-1 truncate">
                {typograph(cat.name)}
              </span>
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
      ? teas.filter(
          (tea) =>
            tea.name.toLowerCase().includes(q) ||
            (tea.region || '').toLowerCase().includes(q)
        )
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
      <CategoryFilter
        categories={categories}
        hiddenCategories={hiddenCategories}
        onToggleCategory={onToggleCategory}
      />

      {teas.length > 0 && (
        <div className="flex flex-col gap-2.5">
          <div className="h-px bg-border/60" />
          <label htmlFor="tea-search" className="text-sm font-medium text-muted">{typograph(t('allTeasSearch'))}</label>

          <div className="relative flex items-center">
            <input
              id="tea-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className={`w-full text-[13px] bg-surface-2 rounded-xl pl-3.5 pr-12 py-2.5 min-h-[44px] placeholder:text-muted/60 text-text outline-none border border-field focus:border-primary transition-colors ${FOCUS_RING}`}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label={t('clearSearch')}
                className="absolute right-0 w-11 h-11 rounded-full text-muted hover:text-text grid place-items-center text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex flex-col gap-3 mt-1">
            {categories
              .filter((cat) => grouped.has(cat.id))
              .map((cat) => (
                <div key={cat.id}>
                  <p className="text-[10.5px] font-mono text-muted uppercase tracking-wider mb-1.5 px-2">
                    {typograph(cat.name)}
                  </p>
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
              <EmptyState
                title={t('nothingFound')}
                description={t('nothingFoundDesc')}
                actionLabel={t('clearSearch')}
                onAction={() => setQuery('')}
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()
  const options = [
    { id: 'light', icon: '☀️', label: t('themeLight') },
    { id: 'system', icon: '💻', label: t('themeSystem') },
    { id: 'dark', icon: '🌙', label: t('themeDark') },
  ]

  return (
    <div
      role="group"
      aria-label={t('themeGroupLabel')}
      className="flex items-center rounded-full bg-surface-2 p-0.5 border border-border/60 shrink-0"
    >
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => setTheme(opt.id)}
          aria-pressed={theme === opt.id}
          aria-label={opt.label}
          title={opt.label}
          className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-full text-[11px] grid place-items-center transition-all ${FOCUS_RING} ${
            theme === opt.id
              ? 'bg-surface text-text shadow-sm font-bold'
              : 'text-muted hover:text-text'
          }`}
        >
          <span aria-hidden="true">{opt.icon}</span>
        </button>
      ))}
    </div>
  )
}

function LocaleToggle() {
  const { locale, setLocale, t } = useI18n()
  return (
    <div
      role="group"
      aria-label={t('localeGroupLabel')}
      className="flex rounded-full bg-surface-2 p-0.5 border border-border/60 shrink-0"
    >
      {['en', 'ru'].map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          aria-label={l.toUpperCase()}
          className={`px-3 py-1 min-w-[44px] min-h-[44px] rounded-full text-[10px] font-mono uppercase transition-all ${FOCUS_RING} ${
            locale === l
              ? 'bg-surface text-text shadow-sm font-bold'
              : 'text-muted hover:text-text'
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
    return (
      <EmptyState
        title={t('noFavorites')}
        description={t('noFavoritesDesc')}
        icon="❤️"
      />
    )
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
  onOpenDonate,
}) {
  const { t } = useI18n()
  const [expanded, setExpanded] = useState(() => typeof window === 'undefined' || window.innerWidth >= 640)
  const [view, setView] = useState('nav') // 'nav' | 'reference' | 'favorites'
  const [showStatesDemo, setShowStatesDemo] = useState(false)

  if (!expanded) {
    return (
      <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 flex flex-col gap-2.5">
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-label={t('openMenu')}
          className={`grid place-items-center w-12 h-12 rounded-2xl bg-surface backdrop-blur-md border border-border shadow-panel text-text font-display text-xl transition-all hover:scale-105 ${FOCUS_RING}`}
        >
          茶
        </button>
        {onOpenDonate && (
          <button
            type="button"
            onClick={onOpenDonate}
            title={t('donateBtn')}
            aria-label={t('donateBtn')}
            className={`grid place-items-center w-12 h-12 rounded-2xl bg-surface backdrop-blur-md border border-border shadow-panel text-accent-text hover:text-accent transition-all hover:scale-105 ${FOCUS_RING}`}
          >
            <PialaIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    )
  }

  const regionTeas = nav.region ? nav.teas.filter((tea) => regionsMatch(tea.region || '', nav.region)) : []
  const pickTea = (tea) => onSelectTea(nav.country.id, tea)

  return (
    <>
      <aside aria-label={t('appTitle')} className="tea-sidebar absolute top-2 left-2 right-2 bottom-2 sm:right-auto sm:bottom-4 sm:top-4 sm:left-4 sm:w-80 z-20 flex flex-col bg-surface backdrop-blur-lg border border-border rounded-3xl shadow-panel overflow-hidden transition-colors">
        {/* Keep the title above the independent theme and language controls. */}
        <div className="flex flex-col gap-2 px-4 pt-4 pb-3 shrink-0 border-b border-border/50">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h1 className="font-display text-xl text-text font-semibold leading-tight truncate">
                {typograph(t('appTitle'))}
              </h1>
              <p className="text-sm text-muted mt-1 truncate">
                {typograph(t('appTagline'))}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label={t('collapseMenu')}
              className={`w-11 h-11 rounded-full grid place-items-center text-muted hover:text-text hover:bg-surface-2 transition-colors shrink-0 ${FOCUS_RING}`}
            >
              ✕
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            <LocaleToggle />
          </div>
        </div>

        {/* Хлебные крошки и статистика */}
        <div className="px-4 py-2.5 shrink-0 bg-surface-2/40 border-b border-border/40">
          <Breadcrumb nav={nav} onHome={onHome} onCountry={onPickCountry} />
          {nav.country && (
            <p className="font-mono text-[10px] text-muted mt-1">
              {typograph(t('teaCountLine', nav.teas.length, nav.regions.length))}
            </p>
          )}
        </div>

        {/* Основные вкладки (Навигация / Справочник / Избранное) */}
        <div className="flex gap-1.5 p-2 shrink-0 bg-surface">
          {[
            { id: 'nav', label: t('tabNav') },
            { id: 'reference', label: t('tabReference') },
            { id: 'favorites', label: t('tabFavorites'), count: favoriteTeas.length },
          ].map((tabItem) => (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setView(tabItem.id)}
              aria-pressed={view === tabItem.id}
              className={[
                'flex-1 text-[12.5px] font-semibold py-2.5 min-h-[44px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5',
                FOCUS_RING,
                view === tabItem.id
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-muted hover:text-text hover:bg-surface-2',
              ].join(' ')}
            >
              <span>{typograph(tabItem.label)}</span>
              {tabItem.count !== undefined && tabItem.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    view === tabItem.id
                      ? 'bg-on-primary text-primary font-bold'
                      : 'bg-surface-2 text-muted'
                  }`}
                >
                  {tabItem.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="h-px bg-border/60 shrink-0" />

        {/* Основная прокручиваемая область контента */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 py-3.5 flex flex-col gap-4">
          {view === 'nav' ? (
            <>
              {!nav.country ? (
                <div className="flex flex-col gap-3.5">
                  <div className="rounded-2xl bg-surface-2 border border-border/70 p-2 flex justify-center shadow-sm overflow-hidden">
                    <TeaCeremonyHeroArt width={280} height={155} className="w-full h-auto max-w-[280px]" />
                  </div>
                  <SectionLabel>{t('countries')}</SectionLabel>
                  <CountryList countries={countries} current={nav.country} onPick={onPickCountry} />
                </div>
              ) : !nav.region ? (
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={onHome}
                    className={`flex items-center gap-1.5 text-[12.5px] text-muted hover:text-text transition-colors w-fit rounded py-1 px-2 hover:bg-surface-2 ${FOCUS_RING}`}
                  >
                    <span>{typograph(t('allCountries'))}</span>
                  </button>
                  <SectionLabel>
                    {nav.country.name} · {t('regionsHintClick')}
                  </SectionLabel>
                  {nav.loading ? (
                    <LoadingSkeleton count={4} />
                  ) : (
                    <RegionList regions={nav.regions} onPick={onPickRegion} />
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={onBackToRegions}
                    className={`flex items-center gap-1.5 text-[12.5px] text-muted hover:text-text transition-colors w-fit rounded py-1 px-2 hover:bg-surface-2 ${FOCUS_RING}`}
                  >
                    <span>{typograph(t('allRegions'))}</span>
                  </button>
                  <SectionLabel>
                    {nav.region} · {t('teaHintClick')}
                  </SectionLabel>
                  {nav.loading ? (
                    <LoadingSkeleton count={4} />
                  ) : (
                    <TeaListFlat teas={regionTeas} onPick={pickTea} />
                  )}
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

        {/* Подвал сайдбара с кнопками У1-демо и поддержки */}
        <div className="px-4 py-2.5 shrink-0 border-t border-border flex items-center justify-between bg-surface-2/40">
          {onOpenDonate ? (
            <button
              type="button"
              onClick={onOpenDonate}
              className={`flex items-center gap-2 text-[12.5px] font-medium text-accent-text hover:text-accent transition-colors rounded-lg py-1 px-2 hover:bg-surface-2 ${FOCUS_RING}`}
            >
              <PialaIcon className="w-4 h-4 text-accent-text shrink-0" />
              <span>{typograph(t('donateBtn'))}</span>
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            {/* Демо-переключатель состояний (Н4) — инструмент ревью для
                дизайнера/разработчика, а не часть продукта: показываем его
                только в dev-сборке, чтобы не нагружать интерфейс конечного
                пользователя служебной кнопкой. */}
            {import.meta.env.DEV && (
              <button
                type="button"
                onClick={() => setShowStatesDemo(true)}
                title="Открыть демонстрацию 4 состояний (Правило У1) — только в dev-сборке"
                className={`text-[10px] font-mono px-2 py-1 rounded-md bg-surface border border-border text-muted hover:text-text transition-colors ${FOCUS_RING}`}
              >
                У1 демо
              </button>
            )}
            <span className="text-sm text-muted">TeaMap</span>
          </div>
        </div>
      </aside>

      {/* Модалка демонстрации 4 состояний */}
      {showStatesDemo && <StatesDemoViewer onClose={() => setShowStatesDemo(false)} />}
    </>
  )
}
