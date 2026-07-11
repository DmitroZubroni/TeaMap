import { useEffect, useState } from 'react'
import { getTeaDetail, getSources, getCategories, getTeaIndex } from '../lib/api'
import { categoryColor } from '../lib/categoryStyle'

function Dots({ value = 0, max = 5 }) {
  return (
    <span className="inline-flex gap-0.5 align-middle">
      {Array.from({ length: max }).map((_, i) => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < value ? 'bg-gold' : 'bg-ink/15'}`} />
      ))}
    </span>
  )
}

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
  { id: 'more', label: 'Похожее' },
]

export default function TeaPanel({ countryId, teaId, onClose, onSelectTea }) {
  const [tea, setTea] = useState(null)
  const [error, setError] = useState(null)
  const [categories, setCategories] = useState([])
  const [sources, setSources] = useState([])
  const [teaIndex, setTeaIndex] = useState([])
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    let cancelled = false
    setTea(null)
    setError(null)
    setTab('overview')
    Promise.all([getTeaDetail(countryId, teaId), getCategories(), getSources(), getTeaIndex(countryId)])
      .then(([detail, cats, srcs, idx]) => {
        if (cancelled) return
        setTea(detail)
        setCategories(cats)
        setSources(srcs)
        setTeaIndex(idx)
      })
      .catch((e) => !cancelled && setError(e.message))
    return () => {
      cancelled = true
    }
  }, [countryId, teaId])

  const categoryLabel = categories.find((c) => c.id === tea?.category)?.name
  const nameById = Object.fromEntries(teaIndex.map((t) => [t.id, t.name]))
  const sourceById = Object.fromEntries(sources.map((s) => [s.id, s]))
  const color = tea ? categoryColor(tea.category) : '#8A8372'

  return (
    <div
      className={[
        'fixed z-30 bg-porcelain shadow-panel flex flex-col animate-panel-in',
        'inset-x-0 bottom-0 max-h-[82vh] rounded-t-3xl',
        'md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:w-[440px] md:max-h-none md:rounded-none md:rounded-l-3xl',
      ].join(' ')}
    >
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

          <div className="overflow-y-auto scrollbar-thin flex-1">
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
                    {tea.characteristics?.rarity != null && (
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft/60">Редкость</p>
                        <div className="mt-1"><Dots value={tea.characteristics.rarity} /></div>
                      </div>
                    )}
                    {tea.characteristics?.difficulty != null && (
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft/60">Сложность</p>
                        <div className="mt-1"><Dots value={tea.characteristics.difficulty} /></div>
                      </div>
                    )}
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

              {tab === 'more' && (
                <>
                  {tea.relatedTeas?.length > 0 && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft/60 mb-1.5">
                        Похожие чаи
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {tea.relatedTeas.map((id) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => onSelectTea(countryId, id)}
                            className="text-[12px] bg-jade/10 text-jade hover:bg-jade/20 transition-colors px-2.5 py-1 rounded-full border border-jade/20"
                          >
                            {nameById[id] || id}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {tea.sources?.length > 0 && (
                    <div className="border-t border-ink/10 pt-3">
                      <p className="font-mono text-[10px] uppercase tracking-wide text-ink-soft/60 mb-1.5">
                        Источники
                      </p>
                      <ul className="flex flex-col gap-1">
                        {tea.sources.map((id) => {
                          const s = sourceById[id]
                          if (!s) return null
                          return (
                            <li key={id}>
                              <a
                                href={s.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[12px] text-gold hover:underline"
                              >
                                {s.name} ↗
                              </a>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}

                  {!tea.relatedTeas?.length && !tea.sources?.length && (
                    <p className="text-[13px] text-ink-soft/60">Пока нечего показать.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
