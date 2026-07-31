import { useEffect, useState } from 'react'
import { getTeaDetail, getCategories } from '../lib/api'
import { categoryColor } from '../lib/categoryStyle'
import TeaImage from './TeaImage'

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

const TABS = [
  { id: 'overview', label: 'Обзор' },
  { id: 'history', label: 'История' },
]

export default function TeaPanel({ countryId, teaId, onClose }) {
  const [tea, setTea] = useState(null)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    let cancelled = false
    setTea(null)
    setError(null)
    setTab('overview')
    console.info('[tea-atlas] TeaPanel: загружаю', { countryId, teaId })
    Promise.all([getTeaDetail(countryId, teaId), getCategories()])
      .then(([detail, cats]) => {
        if (cancelled) return
        console.info('[tea-atlas] TeaPanel: карточка загружена', detail?.name)
        setTea(detail)
        setCategories(cats)
      })
      .catch((e) => {
        console.error('[tea-atlas] TeaPanel: ошибка загрузки', e)
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [countryId, teaId])

  const categoryLabel = categories.find((c) => c.id === tea?.category)?.name
  const color = tea ? categoryColor(tea.category) : '#8A8372'

  return (
    <div
      className={[
        'fixed z-30 bg-porcelain shadow-panel animate-panel-in overflow-hidden',
        'inset-x-0 bottom-0 max-h-[82vh] rounded-t-3xl',
        'md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:max-h-none md:w-[440px] md:rounded-none md:rounded-l-3xl',
      ].join(' ')}
    >
      {/* Hard-pinned to the parent's actual box via inset-0, rather than
          relying on the fixed-position parent's own flex sizing — this is
          what makes the scroll area below reliably bounded. */}
      <div className="absolute inset-0 flex flex-col">
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть карточку"
          className="absolute top-3 right-3 z-10 grid place-items-center w-8 h-8 rounded-full bg-ink/80 text-porcelain hover:bg-ink transition-colors"
        >
          ✕
        </button>

        {!tea && !error && <div className="p-8 text-center text-ink-soft/60 text-sm">Загружаю карточку…</div>}
        {error && <div className="p-8 text-center text-red-800 text-sm">{error}</div>}

        {tea && (
          <>
            <TeaImage tea={tea} />
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
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={[
                    'px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors',
                    tab === t.id ? 'border-gold text-ink' : 'border-transparent text-ink-soft/60 hover:text-ink',
                  ].join(' ')}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto overscroll-contain scrollbar-thin flex-1 min-h-0">
              <div className="px-6 py-5 flex flex-col gap-4">
                {tab === 'overview' && (
                  <>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 bg-ink/[0.03] rounded-xl p-3.5">
                      <Field label="Культивар" value={tea.characteristics?.cultivar} />
                      <Field label="Ферментация" value={tea.characteristics?.oxidation} />
                      <Field label="Прожарка" value={tea.characteristics?.roast} />
                      <Field label="Сбор" value={tea.characteristics?.harvestSeason} />
                      <Field label="Вода" value={tea.characteristics?.waterTemperature} />
                      <Field label="Проливы" value={tea.characteristics?.steeps} />
                      <Field label="Навеска" value={tea.characteristics?.leafWeight} />
                      <Field label="Посуда" value={tea.characteristics?.teaware} />
                    </div>

                    <Section label="О чае">{tea.description?.overview}</Section>
                    <Section label="Сухой лист">{tea.description?.leaf}</Section>
                    <Section label="Настой">{tea.description?.liquor}</Section>
                    <Section label="Аромат">{tea.description?.aroma}</Section>
                    <Section label="Вкус">{tea.description?.taste}</Section>
                    <Section label="Послевкусие">{tea.description?.aftertaste}</Section>
                    <Section label="Технология">{tea.description?.processing}</Section>
                  </>
                )}

                {tab === 'history' && (
                  <>
                    <Section label="Происхождение">{tea.history?.origin}</Section>
                    <Section label="История">{tea.history?.development}</Section>
                    <Section label="Сегодня">{tea.history?.modern}</Section>
                    {tea.history?.interestingFacts?.length > 0 && (
                      <div className="border-t border-ink/10 pt-3">
                        <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft/60 mb-1.5">
                          Любопытные факты
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
                      <p className="text-[13px] text-ink-soft/60">Историческая справка пока не заполнена.</p>
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
