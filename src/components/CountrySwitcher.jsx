export default function CountrySwitcher({ countries, current, onPick }) {
  const active = countries.filter((c) => c.teaCount > 0)
  if (active.length === 0) return null

  return (
    <div className="absolute top-5 right-5 z-10 flex flex-col items-end gap-1.5">
      <p className="font-mono text-[10px] uppercase tracking-widest text-porcelain/50 pr-1">
        страны с данными
      </p>
      <div className="flex flex-col gap-1.5 items-end">
        {active.map((c) => {
          const isCurrent = current?.id === c.id
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c.id)}
              className={[
                'flex items-center gap-2 rounded-full pl-2 pr-3.5 py-1.5 shadow-panel border transition-colors',
                'text-[13px] font-medium whitespace-nowrap',
                isCurrent
                  ? 'bg-gold text-ink border-gold'
                  : 'bg-porcelain/90 text-ink border-ink/10 hover:bg-porcelain',
              ].join(' ')}
            >
              <span className="grid place-items-center w-5 h-5 rounded-full bg-ink/5 text-[13px]">{c.icon}</span>
              <span>{c.name}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
