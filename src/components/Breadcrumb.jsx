export default function Breadcrumb({ nav, onHome }) {
  const crumbs = ['Мир']
  if (nav.country) crumbs.push(nav.country.name)
  if (nav.region) crumbs.push(nav.region)

  return (
    <div className="absolute top-5 left-5 z-10 flex flex-col gap-2 max-w-[calc(100vw-2.5rem)]">
      <div className="bg-porcelain/90 backdrop-blur-sm border border-ink/10 rounded-2xl px-4 py-2.5 shadow-panel">
        <p className="font-display text-lg text-ink leading-none">茶 · Атлас чая</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/60 mt-1">
          карта чайных регионов мира
        </p>
      </div>
      <div className="flex items-center gap-1.5 bg-ink/90 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-panel w-fit">
        {crumbs.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-porcelain/30 text-xs">/</span>}
            <button
              type="button"
              onClick={i === 0 ? onHome : undefined}
              className={`text-[12px] font-medium whitespace-nowrap ${
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
    </div>
  )
}
