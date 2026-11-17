import TeaIcon from './TeaIcon'
import { useEffect, useRef, useState, useCallback } from 'react'
import { getTeaDetail, getCategories } from '../lib/api'
import { categoryColor } from '../lib/categoryStyle'
import { useI18n } from '../lib/i18n'
import { typograph } from '../lib/typograph'
import { LoadingSkeleton, ErrorState } from './States'

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

function Field({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="text-sm font-medium text-muted">{typograph(label)}</p>
      <p className="text-base font-medium text-text leading-relaxed mt-0.5">{typograph(String(value))}</p>
    </div>
  )
}

function Section({ label, children }) {
  if (!children) return null
  return (
    <div className="border-t border-border pt-3.5">
      <p className="text-sm font-medium text-muted mb-1.5">{typograph(label)}</p>
      <div className="text-base text-text leading-relaxed space-y-2">
        {typeof children === 'string' ? typograph(children) : children}
      </div>
    </div>
  )
}

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function TeaPanel({ countryId, teaId, isFavorite, onToggleFavorite, onClose }) {
  const { t } = useI18n()
  const [tea, setTea] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [tab, setTab] = useState('overview')
  const panelRef = useRef(null)
  const closeButtonRef = useRef(null)

  const TABS = [
    { id: 'overview', label: t('tabOverview') },
    { id: 'history', label: t('tabHistory') },
  ]

  const loadData = useCallback(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setTab('overview')

    Promise.all([getTeaDetail(countryId, teaId), getCategories()])
      .then(([detail, cats]) => {
        if (cancelled) return
        setTea(detail)
        setCategories(cats)
        setLoading(false)
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e.message || 'Ошибка загрузки карточки сорта')
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [countryId, teaId])

  useEffect(() => {
    const cleanup = loadData()
    return cleanup
  }, [loadData])

  // Удержание фокуса внутри модального окна и закрытие по Esc (Правила Д2, Д3)
  useEffect(() => {
    const previousFocus = document.activeElement
    closeButtonRef.current?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const focusables = panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [onClose])

  const categoryLabel = categories.find((c) => c.id === tea?.category)?.name
  const color = tea ? categoryColor(tea.category) : '#059669'

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={tea?.name || t('loadingCard')}
      className={[
        'tea-detail fixed z-40 bg-surface text-text shadow-panel animate-panel-in overflow-hidden border border-border',
        'inset-x-0 bottom-0 h-[84svh] rounded-t-3xl',
        'md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-[460px] md:rounded-none md:rounded-l-3xl md:border-y-0 md:border-r-0 md:border-l',
      ].join(' ')}
    >
      <div className="absolute inset-0 flex flex-col overflow-y-auto overscroll-contain scrollbar-thin">
        {/* Панель верхних кнопок управления */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {tea && (
            <button
              type="button"
              onClick={onToggleFavorite}
              aria-label={isFavorite ? t('removeFavorite') : t('addFavorite')}
              aria-pressed={isFavorite}
              className={`grid place-items-center w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-surface hover:bg-surface-2 border border-border shadow-sm transition-all duration-150 ${FOCUS_RING} ${
                isFavorite ? 'text-danger scale-105' : 'text-muted hover:text-text'
              }`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isFavorite ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 21s-6.7-4.3-9.3-8.2C1 10 1.5 6.6 4.1 4.9 6.4 3.4 9.3 4 11 6.1c.4.5.6.7 1 .7s.6-.2 1-.7c1.7-2.1 4.6-2.7 6.9-1.2 2.6 1.7 3.1 5.1 1.4 7.9C18.7 16.7 12 21 12 21Z" />
              </svg>
            </button>
          )}

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t('closeCard')}
            className={`grid place-items-center w-10 h-10 min-w-[44px] min-h-[44px] rounded-full bg-surface hover:bg-surface-2 text-text border border-border shadow-sm transition-colors ${FOCUS_RING}`}
          >
            <TeaIcon name="close" />
          </button>
        </div>

        {/* Загрузка карточки (У1) */}
        {loading && (
          <div className="p-8 flex-1 flex flex-col justify-center">
            <LoadingSkeleton count={6} />
          </div>
        )}

        {/* Ошибка загрузки (У1, У4) */}
        {!loading && error && (
          <div className="p-8 flex-1 flex flex-col justify-center">
            <ErrorState
              title={error}
              description="Не удалось загрузить подробные сведения о данном чае."
              onRetry={loadData}
              retryLabel="Попробовать снова"
            />
          </div>
        )}

        {/* Содержимое карточки чая */}
        {!loading && tea && (
          <>
            <div
              className="px-6 pt-20 pb-5 shrink-0 border-b border-border relative overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${color}20, transparent)`,
              }}
            >
              <div className="flex items-center gap-2 mb-2.5">
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full font-semibold border border-border"
                  style={{
                    backgroundColor: `${color}25`,
                    color: 'var(--text)',
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {categoryLabel}
                </span>
              </div>

              <h2 className="font-display text-2xl sm:text-3xl text-text font-semibold leading-tight">
                {typograph(tea.name)}
              </h2>

              {tea.aliases?.length > 0 && (
                <p className="text-base text-muted mt-1 leading-relaxed">
                  {tea.aliases.map(typograph).join(' · ')}
                </p>
              )}

              <p className="text-base text-muted mt-2 flex items-center gap-1.5">
                <TeaIcon name="location" className="shrink-0" />
                <span>
                  {[tea.location?.region, tea.location?.province].filter(Boolean).map(typograph).join(', ')}
                  {tea.location?.altitude ? ` · ${tea.location.altitude}` : ''}
                </span>
              </p>

              {tea.description?.short && (
                <p className="mt-3 text-base text-text leading-relaxed italic bg-surface-2 p-3 rounded-xl border border-border">
                  {typograph(tea.description.short)}
                </p>
              )}
            </div>

            {/* Вкладки переключения: Обзор / История */}
            <div className="flex gap-2 px-6 border-b border-border shrink-0 bg-surface">
              {TABS.map((tabItem) => (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => setTab(tabItem.id)}
                  aria-pressed={tab === tabItem.id}
                  className={[
                    'px-4 py-3 min-h-[44px] text-base font-semibold border-b-2 -mb-px transition-colors cursor-pointer',
                    FOCUS_RING,
                    tab === tabItem.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted hover:text-text',
                  ].join(' ')}
                >
                  {typograph(tabItem.label)}
                </button>
              ))}
            </div>

            {/* Прокручиваемое содержимое */}
            <div className="shrink-0">
              <div className="px-6 py-5 flex flex-col gap-4">
                {tab === 'overview' && (
                  <>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3.5 bg-surface-2 rounded-2xl p-4 border border-border">
                      <Field label={t('cultivar')} value={tea.characteristics?.cultivar} />
                      <Field label={t('oxidation')} value={tea.characteristics?.oxidation} />
                      <Field label={t('roast')} value={tea.characteristics?.roast} />
                      <Field label={t('harvest')} value={tea.characteristics?.harvestSeason} />
                      <Field label={t('water')} value={tea.characteristics?.waterTemperature} />
                      <Field label={t('steeps')} value={tea.characteristics?.steeps} />
                      <Field label={t('leafWeight')} value={tea.characteristics?.leafWeight} />
                      <Field label={t('teaware')} value={tea.characteristics?.teaware} />
                    </div>

                    <Section label={t('about')}>{tea.description?.overview}</Section>
                    <Section label={t('dryLeaf')}>{tea.description?.leaf}</Section>
                    <Section label={t('liquor')}>{tea.description?.liquor}</Section>
                    <Section label={t('aroma')}>{tea.description?.aroma}</Section>
                    <Section label={t('taste')}>{tea.description?.taste}</Section>
                    <Section label={t('aftertaste')}>{tea.description?.aftertaste}</Section>
                    <Section label={t('processing')}>{tea.description?.processing}</Section>
                  </>
                )}

                {tab === 'history' && (
                  <>
                    <Section label={t('origin')}>{tea.history?.origin}</Section>
                    <Section label={t('history')}>{tea.history?.development}</Section>
                    <Section label={t('modernDay')}>{tea.history?.modern}</Section>
                    {tea.history?.interestingFacts?.length > 0 && (
                      <div className="border-t border-border pt-3.5">
                        <p className="text-sm font-medium text-muted mb-2">
                          {typograph(t('facts'))}
                        </p>
                        <ul className="flex flex-col gap-2">
                          {tea.history.interestingFacts.map((fact, i) => (
                            <li key={i} className="text-base text-text leading-relaxed flex items-start gap-2.5">
                              <span className="text-accent-text font-bold text-base leading-none">·</span>
                              <span>{typograph(fact)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!tea.history?.origin && !tea.history?.development && !tea.history?.modern && (
                      <p className="text-base text-muted">{typograph(t('noHistory'))}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
