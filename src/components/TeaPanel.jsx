import { useEffect, useRef, useState } from 'react'
import { getTeaDetail, getCategories } from '../lib/api'
import { categoryColor } from '../lib/categoryStyle'
import { useI18n } from '../lib/i18n'

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold'

function Field({ label, value }) {
  if (!value) return null
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft/60">{label}</p>
      <p className="text-[13px] text-ink/85 leading-snug mt-0.5">{value}</p>
    </div>
  )
}

function Section({ label, children }) {
  if (!children) return null
  return (
    <div className="border-t border-ink/10 pt-3">
      <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft/60 mb-1">{label}</p>
      <p className="text-[13.5px] text-ink/85 leading-relaxed">{children}</p>
    </div>
  )
}

const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function TeaPanel({ countryId, teaId, onClose }) {
  const { t } = useI18n()
  const [tea, setTea] = useState(null)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [tab, setTab] = useState('overview')
  const panelRef = useRef(null)
  const closeButtonRef = useRef(null)

  const TABS = [
    { id: 'overview', label: t('tabOverview') },
    { id: 'history', label: t('tabHistory') },
  ]

  useEffect(() => {
    let cancelled = false
    setTea(null)
    setError(null)
    setTab('overview')
    Promise.all([getTeaDetail(countryId, teaId), getCategories()])
      .then(([detail, cats]) => {
        if (cancelled) return
        setTea(detail)
        setCategories(cats)
      })
      .catch((e) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [countryId, teaId])

  // Переносим фокус внутрь панели при открытии (стандартное поведение
  // диалогового окна) и удерживаем Tab внутри неё, пока она открыта, чтобы
  // пользователь с клавиатуры не улетал незаметно в карту/сайдбар позади.
  // Esc закрывает в любом случае.
  useEffect(() => {
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
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const categoryLabel = categories.find((c) => c.id === tea?.category)?.name
  const color = tea ? categoryColor(tea.category) : '#8A8372'

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={tea?.name || t('loadingCard')}
      className={[
        'fixed z-30 bg-porcelain shadow-panel animate-panel-in overflow-hidden',
        'inset-x-0 bottom-0 h-[82vh] rounded-t-3xl',
        'md:inset-y-0 md:right-0 md:left-auto md:h-auto md:w-[440px] md:rounded-none md:rounded-l-3xl',
      ].join(' ')}
    >
      {/* Hard-pinned to the parent's actual box via inset-0, rather than
          relying on the fixed-position parent's own flex sizing — this is
          what makes the scroll area below reliably bounded. */}
      <div className="absolute inset-0 flex flex-col">
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={t('closeCard')}
          className={`absolute top-3 right-3 z-10 grid place-items-center w-8 h-8 rounded-full bg-ink/80 text-porcelain hover:bg-ink transition-colors ${FOCUS_RING}`}
        >
          ✕
        </button>

        {!tea && !error && <div className="p-8 text-center text-ink-soft/60 text-sm">{t('loadingCard')}</div>}
        {error && <div className="p-8 text-center text-red-800 text-sm">{error}</div>}

        {tea && (
          <>
            <div
              className="px-6 pt-7 pb-4 shrink-0"
              style={{ background: `linear-gradient(180deg, ${color}33, transparent)` }}
            >
              <span
                className="inline-block text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full mb-2"
                style={{ backgroundColor: `${color}30`, color: '#1C2A22' }}
              >
                {categoryLabel}
              </span>
              <h2 className="font-display text-3xl text-ink leading-tight">{tea.name}</h2>
              {tea.aliases?.length > 0 && (
                <p className="text-[12.5px] text-ink-soft/70 mt-1">{tea.aliases.join(' · ')}</p>
              )}
              <p className="text-[13px] text-ink/70 mt-2">
                {[tea.location?.region, tea.location?.province].filter(Boolean).join(', ')}
                {tea.location?.altitude ? ` · ${tea.location.altitude}` : ''}
              </p>
              {tea.description?.short && (
                <p className="mt-3 text-[14px] text-ink/90 leading-relaxed italic">«{tea.description.short}»</p>
              )}
            </div>

            <div className="flex gap-1 px-6 border-b border-ink/10 shrink-0">
              {TABS.map((tabItem) => (
                <button
                  key={tabItem.id}
                  type="button"
                  onClick={() => setTab(tabItem.id)}
                  className={[
                    'px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors',
                    FOCUS_RING,
                    tab === tabItem.id ? 'border-gold text-ink' : 'border-transparent text-ink-soft/60 hover:text-ink',
                  ].join(' ')}
                >
                  {tabItem.label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto overscroll-contain scrollbar-thin flex-1 min-h-0">
              <div className="px-6 py-5 flex flex-col gap-4">
                {tab === 'overview' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 bg-ink/[0.03] rounded-xl p-3.5">
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
                      <div className="border-t border-ink/10 pt-3">
                        <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft/60 mb-1.5">
                          {t('facts')}
                        </p>
                        <ul className="flex flex-col gap-1.5">
                          {tea.history.interestingFacts.map((fact, i) => (
                            <li key={i} className="text-[13px] text-ink/85 leading-snug flex gap-2">
                              <span className="text-gold">·</span>
                              <span>{fact}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {!tea.history?.origin && !tea.history?.development && !tea.history?.modern && (
                      <p className="text-[13px] text-ink-soft/60">{t('noHistory')}</p>
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
