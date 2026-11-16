import React from 'react'
import { typograph } from '../lib/typograph'

export default function Toast({ message }) {
  if (!message) return null
  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute top-5 left-1/2 -translate-x-1/2 z-40 animate-panel-in pointer-events-none"
    >
      <div className="flex items-center gap-2 bg-surface text-text text-[13px] font-medium px-4 py-2.5 rounded-full shadow-panel border border-border backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
        <span>{typograph(message)}</span>
      </div>
    </div>
  )
}
