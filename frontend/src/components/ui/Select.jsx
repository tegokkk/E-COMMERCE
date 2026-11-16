'use client';

import React, { useId } from 'react';
import clsx from 'clsx';
import { Icon } from './Icon';

export function Select({
  label,
  error,
  hint,
  options = [],
  className = '',
  id,
  disabled = false,
  required = false,
  placeholder = 'Pilih opsi...',
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
        <select
          id={inputId}
          disabled={disabled}
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          className={clsx(
            'w-full bg-surface-soft border rounded-[12px] text-content text-sm px-3.5 py-2.5 pr-10 appearance-none transition-colors duration-150 min-h-[44px]',
            'focus:border-brand-ink focus:outline-none focus:ring-2 focus:ring-brand-ink/25',
            error ? 'border-danger-ink bg-danger-soft/30' : 'border-line hover:border-brand-ink/50',
            disabled && 'bg-canvas/70 text-content-muted opacity-70 cursor-not-allowed',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 text-content-muted pointer-events-none">
          <Icon name="chevron_down" size={18} />
        </div>
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

