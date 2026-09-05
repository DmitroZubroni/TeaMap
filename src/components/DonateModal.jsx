import { useEffect } from 'react'
import { useI18n } from '../lib/i18n'

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

      {/* Корпус пиалы (без ручки, с плавным скруглением) */}
      <path d="M3 10c0 5.2 4.2 9 9 9s9-3.8 9-9H3z" fill="currentColor" fillOpacity="0.12" />

      {/* Ободок и подставка (ножка) пиалы */}
      <path d="M2.5 10h19" />
      <path d="M8.5 19h7v2h-7z" fill="currentColor" fillOpacity="0.2" />
    </svg>
  )
}

export default function DonateModal({ onClose }) {
  const { t } = useI18n()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/65 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-porcelain border border-ink/15 p-6 shadow-panel my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Верхняя панель: бейдж и крестик закрытия */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/15 border border-gold/30 text-gold font-mono text-[11px] uppercase tracking-wider">
            <PialaIcon className="w-3.5 h-3.5 text-gold" />
            <span>{t('donateBadge')}</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={t('close')}
            className="grid place-items-center w-8 h-8 rounded-lg text-ink/40 hover:text-ink hover:bg-ink/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            ✕
          </button>
        </div>

        {/* Заголовок и описание */}
        <div className="mb-6">
          <h2 className="font-display text-xl sm:text-2xl text-ink leading-tight mb-2.5">
            {t('donateTitle')}
          </h2>
          <p className="text-[13.5px] leading-relaxed text-ink/75">
            {t('donateDesc')}
          </p>
        </div>

        {/* Основная кнопка пожертвования через CloudTips */}
        <a
          href="https://pay.cloudtips.ru/p/42656f86"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-gold/15 via-gold/10 to-transparent border border-gold/40 hover:border-gold hover:from-gold/25 hover:to-gold/10 text-ink transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid place-items-center w-10 h-10 rounded-xl bg-gold/20 text-gold shrink-0 group-hover:scale-105 transition-transform">
              <PialaIcon className="w-5 h-5 text-gold" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-medium text-[14px] text-ink leading-snug truncate">
                {t('donateCtaLabel')}
              </span>
              <span className="font-mono text-[10.5px] text-ink-soft/60 mt-0.5 truncate">
                {t('donateCtaSub')}
              </span>
            </div>
          </div>
          <span className="text-gold text-lg shrink-0 transition-transform group-hover:translate-x-1">
            →
          </span>
        </a>

        {/* Заметка о безопасности */}
        <div className="flex items-center gap-2 mt-4 px-1 text-[11px] font-mono text-ink-soft/60">
          <svg
            className="w-3.5 h-3.5 text-jade shrink-0"
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
          <span>{t('donateSecure')}</span>
        </div>

        {/* Telegram контакт автора */}
        <div className="mt-4 p-3 rounded-xl bg-ink/[0.03] border border-ink/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="grid place-items-center w-8 h-8 rounded-lg bg-[#229ED9]/15 text-[#229ED9] shrink-0">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-mono text-ink-soft/60 uppercase tracking-wide">
                {t('donateTelegramContact')}
              </span>
              <a
                href="https://t.me/DmitroZybroni"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] font-medium text-ink hover:text-gold transition-colors truncate"
              >
                @DmitroZybroni
              </a>
            </div>
          </div>
          <a
            href="https://t.me/DmitroZybroni"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] text-[12px] font-medium transition-colors shrink-0"
          >
            Telegram ↗
          </a>
        </div>

        {/* Подвал модалки */}
        <div className="mt-5 pt-3 border-t border-ink/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-[13px] text-ink-soft/70 hover:text-ink hover:bg-ink/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  )
}
