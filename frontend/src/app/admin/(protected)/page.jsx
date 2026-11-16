'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { formatDate } from '@/lib/format';

export default function AdminOverviewPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'overview'],
    queryFn: () => apiClient('/admin/overview'),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Gagal Memuat Ringkasan"
        message="Tidak dapat mengambil ringkasan katalog dari server."
        onRetry={refetch}
      />
    );
  }

  const overview = data?.data || {
    summary: {
      counters: { total: 0, published: 0, draft: 0, inactive: 0 },
      packages: { total: 0, published: 0, draft: 0, inactive: 0 },
      activeProviders: 0,
      activeRegions: 0,
    },
    attention: {
      countersWithoutPackages: [],
      expiringCounters: [],
      inactiveProviders: [],
    },
  };

  const { summary, attention } = overview;

  return (
    <div className="flex flex-col gap-6 md:gap-8 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-content">Ringkasan Pengelolaan</h1>
          <p className="text-xs text-content-muted mt-1">
            Pantau status katalog konter, paket kuota, dan data operasional platform.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
          <Button href="/admin/konter/baru" variant="brand" size="sm" icon="plus" className="shrink-0">
            Tambah Konter
          </Button>
          <Button href="/admin/konter" variant="outline" size="sm" icon="plus" className="shrink-0">
            Kelola Paket per Konter
          </Button>
        </div>
      </div>

      {/* Onboarding CTA when directory is empty */}
      {summary.counters.total === 0 && (
        <div className="bg-brand-soft rounded-card p-5 border border-line-warm shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <span className="w-10 h-10 rounded-control bg-brand text-content flex items-center justify-center shrink-0">
              <Icon name="store" size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-content">Direktori Belum Memiliki Konter</h2>
              <p className="text-xs text-content-muted mt-0.5 leading-relaxed">
                Mulai tambahkan data konter mitra pertama agar paket kuota bisa tampil di halaman publik.
              </p>
            </div>
          </div>
          <Button href="/admin/konter/baru" variant="brand" size="sm" icon="plus" className="shrink-0">
            Tambah Konter Pertama
          </Button>
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Counters */}
        <div className="bg-surface rounded-card p-5 border border-line shadow-card flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-content-muted uppercase">Total Konter</span>
            <span className="w-8 h-8 rounded-full bg-brand-soft text-brand-ink flex items-center justify-center shrink-0">
              <Icon name="store" size={16} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-content">{summary.counters.total}</span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[11px] text-content-muted">
              <span className="text-success-ink font-semibold">{summary.counters.published} Terbit</span>
              <span>•</span>
              <span className="text-warning-ink font-semibold">{summary.counters.draft} Draft</span>
              <span>•</span>
              <span className="text-danger-ink font-semibold">{summary.counters.inactive} Nonaktif</span>
            </div>
          </div>
        </div>

        {/* Packages */}
        <div className="bg-surface rounded-card p-5 border border-line shadow-card flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-content-muted uppercase">Total Paket</span>
            <span className="w-8 h-8 rounded-full bg-brand-soft text-brand-ink flex items-center justify-center shrink-0">
              <Icon name="package" size={16} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-content">{summary.packages.total}</span>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-2 text-[11px] text-content-muted">
              <span className="text-success-ink font-semibold">{summary.packages.published} Terbit</span>
              <span>•</span>
              <span className="text-warning-ink font-semibold">{summary.packages.draft} Draft</span>
              <span>•</span>
              <span className="text-danger-ink font-semibold">{summary.packages.inactive} Nonaktif</span>
            </div>
          </div>
        </div>

        {/* Active Providers */}
        <div className="bg-surface rounded-card p-5 border border-line shadow-card flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-content-muted uppercase">Provider Aktif</span>
            <span className="w-8 h-8 rounded-full bg-brand-soft text-brand-ink flex items-center justify-center shrink-0">
              <Icon name="wifi" size={16} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-content">{summary.activeProviders}</span>
            <p className="text-[11px] text-content-muted mt-2">Operator seluler aktif di direktori</p>
          </div>
        </div>

        {/* Active Regions */}
        <div className="bg-surface rounded-card p-5 border border-line shadow-card flex flex-col justify-between min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-content-muted uppercase">Wilayah Berkonter</span>
            <span className="w-8 h-8 rounded-full bg-brand-soft text-brand-ink flex items-center justify-center shrink-0">
              <Icon name="map_pin" size={16} />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-content">{summary.activeRegions}</span>
            <p className="text-[11px] text-content-muted mt-2">Wilayah dengan minimal 1 konter terbit</p>
          </div>
        </div>
      </div>

      {/* Attention List (Daftar Perhatian) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Counters without packages */}
        <div className="bg-surface rounded-card p-5 border border-line shadow-card flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
            <h2 className="text-sm font-bold text-content flex items-center gap-2 min-w-0">
              <Icon name="alert" size={16} className="text-warning-ink shrink-0" />
              <span className="truncate">Konter Tanpa Paket</span>
            </h2>
            <span className="text-xs font-bold text-content-muted shrink-0">
              {attention.countersWithoutPackages.length}
            </span>
          </div>
          {attention.countersWithoutPackages.length === 0 ? (
            <p className="text-xs text-content-muted py-4 text-center">
              Semua konter memiliki minimal satu paket data.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {attention.countersWithoutPackages.map((c) => (
                <div key={c.id} className="flex items-center justify-between gap-2 p-2.5 rounded-[10px] bg-surface-muted text-xs min-w-0">
                  <span className="font-semibold text-content truncate">{c.name}</span>
                  <Link href={c.publicationStatus === 'published' ? `/admin/konter/${c.id}/paket/baru` : `/admin/konter/${c.id}/edit`} className="text-brand-ink hover:underline font-bold shrink-0">
                    {c.publicationStatus === 'published' ? '+ Tambah Paket' : 'Terbitkan Konter'}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expiring packages */}
        <div className="bg-surface rounded-card p-5 border border-line shadow-card flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
            <h2 className="text-sm font-bold text-content flex items-center gap-2 min-w-0">
              <Icon name="clock" size={16} className="text-danger-ink shrink-0" />
              <span className="truncate">Konter dengan Paket Kedaluwarsa</span>
            </h2>
            <span className="text-xs font-bold text-content-muted shrink-0">
              {attention.expiringCounters.length}
            </span>
          </div>
          {attention.expiringCounters.length === 0 ? (
            <p className="text-xs text-content-muted py-4 text-center">
              Tidak ada paket dengan batas penayangan mendesak.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {attention.expiringCounters.map((counter) => (
                <div key={counter.id} className="flex flex-col gap-2 rounded-control bg-danger-soft/30 p-3 text-xs min-w-0">
                  <span className="font-bold text-content break-words">{counter.name}</span>
                  <p className="text-content-muted">{counter.packageCount} paket perlu diperiksa · Batas terdekat {formatDate(counter.nextDisplayUntil)}</p>
                  <Link href={`/admin/konter/${counter.id}/paket`} className="self-start font-semibold text-brand-ink hover:underline">Kelola Paket</Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Inactive providers */}
        <div className="bg-surface rounded-card p-5 border border-line shadow-card flex flex-col gap-4 min-w-0">
          <div className="flex items-center justify-between gap-2 border-b border-line pb-3">
            <h2 className="text-sm font-bold text-content flex items-center gap-2 min-w-0">
              <Icon name="wifi" size={16} className="text-content-muted shrink-0" />
              <span className="truncate">Provider Nonaktif</span>
            </h2>
            <span className="text-xs font-bold text-content-muted shrink-0">
              {attention.inactiveProviders.length}
            </span>
          </div>
          {attention.inactiveProviders.length === 0 ? (
            <p className="text-xs text-content-muted py-4 text-center">
              Semua provider berstatus aktif.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {attention.inactiveProviders.map((pr) => (
                <div key={pr.id} className="flex items-center justify-between gap-2 p-2.5 rounded-[10px] bg-surface-muted text-xs min-w-0">
                  <span className="font-semibold text-content truncate">{pr.name}</span>
                  <Link href="/admin/provider" className="text-brand-ink hover:underline font-bold shrink-0">
                    Kelola
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

