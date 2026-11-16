'use client';

import React from 'react';
import clsx from 'clsx';
import { Icon } from './Icon';

export function Button({
  children,
  variant = 'brand',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon,
  iconRight,
  type = 'button',
  href,
  onClick,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-[12px] select-none cursor-pointer ' +
    'transition-all duration-200 ease-out ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ' +
    '[@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-md ' +
    'active:translate-y-0 active:scale-[0.98] active:shadow-xs ' +
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none disabled:transform-none disabled:shadow-none ' +
    'motion-reduce:transform-none motion-reduce:transition-none min-h-[44px]';

  const variants = {
    brand:
      'bg-brand text-brand-on hover:bg-brand-hover shadow-xs font-bold border border-transparent',
    whatsapp:
      'bg-whatsapp text-white hover:bg-whatsapp-hover shadow-xs font-bold border border-transparent',
    outline:
      'bg-surface text-content border border-line hover:border-primary/60 hover:bg-surface-soft shadow-xs',
    ghost:
      'bg-transparent text-content hover:bg-surface-muted [@media(hover:hover)]:hover:shadow-none',
    danger:
      'bg-danger-soft text-danger-ink hover:bg-danger-ink hover:text-[#0B1220] border border-danger-ink/30 shadow-xs',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const Element = href ? 'a' : 'button';

  return (
    <Element
      type={href ? undefined : type}
      href={href}
      className={clsx(baseStyles, variants[variant], sizes[size], className)}
      disabled={href ? undefined : disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <Icon name="refresh" size={16} className="animate-spin motion-reduce:animate-none" />
          <span>Memproses...</span>
        </>
      ) : (
        <>
          {icon && <Icon name={icon} size={size === 'lg' ? 22 : 18} />}
          <span>{children}</span>
          {iconRight && <Icon name={iconRight} size={size === 'lg' ? 22 : 18} />}
        </>
      )}
    </Element>
  );
}

