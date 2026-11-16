'use client';

import React, { useId } from 'react';
import clsx from 'clsx';
import { Icon } from './Icon';

export function Input({
  label,
  error,
  hint,
  icon,
  rightSlot = null,
  className = '',
  id,
  type = 'text',
  disabled = false,
  required = false,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5 w-full min-w-0">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-content flex items-center gap-1">
          {label}
          {required && <span className="text-danger-ink" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3.5 text-content-muted pointer-events-none">
            <Icon name={icon} size={18} />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={clsx(
            'w-full bg-surface-soft border rounded-[12px] text-content text-sm px-3.5 py-2.5 transition-colors duration-150 min-h-[44px] placeholder:text-content-muted',
            'focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/25',
            icon ? 'pl-10' : 'pl-3.5',
            rightSlot ? 'pr-16' : 'pr-3.5',
            error ? 'border-danger-ink bg-danger-soft/30' : 'border-line hover:border-brand-ink/50',
            disabled && 'bg-canvas/70 text-content-muted opacity-70 cursor-not-allowed',
            className
          )}
          {...props}
        />
        {rightSlot && (
          <div className="absolute right-1.5 flex items-center">
            {rightSlot}
          </div>
        )}
      </div>
      {hint && (
        <p id={hintId} className="text-[11px] text-content-muted leading-relaxed">
          {hint}
        </p>
      )}
      {error && (
        <span id={errorId} role="alert" className="text-xs text-danger-ink font-medium">
          {error}
        </span>
      )}
    </div>
  );
}

export function Textarea({
  label,
  error,
  hint,
  className = '',
  id,
  rows = 3,
  disabled = false,
  required = false,
  ...props
}) {
  const generatedId = useId();
  const inputId = id || props.name || generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="flex flex-col gap-1.5 w-full min-w-0">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-content flex items-center gap-1">
          {label}
          {required && <span className="text-danger-ink" aria-hidden="true">*</span>}
        </label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        disabled={disabled}
        required={required}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={describedBy}
        className={clsx(
          'w-full bg-surface-soft border rounded-[12px] text-content text-sm p-3.5 transition-colors duration-150 resize-y placeholder:text-content-muted',
          'focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/25',
          error ? 'border-danger-ink bg-danger-soft/30' : 'border-line hover:border-brand-ink/50',
          disabled && 'bg-canvas/70 text-content-muted opacity-70 cursor-not-allowed',
          className
        )}
        {...props}
      />
      {hint && (
        <p id={hintId} className="text-[11px] text-content-muted leading-relaxed">
          {hint}
        </p>
      )}
      {error && (
        <span id={errorId} role="alert" className="text-xs text-danger-ink font-medium">
          {error}
        </span>
      )}
    </div>
  );
}

