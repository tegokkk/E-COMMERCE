'use client';

import React from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

export function EmptyState({
  title = 'Tidak Ada Data',
  description = 'Belum ada data yang tersedia untuk ditampilkan.',
  icon = 'store',
  actionLabel,
  actionHref,
  actionVariant = 'outline',
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-surface rounded-card border border-line shadow-card">
      <div className="w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center text-brand-ink mb-3">
        <Icon name={icon} size={22} />
      </div>
      <h3 className="text-base font-bold text-content mb-1">{title}</h3>
      <p className="text-sm text-content-muted max-w-sm mb-4">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        <Button href={actionHref} variant={actionVariant} size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Terjadi Kesalahan',
  message = 'Gagal memuat data dari server. Periksa koneksi internet Anda.',
  onRetry,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-danger-soft/30 rounded-card border border-danger-ink/20">
      <div className="w-12 h-12 rounded-full bg-danger-soft flex items-center justify-center text-danger-ink mb-3">
        <Icon name="alert" size={22} />
      </div>
      <h3 className="text-base font-bold text-content mb-1">{title}</h3>
      <p className="text-sm text-content-muted max-w-sm mb-4">{message}</p>
      {onRetry && (
        <Button variant="brand" size="sm" icon="refresh" onClick={onRetry}>
          Coba Lagi
        </Button>
      )}
    </div>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-surface-muted rounded-[8px] ${className}`} />;
}

