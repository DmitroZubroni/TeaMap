export default function Toast({ message }) {
  if (!message) return null
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 animate-panel-in">
      <div className="bg-ink text-porcelain text-[13px] font-medium px-4 py-2 rounded-full shadow-panel border border-gold/30">
        {message}
      </div>
    </div>
  )
}
