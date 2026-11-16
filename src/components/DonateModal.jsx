import { useEffect, useRef } from 'react'
import { useI18n } from '../lib/i18n'
import { typograph } from '../lib/typograph'

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function PialaIcon({ className = 'w-5 h-5', ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Струйки чайного пара над пиалой */}
      <path d="M8 3.5c0 1.5 1 2.2 1 3.5" opacity="0.65" />
      <path d="M12 2c0 2 1.2 2.8 1.2 5" opacity="0.85" />
      <path d="M16 3.5c0 1.5 1 2.2 1 3.5" opacity="0.65" />

      {/* Корпус пиалы */}
      <path d="M3 10c0 5.2 4.2 9 9 9s9-3.8 9-9H3z" fill="currentColor" fillOpacity="0.12" />

      {/* Ободок и ножка пиалы */}
      <path d="M2.5 10h19" />
      <path d="M8.5 19h7v2h-7z" fill="currentColor" fillOpacity="0.2" />
    </svg>
  )
}

export default function DonateModal({ onClose }) {
  const { t } = useI18n()
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)

  // Д3: модальные окна держат фокус внутри себя (Tab не должен уводить
  // пользователя за пределы модалки) и закрываются по Esc. Esc уже был —
  // довершаем удержанием фокуса и переносом фокуса на крестик при открытии,
  // как уже сделано в TeaPanel.
  useEffect(() => {
    closeButtonRef.current?.focus()

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key !== 'Tab' || !dialogRef.current) return
      const focusables = dialogRef.current.querySelectorAll(FOCUSABLE_SELECTOR)
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-bg/75 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="donate-modal-title"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-md rounded-3xl bg-surface border border-border p-6 shadow-panel my-auto animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Верхняя панель: бейдж и крестик закрытия */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent-soft text-accent-text font-mono text-[11px] uppercase tracking-wider">
            <PialaIcon className="w-3.5 h-3.5 text-accent-text" />
            <span>{typograph(t('donateBadge'))}</span>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className={`grid place-items-center w-10 h-10 rounded-xl text-muted hover:text-text hover:bg-surface-2 transition-colors ${FOCUS_RING}`}
          >
            ✕
          </button>
        </div>

        {/* Заголовок и описание */}
        <div className="mb-6">
          <h2 id="donate-modal-title" className="font-display text-xl sm:text-2xl text-text leading-tight mb-2">
            {typograph(t('donateTitle'))}
          </h2>
          <p className="text-[13.5px] leading-relaxed text-muted">
            {typograph(t('donateDesc'))}
          </p>
        </div>

        {/* Основная кнопка пожертвования через CloudTips */}
        <a
          href="https://pay.cloudtips.ru/p/42656f86"
          target="_blank"
          rel="noopener noreferrer"
          className={`group flex items-center justify-between gap-3 p-4 rounded-2xl bg-surface-2/60 border border-border hover:border-accent hover:bg-accent-soft/40 text-text transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 ${FOCUS_RING}`}
        >
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="grid place-items-center w-11 h-11 rounded-xl bg-accent-soft text-accent-text shrink-0 group-hover:scale-105 transition-transform">
              <PialaIcon className="w-6 h-6 text-accent-text" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-semibold text-[14px] text-text leading-snug truncate">
                {typograph(t('donateCtaLabel'))}
              </span>
              <span className="font-mono text-[10.5px] text-muted mt-0.5 truncate">
                {typograph(t('donateCtaSub'))}
              </span>
            </div>
          </div>
          <span className="text-accent-text text-xl shrink-0 transition-transform group-hover:translate-x-1">
            →
          </span>
        </a>

        {/* Заметка о безопасности */}
        <div className="flex items-center gap-2 mt-4 px-1 text-[11px] font-mono text-muted">
          <svg
            className="w-3.5 h-3.5 text-primary shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>{typograph(t('donateSecure'))}</span>
        </div>

        {/* Telegram контакт автора */}
        <div className="mt-4 p-3 rounded-2xl bg-surface-2/50 border border-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid place-items-center w-9 h-9 rounded-xl bg-primary-soft text-primary shrink-0">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-mono text-muted uppercase tracking-wider">
                {typograph(t('donateTelegramContact'))}
              </span>
              <a
                href="https://t.me/DmitroZybroni"
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[13px] font-semibold text-text hover:text-primary transition-colors truncate ${FOCUS_RING}`}
              >
                @DmitroZybroni
              </a>
            </div>
          </div>
          <a
            href="https://t.me/DmitroZybroni"
            target="_blank"
            rel="noopener noreferrer"
            className={`px-3 py-2 min-h-[44px] flex items-center rounded-xl bg-primary-soft hover:bg-primary/20 text-primary text-[12px] font-medium transition-colors shrink-0 ${FOCUS_RING}`}
          >
            Telegram ↗
          </a>
        </div>

        {/* Подвал модалки */}
        <div className="mt-5 pt-3 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 min-h-[44px] rounded-xl text-[13px] font-medium text-muted hover:text-text hover:bg-surface-2 transition-colors ${FOCUS_RING}`}
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  )
}
