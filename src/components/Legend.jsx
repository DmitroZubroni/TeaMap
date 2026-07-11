import { useState } from 'react'
import { categoryColor } from '../lib/categoryStyle'

export default function Legend({ categories }) {
  const [open, setOpen] = useState(false)
  if (!categories.length) return null

  return (
    <div className="absolute bottom-5 left-5 z-10">
      {open ? (
        <div className="bg-porcelain/90 backdrop-blur-sm border border-ink/10 rounded-2xl px-4 py-3 shadow-panel max-w-[220px] animate-panel-in">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/60">
              цвет по настою
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Свернуть легенду"
              className="text-ink/50 hover:text-ink transition-colors text-sm leading-none"
            >
              ✕
            </button>
          </div>
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
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Показать легенду цветов"
          className="grid place-items-center w-9 h-9 rounded-full bg-porcelain/90 backdrop-blur-sm border border-ink/10 shadow-panel text-ink hover:bg-porcelain transition-colors"
        >
          <span className="font-display text-sm italic">i</span>
        </button>
      )}
    </div>
  )
}
