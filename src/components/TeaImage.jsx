import { useEffect, useState } from 'react'
import { fetchCommonsImage } from '../lib/wikimedia'
import { categoryColor, categoryImageQuery } from '../lib/categoryStyle'

function Placeholder({ color, name }) {
  const seed = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const leaves = Array.from({ length: 7 }).map((_, i) => {
    const x = 20 + ((seed * (i + 3)) % 160)
    const y = 15 + ((seed * (i + 5)) % 70)
    const rot = (seed * (i + 7)) % 360
    const scale = 0.6 + ((seed * (i + 11)) % 40) / 100
    return { x, y, rot, scale, key: i }
  })
  return (
    <div
      className="w-full h-36 relative overflow-hidden shrink-0"
      style={{ background: `linear-gradient(160deg, ${color}45, ${color}12)` }}
    >
      <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full">
        {leaves.map((leaf) => (
          <path
            key={leaf.key}
            d="M0 4 C 4 -3, 12 -3, 16 4 C 12 8, 4 8, 0 4 Z"
            fill={color}
            opacity="0.55"
            transform={`translate(${leaf.x} ${leaf.y}) rotate(${leaf.rot}) scale(${leaf.scale})`}
          />
        ))}
      </svg>
      <span className="absolute bottom-2 right-3 font-display text-xs italic text-ink/40">{name}</span>
    </div>
  )
}

// Tries a real, category-representative dry-leaf photo from Wikimedia
// Commons first (see categoryImageQuery — deliberately searched by category,
// not by this specific tea's name, since that search is far more reliable).
// Falls back to a generated illustration only if nothing is found, so we
// never show an empty box.
export default function TeaImage({ tea }) {
  const [image, setImage] = useState(undefined) // undefined = loading, null = none found

  useEffect(() => {
    if (!tea) return
    setImage(undefined)
    let cancelled = false
    fetchCommonsImage(categoryImageQuery(tea.category)).then((result) => {
      if (!cancelled) setImage(result)
    })
    return () => {
      cancelled = true
    }
  }, [tea])

  const color = tea ? categoryColor(tea.category) : '#8A8372'

  if (image === undefined) {
    return <div className="w-full h-36 bg-ink/5 animate-pulse shrink-0" />
  }

  if (!image) {
    return <Placeholder color={color} name={tea.name} />
  }

  return (
    <figure className="relative shrink-0">
      <img src={image.url} alt={`${tea.name} — сухой лист`} className="w-full h-36 object-cover" loading="lazy" />
      <figcaption className="absolute bottom-1 right-2 text-[9px] text-white/85 drop-shadow">
        иллюстративное фото категории{image.attribution ? ` · ${image.attribution}` : ''} · Wikimedia Commons
      </figcaption>
    </figure>
  )
}
