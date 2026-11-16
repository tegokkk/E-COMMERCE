'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Button } from '@/components/ui/Button';
import { counterPackagesPath } from '@/features/admin/packages/paths';

export default function LegacyEditPackagePage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isError, refetch } = useQuery({
    queryKey: ['admin', 'legacy-package', id],
    queryFn: () => apiClient(`/admin/packages/${id}`),
    retry: false,
  });
  const counterId = data?.data?.counterId;
  useEffect(() => {
    if (counterId) router.replace(`${counterPackagesPath(counterId)}/${id}/edit`);
  }, [counterId, id, router]);

  if (isError) return <div className="flex flex-col gap-4"><Button href="/admin/konter" variant="outline" className="self-start">Kembali ke Konter</Button><ErrorState title="Paket tidak ditemukan" message="Paket telah dihapus atau tidak dapat dimuat." onRetry={refetch} /></div>;
  return <Skeleton className="h-80 w-full" />;
}
