'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Skeleton, EmptyState } from '@/components/ui/States';
import { ErrorState } from '@/components/ui/ErrorState';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { PUBLICATION_STATUS, PUBLICATION_STATUS_LABELS } from '@konter/shared';

export default function AdminCountersPage() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const successTimerRef = useRef(null);
  const [counterToDisable, setCounterToDisable] = useState(null);
  const [impactOpen, setImpactOpen] = useState(false);
  const [impact, setImpact] = useState(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [counterToDelete, setCounterToDelete] = useState(null);

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

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'counters', { q, status, page }],
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (status) params.set('publicationStatus', status);
      params.set('page', page);
      params.set('limit', 10);
      return apiClient(`/admin/counters?${params.toString()}`);
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, publicationStatus }) =>
      apiClient(`/admin/counters/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ publicationStatus }),
      }),
    onMutate: () => {
      setActionError('');
      setActionSuccess('');
    },
    onSuccess: (_res, variables) => {
      setImpactOpen(false);
      setCounterToDisable(null);
      showSuccess(
        variables.publicationStatus === 'published'
          ? 'Konter berhasil diterbitkan.'
          : 'Konter berhasil dinonaktifkan.'
      );
      queryClient.invalidateQueries({ queryKey: ['admin', 'counters'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
    },
    onError: (error) => setActionError(error.message || 'Status konter gagal diubah.'),
  });

  const counters = data?.data || [];
  const meta = data?.meta || { total: 0, totalPages: 1 };
  const hasActiveFilters = Boolean(q || status);

  const handleResetFilters = () => {
    setQ('');
    setStatus('');
    setPage(1);
  };

  const handleToggle = async (counter) => {
    if (counter.publicationStatus !== 'published') {
      toggleStatusMutation.mutate({ id: counter.id, publicationStatus: 'published' });
      return;
    }
    setActionError('');
    setActionSuccess('');
    setCounterToDisable(counter);
    setImpact(null);
    setLoadingImpact(true);
    setImpactOpen(true);
    try {
      const response = await apiClient(`/admin/counters/${counter.id}/impact`);
      setImpact(response.data);
    } catch (error) {
      setImpactOpen(false);
      setActionError(error.message || 'Dampak penonaktifan gagal dihitung.');
    } finally {
      setLoadingImpact(false);
    }
  };

  const renderActions = (counter, isTable = false) => (
    <div className={clsx('flex flex-wrap items-center gap-2', isTable && 'justify-end')}>
      {counter.publicationStatus === 'published' || counter.packageCount > 0 ? (
        <Button href={`/admin/konter/${counter.id}/paket`} variant="brand" size="sm" icon="package">
          Kelola Paket ({counter.packageCount || 0})
        </Button>
      ) : (
        <span className="text-xs text-content-muted">Terbitkan konter untuk menambah paket.</span>
      )}
      <Button href={`/admin/konter/${counter.id}/edit`} variant="outline" size="sm" icon="edit">
        Edit
      </Button>
      <Button
        variant={counter.publicationStatus === 'published' ? 'danger' : 'brand'}
        size="sm"
        disabled={toggleStatusMutation.isPending}
        loading={toggleStatusMutation.isPending && toggleStatusMutation.variables?.id === counter.id}
        onClick={() => handleToggle(counter)}
      >
        {counter.publicationStatus === 'published' ? 'Nonaktifkan' : 'Terbitkan'}
      </Button>
      <Button variant="danger" size="sm" onClick={() => setCounterToDelete(counter)}>Hapus</Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-content">Daftar Konter UMKM</h1>
          <p className="text-xs text-content-muted mt-1">
            Kelola data usaha, kontak WhatsApp, wilayah, dan status publikasi konter.
          </p>
        </div>
        <Button href="/admin/konter/baru" variant="brand" size="sm" icon="plus" className="shrink-0">
          Tambah Konter Baru
        </Button>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              label="Cari konter"
              icon="search"
              placeholder="Cari nama konter, alamat, atau wilayah..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
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
        </div>
        {hasActiveFilters && (
          <div className="flex justify-end pt-2 border-t border-line/60">
            <Button variant="ghost" size="sm" icon="refresh" onClick={handleResetFilters}>
              Reset Filter
            </Button>
          </div>
        )}
      </div>

      {/* Table & Cards */}
      {isLoading ? (
        <div className="bg-surface rounded-card p-4 border border-line flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Gagal Memuat Konter"
          message="Tidak dapat mengambil daftar konter dari server."
          onRetry={refetch}
        />
      ) : counters.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon="search"
            title="Tidak Ada Konter yang Sesuai Filter"
            description="Coba ubah kata kunci pencarian atau pilih status publikasi lain."
            actionLabel="Reset Filter"
            onAction={handleResetFilters}
          />
        ) : (
          <EmptyState
            icon="store"
            title="Belum Ada Konter Terdaftar"
            description="Tambahkan konter mitra pertama untuk mulai mengisi direktori KonterKuota."
            actionLabel="Tambah Konter Baru"
            actionHref="/admin/konter/baru"
            actionVariant="brand"
          />
        )
      ) : (
        <div className="bg-surface rounded-card border border-line shadow-card overflow-hidden">
          <div className="lg:hidden divide-y divide-line">
            {counters.map((counter) => (
              <article key={counter.id} className="p-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-content break-words">{counter.name}</h2>
                    {counter.isDemo && <span className="text-xs font-bold text-warning-ink">Data contoh</span>}
                    <p className="text-xs text-content-muted mt-0.5">
                      {[counter.city, counter.province, counter.regionName].filter(Boolean).join(', ') || '-'} · {counter.packageCount || 0} paket
                    </p>
                  </div>
                  <Badge variant={counter.publicationStatus === 'published' ? 'success' : counter.publicationStatus === 'draft' ? 'warning' : 'danger'}>
                    {PUBLICATION_STATUS_LABELS[counter.publicationStatus]}
                  </Badge>
                </div>
                <p className="text-xs text-content-muted break-words">{counter.address}</p>
                <p className="text-xs text-content-muted font-mono">WhatsApp: {counter.whatsapp}</p>
                {renderActions(counter, false)}
              </article>
            ))}
          </div>
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs">
              <thead className="bg-surface-muted border-b border-line text-content-muted font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Nama Konter</th>
                  <th className="p-3.5">Provinsi & Kota</th>
                  <th className="p-3.5">Alamat & Wilayah</th>
                  <th className="p-3.5">WhatsApp Usaha</th>
                  <th className="p-3.5">Paket</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {counters.map((counter) => (
                  <tr key={counter.id} className="hover:bg-surface-soft/50 transition-colors">
                    <td className="p-3.5 font-bold text-content">{counter.name}{counter.isDemo && <span className="block text-warning-ink text-xs">Data contoh</span>}</td>
                    <td className="p-3.5 text-content">
                      <span className="font-semibold block">{counter.city || '-'}</span>
                      <span className="text-[11px] text-content-muted block">{counter.province || '-'}</span>
                    </td>
                    <td className="p-3.5 text-content-muted">
                      {counter.regionName && <span className="font-semibold text-content block">{counter.regionName}</span>}
                      <span className="line-clamp-1">{counter.address}</span>
                    </td>
                    <td className="p-3.5 font-mono text-content">{counter.whatsapp}</td>
                    <td className="p-3.5">
                      <span className="font-semibold">{counter.packageCount || 0} paket</span>
                    </td>
                    <td className="p-3.5">
                      <Badge
                        variant={
                          counter.publicationStatus === 'published'
                            ? 'success'
                            : counter.publicationStatus === 'draft'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {PUBLICATION_STATUS_LABELS[counter.publicationStatus]}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      {renderActions(counter, true)}
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
                Total: {meta.total} konter (Halaman {page} dari {meta.totalPages})
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
      <Dialog open={impactOpen} onOpenChange={setImpactOpen}>
        <DialogContent
          title="Konfirmasi Penonaktifan Konter"
          description="Periksa paket yang akan hilang dari direktori publik."
          maxWidth="max-w-md"
        >
          <div className="flex flex-col gap-4 text-sm">
            {loadingImpact ? (
              <p>Menghitung paket terdampak...</p>
            ) : (
              <p className="rounded-card border border-warning-ink/20 bg-warning-soft p-4 text-warning-ink">
                Jika <strong>{counterToDisable?.name}</strong> dinonaktifkan, <strong>{impact?.affectedPackages ?? 0} paket</strong> yang sedang tampil akan disembunyikan.
              </p>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" disabled={toggleStatusMutation.isPending} onClick={() => setImpactOpen(false)}>Batal</Button>
              <Button
                variant="danger"
                size="sm"
                disabled={!impact || loadingImpact}
                loading={toggleStatusMutation.isPending}
                onClick={() => toggleStatusMutation.mutate({ id: counterToDisable.id, publicationStatus: 'inactive' })}
              >
                Ya, Nonaktifkan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {counterToDelete && (
        <DeleteConfirmDialog
          item={counterToDelete}
          kind="Konter"
          endpoint={`/admin/counters/${counterToDelete.id}`}
          details={`${counterToDelete.packageCount || 0} paket terkait juga akan terhapus.`}
          onClose={() => setCounterToDelete(null)}
          onDeleted={() => {
            if (counters.length === 1 && page > 1) setPage(page - 1);
            showSuccess(`Konter ${counterToDelete.name} berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['admin', 'counters'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'packages'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
          }}
        />
      )}
    </div>
  );
}

