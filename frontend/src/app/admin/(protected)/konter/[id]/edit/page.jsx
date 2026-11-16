'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CounterForm } from '@/features/admin/counters/CounterForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

export default function EditCounterPage() {
  const { id } = useParams();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'counters', id],
    queryFn: () => apiClient(`/admin/counters/${id}`),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <ErrorState
        title="Konter Tidak Ditemukan"
        message="Data konter tidak dapat dimuat atau telah dihapus."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/konter" className="text-xs font-semibold text-brand-ink hover:underline mb-2 inline-block">
          ← Kembali ke Daftar Konter
        </Link>
        <h1 className="text-2xl font-extrabold text-content">Edit Konter: {data.data.name}</h1>
        <p className="text-xs text-content-muted mt-1">
          Perbarui informasi profil, kontak WhatsApp, jam operasional, atau status publikasi.
        </p>
      </div>

      <CounterForm initialData={data.data} isEdit />
    </div>
  );
}

