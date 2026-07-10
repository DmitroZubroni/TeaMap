import { categoryColor } from '../lib/categoryStyle'

export default function Legend({ categories }) {
  if (!categories.length) return null
  return (
    <div className="absolute bottom-5 left-5 z-10 bg-porcelain/90 backdrop-blur-sm border border-ink/10 rounded-2xl px-4 py-3 shadow-panel max-w-[220px]">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft/60 mb-2">
        цвет по настою
      </p>
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
  )
}
