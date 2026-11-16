'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { PUBLICATION_STATUS_LABELS } from '@konter/shared';
import { PackageForm } from './PackageForm';
import { CounterPackageList } from './CounterPackageList';
import { counterPackagesApi, counterPackagesPath, counterPackageKeys } from './paths';

export function CounterPackagesScreen({ counterId, packageId, isNew = false }) {
  const counterQuery = useQuery({
    queryKey: ['admin', 'counters', counterId],
    queryFn: () => apiClient(`/admin/counters/${counterId}`),
  });
  const packageQuery = useQuery({
    queryKey: counterPackageKeys.detail(counterId, packageId),
    queryFn: () => apiClient(`${counterPackagesApi(counterId)}/${packageId}`),
    enabled: Boolean(packageId),
    retry: false,
  });

  if (counterQuery.isPending || (packageId && packageQuery.isPending)) {
    return <div className="flex flex-col gap-6" aria-label="Memuat data konter"><Skeleton className="h-10 w-64" /><Skeleton className="h-80 w-full" /></div>;
  }

  if (counterQuery.isError || (packageId && packageQuery.isError)) {
    return (
      <div className="flex flex-col gap-4">
        <Button href="/admin/konter" variant="outline" className="self-start">Kembali ke Konter</Button>
        <ErrorState
          title={packageId ? 'Paket tidak dapat dibuka' : 'Konter tidak dapat dibuka'}
          message={counterQuery.error?.message || packageQuery.error?.message || 'Data tidak tersedia.'}
          onRetry={() => { counterQuery.refetch(); if (packageId) packageQuery.refetch(); }}
        />
      </div>
    );
  }

  const counter = counterQuery.data.data;
  const pkg = packageQuery.data?.data;
  const basePath = counterPackagesPath(counterId);
  const isForm = isNew || Boolean(packageId);
  const published = counter.publicationStatus === 'published';

  return (
    <div className="flex min-w-0 flex-col gap-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs text-content-muted">
        <Link href="/admin/konter" className="text-brand-ink hover:underline">Konter</Link>
        <span aria-hidden="true">/</span>
        <Link href={`/admin/konter/${counterId}/edit`} className="break-words text-brand-ink hover:underline">{counter.name}</Link>
        <span aria-hidden="true">/</span>
        {isForm ? <><Link href={basePath} className="text-brand-ink hover:underline">Paket</Link><span aria-hidden="true">/</span><span aria-current="page">{isNew ? 'Tambah Paket' : 'Edit Paket'}</span></> : <span aria-current="page">Paket</span>}
      </nav>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-extrabold text-content">{isNew ? 'Tambah Paket' : packageId ? `Edit Paket: ${pkg.name}` : `Paket ${counter.name}`}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-content-muted">
            <span className="break-words">{counter.name}</span>
            <Badge variant={published ? 'success' : counter.publicationStatus === 'draft' ? 'warning' : 'danger'}>{PUBLICATION_STATUS_LABELS[counter.publicationStatus]}</Badge>
          </div>
        </div>
        <Button href={isForm ? basePath : '/admin/konter'} variant="outline" size="sm">{isForm ? 'Kembali ke Paket' : 'Kembali ke Konter'}</Button>
      </div>
      {!published && (
        <div role="status" className="rounded-card border border-warning-ink/30 bg-warning-soft p-4 text-sm text-warning-ink">
          <p>Terbitkan konter terlebih dahulu sebelum menambahkan paket. Paket yang sudah ada tetap dapat dikelola, tetapi tidak tampil di website publik selama konter belum terbit.</p>
          <Link href={`/admin/konter/${counterId}/edit`} className="mt-2 inline-block font-semibold underline">Kelola status konter</Link>
        </div>
      )}
      {isForm ? (
        (!isNew || published) && <PackageForm key={`${counterId}:${packageId || 'new'}`} counter={counter} initialData={pkg} isEdit={Boolean(packageId)} />
      ) : <CounterPackageList key={counterId} counter={counter} />}
    </div>
  );
}
