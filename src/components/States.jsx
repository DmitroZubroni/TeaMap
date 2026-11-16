import React from 'react'
import { typograph } from '../lib/typograph'

export function EmptyState({
  title = 'Сортов не найдено',
  description = 'В этом регионе или категории пока нет описанных сортов чая. Попробуйте сбросить фильтры.',
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
      className={`flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-dashed border-ink/15 bg-porcelain/30 ${className}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-jade/10 border border-jade/30 flex items-center justify-center text-jade mb-3 shadow-sm">
        {icon || <span className="text-xl">🍃</span>}
      </div>
      <h3 className="font-display font-semibold text-ink text-sm sm:text-base">
        {typograph(title)}
      </h3>
      <p className="text-[12px] text-ink-soft/70 mt-1 max-w-xs leading-relaxed">
        {typograph(description)}
      </p>

      {(actionLabel || secondaryLabel) && (
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="px-3.5 py-1.5 rounded-xl font-medium text-xs text-porcelain bg-ink hover:bg-ink-soft transition-colors cursor-pointer"
            >
              {typograph(actionLabel)}
            </button>
          )}
          {secondaryLabel && onSecondary && (
            <button
              onClick={onSecondary}
              className="px-3.5 py-1.5 rounded-xl font-medium text-xs text-ink bg-porcelain border border-ink/15 hover:bg-porcelain-dim transition-colors cursor-pointer"
            >
              {typograph(secondaryLabel)}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function LoadingSkeleton({ count = 3, className = '' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={`space-y-2 ${className}`}
    >
      <span className="sr-only">Загрузка данных чайного атласа...</span>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="animate-pulse rounded-xl border border-ink/5 bg-ink/5 p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5 flex-1">
            <div className="w-5 h-5 rounded-full bg-ink/10" />
            <div className="space-y-1.5 flex-1">
              <div className="h-3 w-1/3 rounded bg-ink/15" />
              <div className="h-2 w-1/2 rounded bg-ink/10" />
            </div>
          </div>
          <div className="w-3 h-3 rounded-full bg-ink/10" />
        </div>
      ))}
    </div>
  )
}

export function ErrorState({
  title = 'Ошибка загрузки чайных данных',
  description = 'Не удалось получить информацию о регионах или сортах с сервера.',
  onRetry,
  retryLabel = 'Повторить попытку',
  className = '',
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-liquor-red/30 bg-liquor-red/10 ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-liquor-red/20 border border-liquor-red/40 flex items-center justify-center text-liquor-red mb-2.5">
        <span className="text-base">⚠️</span>
      </div>
      <h3 className="font-display font-semibold text-ink text-sm">
        {typograph(title)}
      </h3>
      <p className="text-[12px] text-ink-soft/70 mt-1 max-w-xs leading-relaxed">
        {typograph(description)}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-3.5 py-1.5 rounded-xl text-xs font-medium text-porcelain bg-liquor-red hover:brightness-110 transition-all cursor-pointer"
        >
          {typograph(retryLabel)}
        </button>
      )}
    </div>
  )
}

export function SuccessState({
  title = 'Сохранено',
  description = 'Сорт успешно добавлен в вашу коллекцию избранного.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-jade/30 bg-jade/10 ${className}`}
    >
      <div className="w-10 h-10 rounded-xl bg-jade/20 border border-jade/40 flex items-center justify-center text-jade mb-2.5">
        <span className="text-base">✓</span>
      </div>
      <h3 className="font-display font-semibold text-ink text-sm">
        {typograph(title)}
      </h3>
      <p className="text-[12px] text-ink-soft/70 mt-1 max-w-xs leading-relaxed">
        {typograph(description)}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-3 px-3.5 py-1.5 rounded-xl text-xs font-medium text-porcelain bg-jade hover:bg-jade/90 transition-colors cursor-pointer"
        >
          {typograph(actionLabel)}
        </button>
      )}
    </div>
  )
}
