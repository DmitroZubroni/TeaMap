import { categoryColor } from '../lib/categoryStyle'

// We tried auto-fetching a real photo from Wikimedia Commons twice — first
// searching by the specific tea's name (returned unrelated crops/press
// clippings — most single-origin teas have no dedicated coverage at all),
// then by category ("dry oolong tea leaves" etc., meant to be more
// reliable) — but that still occasionally surfaced wrong or broken results
// (e.g. a scanned historical document matching on an incidental keyword).
// A confidently-wrong image is worse than no photo, so this is a generated,
// deterministic, leaf-themed illustration colored by category instead —
// consistent and honest about being illustrative rather than a real photo.
export default function TeaImage({ tea }) {
  const color = categoryColor(tea.category)
  const seed = tea.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
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
      <span className="absolute bottom-2 right-3 font-display text-xs italic text-ink/40">{tea.name}</span>
    </div>
  )
}
