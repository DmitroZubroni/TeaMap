import { useEffect, useState } from 'react'
import { fetchCommonsImage } from '../lib/wikimedia'
import { categoryColor } from '../lib/categoryStyle'

function Placeholder({ color, name }) {
  return (
    <div
      className="w-full h-40 flex items-center justify-center relative overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${color}55, ${color}15)` }}
    >
      <svg viewBox="0 0 200 100" className="absolute inset-0 w-full h-full opacity-40">
        <path d="M0 90 L40 40 L70 65 L110 25 L150 60 L200 35 L200 100 L0 100 Z" fill={color} />
      </svg>
      <span className="relative font-display text-sm italic text-ink/50 px-4 text-center">{name}</span>
    </div>
  )
}

export default function TeaImage({ tea }) {
  const [image, setImage] = useState(undefined) // undefined = loading, null = none found

  useEffect(() => {
    if (!tea) return
    setImage(undefined)
    const query = `${tea.id.replace(/_/g, ' ')} tea China`
    let cancelled = false
    fetchCommonsImage(query).then((result) => {
      if (!cancelled) setImage(result)
    })
    return () => {
      cancelled = true
    }
  }, [tea])

  const color = tea ? categoryColor(tea.category) : '#8A8372'

  if (image === undefined) {
    return <div className="w-full h-40 bg-ink/5 animate-pulse" />
  }

  if (!image) {
    return <Placeholder color={color} name={tea.name} />
  }

  return (
    <figure className="relative">
      <img src={image.url} alt={tea.name} className="w-full h-40 object-cover" loading="lazy" />
      {image.attribution && (
        <figcaption className="absolute bottom-1 right-2 text-[9px] text-white/80 drop-shadow">
          фото: {image.attribution} · Wikimedia Commons
        </figcaption>
      )}
    </figure>
  )
}
