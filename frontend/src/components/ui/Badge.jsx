'use client';

import React from 'react';
import clsx from 'clsx';

export function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variants = {
    default: 'bg-surface-muted text-content-muted border-line',
    success: 'bg-success-soft text-success-ink border-transparent',
    warning: 'bg-warning-soft text-warning-ink border-transparent',
    danger: 'bg-danger-soft text-danger-ink border-transparent',
    brand: 'bg-brand-soft text-brand-ink border-brand-ink/20',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5 rounded-full font-medium',
    md: 'text-sm px-2.5 py-1 rounded-full font-semibold',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 border border-solid',
        variants[variant] || variants.default,
        sizes[size] || sizes.sm,
        className
      )}
    >
      {children}
    </span>
  );
}

