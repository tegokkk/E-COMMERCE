'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { counterPackagesApi, counterPackagesPath, counterPackageKeys } from './paths';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Skeleton, EmptyState } from '@/components/ui/States';
import { ErrorState } from '@/components/ui/ErrorState';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { formatRupiah, formatDate } from '@/lib/format';
import {
  PUBLICATION_STATUS,
  PUBLICATION_STATUS_LABELS,
  AVAILABILITY_STATUS,
  AVAILABILITY_STATUS_LABELS,
} from '@konter/shared';

export function CounterPackageList({ counter }) {
  const counterId = counter.id;
  const basePath = counterPackagesPath(counterId);
  const apiPath = counterPackagesApi(counterId);
  const canCreate = counter.publicationStatus === PUBLICATION_STATUS.PUBLISHED;
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [availability, setAvailability] = useState('');
  const [providerId, setProviderId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const successTimerRef = useRef(null);
  const [packageToDelete, setPackageToDelete] = useState(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const showSuccess = (msg) => {
    setActionSuccess(msg);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setActionSuccess(''), 4000);
  };

  const { data: providersData } = useQuery({
    queryKey: ['admin', 'providers'],
    queryFn: () => apiClient('/admin/providers'),
  });

  const providersList = providersData?.data || [];

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: [...counterPackageKeys.all(counterId), 'list', { q, providerId, status, availability, page }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (availability) params.set('availabilityStatus', availability);
      if (providerId) params.set('providerId', providerId);
      if (status) params.set('publicationStatus', status);
      params.set('page', page);
      params.set('limit', 10);
      return apiClient(`${apiPath}?${params.toString()}`);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, publicationStatus }) =>
      apiClient(`${apiPath}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ publicationStatus }),
      }),
    onMutate: () => {
      setActionError('');
      setActionSuccess('');
    },
    onSuccess: (_res, variables) => {
      showSuccess(
        variables.publicationStatus === 'published'
          ? 'Paket kuota berhasil diterbitkan.'
          : 'Paket kuota berhasil dinonaktifkan.'
      );
      queryClient.invalidateQueries({ queryKey: counterPackageKeys.all(counterId) });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
    },
    onError: (error) => setActionError(error.message || 'Status paket gagal diubah.'),
  });

  const packages = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };
  const hasActiveFilters = Boolean(q || providerId || status || availability);

  const handleResetFilters = () => {
    setQ('');
    setAvailability('');
    setProviderId('');
    setStatus('');
    setPage(1);
  };

  const renderActions = (pkg, isTable = false) => (
    <div className={clsx('flex flex-wrap items-center gap-2', isTable && 'justify-end')}>
      <Button href={`${basePath}/${pkg.id}/edit`} variant="outline" size="sm" icon="edit">
        Edit
      </Button>
      <Button
        variant={pkg.publicationStatus === 'published' ? 'danger' : 'brand'}
        size="sm"
        disabled={toggleStatusMutation.isPending}
        loading={toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === pkg.id}
        onClick={() => toggleStatusMutation.mutate({
          id: pkg.id,
          publicationStatus: pkg.publicationStatus === 'published' ? 'inactive' : 'published',
        })}
      >
        {pkg.publicationStatus === 'published' ? 'Nonaktifkan' : 'Terbitkan'}
      </Button>
      <Button variant="danger" size="sm" onClick={() => setPackageToDelete(pkg)}>Hapus</Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-content-muted" aria-live="polite">
          {isLoading ? 'Memuat paket…' : isError ? 'Daftar paket belum tersedia.' : `${meta.total} paket di konter ini`}
        </p>
        {canCreate && <Button href={`${basePath}/baru`} size="sm" icon="plus">Tambah Paket</Button>}
      </div>

      {actionSuccess && (
        <div role="status" className="rounded-card border border-success-ink/20 bg-success-soft p-3 text-xs font-semibold text-success-ink flex items-center gap-2">
          <Icon name="check" size={16} className="shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div role="alert" className="rounded-card border border-danger-ink/20 bg-danger-soft p-3 text-xs font-semibold text-danger-ink flex items-center gap-2">
          <Icon name="alert" size={16} className="shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-surface rounded-card p-4 border border-line shadow-card flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <Input
              label="Cari paket"
              placeholder="Nama paket atau kuota..."
              icon="search"
              maxLength={100}
              value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }}
            />
          </div>
          <div>
            <Select
              label="Provider"
              placeholder="Semua Provider"
              value={providerId}
              onChange={(e) => {
                setProviderId(e.target.value);
                setPage(1);
              }}
              options={providersList.map((p) => ({ value: p.id, label: p.name }))}
            />
          </div>
          <div>
            <Select
              label="Status publikasi"
              placeholder="Semua Status Publikasi"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              options={[
                { value: PUBLICATION_STATUS.PUBLISHED, label: 'Diterbitkan' },
                { value: PUBLICATION_STATUS.DRAFT, label: 'Draft' },
                { value: PUBLICATION_STATUS.INACTIVE, label: 'Nonaktif' },
              ]}
            />
          </div>
          <Select
            label="Ketersediaan"
            placeholder="Semua Ketersediaan"
            value={availability}
            onChange={(e) => { setAvailability(e.target.value); setPage(1); }}
            options={Object.entries(AVAILABILITY_STATUS_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </div>
        {hasActiveFilters && (
          <div className="flex justify-end pt-2 border-t border-line/60">
            <Button variant="ghost" size="sm" icon="refresh" onClick={handleResetFilters}>
              Reset Filter
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-surface rounded-card p-4 border border-line flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Gagal Memuat Paket"
          message="Tidak dapat mengambil daftar paket dari server."
          onRetry={refetch}
        />
      ) : packages.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon="search"
            title="Tidak Ada Paket yang Sesuai Filter"
            description="Coba ubah pencarian, provider, ketersediaan, atau status publikasi."
            actionLabel="Reset Filter"
            onAction={handleResetFilters}
          />
        ) : (
          <EmptyState
            icon="package"
            title="Belum ada paket untuk konter ini"
            description={canCreate ? `Tambahkan paket pertama untuk ${counter.name}.` : 'Terbitkan kembali konter untuk menambahkan paket.'}
            actionLabel={canCreate ? 'Tambah Paket' : undefined}
            actionHref={canCreate ? `${basePath}/baru` : undefined}
            actionVariant="brand"
          />
        )
      ) : (
        <div className="bg-surface rounded-card border border-line shadow-card overflow-hidden">
          <div className="lg:hidden divide-y divide-line">
            {packages.map((pkg) => (
              <article key={pkg.id} className="p-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-content break-words">{pkg.name}</h2>
                    <p className="text-xs text-content-muted">{pkg.providerName}</p>
                  </div>
                  <span className="font-bold text-content text-sm shrink-0">{formatRupiah(pkg.price)}</span>
                </div>
                <p className="text-xs text-content-muted">{pkg.quotaSummary} · {pkg.activePeriod}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={pkg.availabilityStatus === AVAILABILITY_STATUS.AVAILABLE ? 'success' : pkg.availabilityStatus === AVAILABILITY_STATUS.NEEDS_CONFIRMATION ? 'warning' : 'danger'}>
                    {AVAILABILITY_STATUS_LABELS[pkg.availabilityStatus]}
                  </Badge>
                  <Badge variant={pkg.publicationStatus === 'published' ? 'success' : pkg.publicationStatus === 'draft' ? 'warning' : 'danger'}>
                    {PUBLICATION_STATUS_LABELS[pkg.publicationStatus]}
                  </Badge>
                </div>
                {renderActions(pkg, false)}
              </article>
            ))}
          </div>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-surface-muted border-b border-line text-content-muted font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Nama Paket</th>
                  <th className="p-3.5">Provider</th>
                  <th className="p-3.5">Kuota & Masa Aktif</th>
                  <th className="p-3.5">Harga</th>
                  <th className="p-3.5">Ketersediaan</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {packages.map((pkg) => (
                  <tr key={pkg.id} className="hover:bg-surface-soft/50 transition-colors">
                    <td className="p-3.5">
                      <span className="font-bold text-content block">{pkg.name}</span>
                      {pkg.displayUntil && (
                        <span className="text-[11px] text-content-muted block">
                          Tayang s/d: {formatDate(pkg.displayUntil)}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <span className="text-[11px] text-brand-ink font-bold uppercase">
                        {pkg.providerName}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-bold text-content block">{pkg.quotaSummary}</span>
                      <span className="text-[11px] text-content-muted block">{pkg.activePeriod}</span>
                    </td>
                    <td className="p-3.5 font-bold text-content">{formatRupiah(pkg.price)}</td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          pkg.availabilityStatus === AVAILABILITY_STATUS.AVAILABLE
                            ? 'success'
                            : pkg.availabilityStatus === AVAILABILITY_STATUS.NEEDS_CONFIRMATION
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {AVAILABILITY_STATUS_LABELS[pkg.availabilityStatus]}
                      </Badge>
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          pkg.publicationStatus === 'published'
                            ? 'success'
                            : pkg.publicationStatus === 'draft'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {PUBLICATION_STATUS_LABELS[pkg.publicationStatus]}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      {renderActions(pkg, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta.totalPages > 1 && (
            <div className="p-3 border-t border-line flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs text-content-muted">
                Total: {meta.total} paket (Halaman {page} dari {meta.totalPages})
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {packageToDelete && (
        <DeleteConfirmDialog
          item={packageToDelete}
          kind="Paket"
          endpoint={`${apiPath}/${packageToDelete.id}`}
          details="Paket ini akan hilang dari katalog dan daftar admin."
          onClose={() => setPackageToDelete(null)}
          onDeleted={() => {
            if (packages.length === 1 && page > 1) setPage(page - 1);
            showSuccess(`Paket ${packageToDelete.name} berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: counterPackageKeys.all(counterId) });
            queryClient.invalidateQueries({ queryKey: ['admin', 'counters'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
          }}
        />
      )}
    </div>
  );
}

