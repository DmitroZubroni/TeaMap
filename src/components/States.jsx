import React from 'react'
import { typograph } from '../lib/typograph'

const FOCUS_RING = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

/**
 * 1. EmptyState — Пустое состояние (Правило У1)
 * Объясняет, что это за экран, почему он пуст, и предлагает конкретное действие.
 */
export function EmptyState({
  title = 'Сортов не найдено',
  description = 'В этом регионе или по выбранным фильтрам пока нет сортов чая. Попробуйте сбросить фильтры или выбрать другой регион.',
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  icon,
  className = '',
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-dashed border-border bg-surface-2/40 backdrop-blur-sm ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary-soft border border-primary/25 flex items-center justify-center text-primary mb-3.5 shadow-sm">
        {icon || (
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 2a10 10 0 0 0-7.07 17.07L12 22l7.07-2.93A10 10 0 0 0 12 2z" opacity="0.2" fill="currentColor" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" />
            <path d="M9 9h.01M15 9h.01" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M12 4v4m0 0l-2-2m2 2l2-2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      <h3 className="font-display font-semibold text-text text-base leading-snug">
        {typograph(title)}
      </h3>

      <p className="text-[13px] text-muted mt-1.5 max-w-xs leading-relaxed">
        {typograph(description)}
      </p>

      {(actionLabel || secondaryLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className={`px-4 py-2.5 min-h-[44px] rounded-xl font-medium text-xs text-on-primary bg-primary hover:bg-primary-hover transition-colors shadow-sm cursor-pointer ${FOCUS_RING}`}
            >
              {typograph(actionLabel)}
            </button>
          )}
          {secondaryLabel && onSecondary && (
            <button
              type="button"
              onClick={onSecondary}
              className={`px-4 py-2.5 min-h-[44px] rounded-xl font-medium text-xs text-text bg-surface border border-border hover:bg-surface-2 transition-colors cursor-pointer ${FOCUS_RING}`}
            >
              {typograph(secondaryLabel)}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * 2. LoadingSkeleton — Состояние загрузки (Правило У1)
 * Повторяет форму будущего контента без прыжков макета (CLS = 0).
 */
export function LoadingSkeleton({ count = 3, className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`space-y-2.5 ${className}`}
    >
      <span className="sr-only">Загрузка данных чайного атласа…</span>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-xl border border-border/60 bg-surface-2/60 p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 flex-1">
            <div className="w-6 h-6 rounded-full bg-border/70 shrink-0" />
            <div className="space-y-1.5 flex-1">
              <div
                className="h-3.5 rounded bg-border/80"
                style={{ width: `${55 + ((idx * 19) % 35)}%` }}
              />
              <div
                className="h-2.5 rounded bg-border/50"
                style={{ width: `${35 + ((idx * 23) % 40)}%` }}
              />
            </div>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-border/60 shrink-0" />
        </div>
      ))}
    </div>
  )
}

/**
 * 3. ErrorState — Состояние ошибки (Правило У1, У4)
 * Человеческим языком: что случилось, почему и кнопка «Повторить».
 */
export function ErrorState({
  title = 'Не удалось загрузить данные',
  description = 'Проверьте соединение с интернетом и попробуйте обновить список сортов чая.',
  onRetry,
  retryLabel = 'Повторить попытку',
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-danger/30 bg-danger-soft/60 backdrop-blur-sm ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-danger/15 border border-danger/30 flex items-center justify-center text-danger text-2xl font-bold mb-3.5 shadow-sm">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h3 className="font-display font-semibold text-text text-base leading-snug">
        {typograph(title)}
      </h3>

      <p className="text-[13px] text-muted mt-1.5 max-w-xs leading-relaxed">
        {typograph(description)}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className={`mt-4 px-4 py-2.5 min-h-[44px] rounded-xl font-medium text-xs text-on-danger bg-danger hover:brightness-110 transition-all shadow-sm cursor-pointer ${FOCUS_RING}`}
        >
          {typograph(retryLabel)}
        </button>
      )}
    </div>
  )
}

/**
 * 4. SuccessState — Состояние успеха (Правило У1)
 * Подтверждение действия и следующий понятный шаг.
 */
export function SuccessState({
  title = 'Действие выполнено',
  description = 'Сорт чая успешно добавлен в вашу личную коллекцию.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-success/30 bg-success-soft/60 backdrop-blur-sm ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-success/15 border border-success/30 flex items-center justify-center text-success mb-3.5 shadow-sm">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17L4 12" />
        </svg>
      </div>

      <h3 className="font-display font-semibold text-text text-base leading-snug">
        {typograph(title)}
      </h3>

      <p className="text-[13px] text-muted mt-1.5 max-w-xs leading-relaxed">
        {typograph(description)}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={`mt-4 px-4 py-2.5 min-h-[44px] rounded-xl font-medium text-xs text-on-primary bg-primary hover:bg-primary-hover transition-colors shadow-sm cursor-pointer ${FOCUS_RING}`}
        >
          {typograph(actionLabel)}
        </button>
      )}
    </div>
  )
}

/**
 * Демо-инспектор 4-х состояний экрана (для тестирования и ревью)
 */
export function StatesDemoViewer({ onClose }) {
  const [activeTab, setActiveTab] = React.useState('empty')

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Демо 4 состояний экрана"
      className="fixed inset-0 z-50 grid place-items-center bg-bg/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl bg-surface border border-border p-6 shadow-panel my-auto animate-modal-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-soft text-primary font-mono text-[11px] uppercase tracking-wider">
            <span>У1 · 4 состояния</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Закрыть"
            className={`w-8 h-8 rounded-lg grid place-items-center text-muted hover:text-text hover:bg-surface-2 transition-colors ${FOCUS_RING}`}
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1 p-1 bg-surface-2 rounded-xl mb-4">
          {[
            { id: 'empty', label: 'Пусто' },
            { id: 'loading', label: 'Загрузка' },
            { id: 'error', label: 'Ошибка' },
            { id: 'success', label: 'Успех' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === tab.id ? 'bg-surface text-text shadow-sm' : 'text-muted hover:text-text'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="min-h-[220px] flex items-center justify-center">
          {activeTab === 'empty' && (
            <EmptyState
              title="Коллекция пуста"
              description="Вы ещё не сохранили ни одного сорта чая. Добавляйте чаи из справочника или карты."
              actionLabel="Открыть справочник"
              onAction={onClose}
            />
          )}
          {activeTab === 'loading' && <LoadingSkeleton count={4} className="w-full" />}
          {activeTab === 'error' && (
            <ErrorState
              title="Сервер чайных данных недоступен"
              description="Не удалось загрузить координаты плантаций. Проверьте соединение."
              retryLabel="Повторить запрос"
              onRetry={() => alert('Повтор запроса выполнен')}
            />
          )}
          {activeTab === 'success' && (
            <SuccessState
              title="Сорт Да Хун Пао сохранён"
              description="Утесный улун из гор Уишань успешно добавлен в избранное."
              actionLabel="Посмотреть на карте"
              onAction={onClose}
            />
          )}
        </div>
      </div>
    </div>
  )
}
