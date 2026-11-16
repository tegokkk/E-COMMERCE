'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Icon } from '@/components/ui/Icon';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Skeleton, EmptyState } from '@/components/ui/States';
import { ErrorState } from '@/components/ui/ErrorState';

export default function AdminProvidersPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState(null);
  const [name, setName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const successTimerRef = useRef(null);
  const [providerToDelete, setProviderToDelete] = useState(null);

  // Impact dialog state
  const [impactModalOpen, setImpactModalOpen] = useState(false);
  const [providerToToggle, setProviderToToggle] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [loadingImpact, setLoadingImpact] = useState(false);
  const [impactError, setImpactError] = useState('');

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
    queryKey: ['admin', 'providers'],
    queryFn: () => apiClient('/admin/providers'),
  });

  const providers = data?.data || [];

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      if (editingProvider) {
        return apiClient(`/admin/providers/${editingProvider.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      }
      return apiClient('/admin/providers', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      const wasEdit = Boolean(editingProvider);
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      setModalOpen(false);
      setEditingProvider(null);
      setName('');
      setLogoUrl('');
      showSuccess(wasEdit ? 'Provider berhasil diperbarui.' : 'Provider baru berhasil ditambahkan.');
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Gagal menyimpan provider.');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }) =>
      apiClient(`/admin/providers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }),
    onMutate: () => {
      setActionError('');
      setActionSuccess('');
    },
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      setImpactModalOpen(false);
      setProviderToToggle(null);
      showSuccess(variables.isActive ? 'Provider berhasil diaktifkan.' : 'Provider berhasil dinonaktifkan.');
    },
    onError: (error) => {
      const msg = error.message || 'Status provider gagal diperbarui.';
      if (impactModalOpen) {
        setImpactError(msg);
      } else {
        setActionError(msg);
      }
    },
  });

  const handleOpenAdd = () => {
    setEditingProvider(null);
    setName('');
    setLogoUrl('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (provider) => {
    setEditingProvider(provider);
    setName(provider.name);
    setLogoUrl(provider.logoUrl || '');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handlePromptToggle = async (provider) => {
    if (provider.isActive) {
      // Akan menonaktifkan -> periksa dampak terlebih dahulu
      setProviderToToggle(provider);
      setImpactData(null);
      setImpactError('');
      setLoadingImpact(true);
      setImpactModalOpen(true);
      try {
        const res = await apiClient(`/admin/providers/${provider.id}/impact`);
        setImpactData(res.data);
      } catch (error) {
        setImpactError(error.message || 'Dampak penonaktifan gagal dihitung.');
      } finally {
        setLoadingImpact(false);
      }
    } else {
      // Langsung aktifkan
      toggleActiveMutation.mutate({ id: provider.id, isActive: true });
    }
  };

  const renderActions = (p, isTable = false) => (
    <div className={clsx('flex flex-wrap items-center gap-2', isTable && 'justify-end')}>
      <Button variant="outline" size="sm" icon="edit" onClick={() => handleOpenEdit(p)}>
        Edit
      </Button>
      <Button
        variant={p.isActive ? 'danger' : 'brand'}
        size="sm"
        disabled={toggleActiveMutation.isPending}
        loading={!impactModalOpen && toggleActiveMutation.isPending && toggleActiveMutation.variables?.id === p.id}
        onClick={() => handlePromptToggle(p)}
      >
        {p.isActive ? 'Nonaktifkan' : 'Aktifkan'}
      </Button>
      <Button variant="danger" size="sm" onClick={() => setProviderToDelete(p)}>Hapus</Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-content">Kelola Provider</h1>
          <p className="text-xs text-content-muted mt-1">
            Daftar operator seluler yang paket kuotanya dipasarkan oleh konter mitra.
          </p>
        </div>
        <Button variant="brand" size="sm" icon="plus" onClick={handleOpenAdd} className="shrink-0">
          Tambah Provider
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

      {/* Provider List */}
      {isLoading ? (
        <div className="bg-surface rounded-card p-4 border border-line flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Gagal Memuat Provider"
          message="Tidak dapat mengambil daftar operator dari server."
          onRetry={refetch}
        />
      ) : providers.length === 0 ? (
        <EmptyState
          icon="wifi"
          title="Belum Ada Provider Terdaftar"
          description="Tambahkan operator seluler agar paket data dapat dikategorikan."
          actionLabel="Tambah Provider"
          actionVariant="brand"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-surface rounded-card border border-line shadow-card overflow-hidden">
          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-line">
            {providers.map((p) => (
              <article key={p.id} className="p-4 flex flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-content break-words">{p.name}</h2>
                    <p className="text-xs text-content-muted mt-0.5">{p.packageCount || 0} paket terdaftar</p>
                  </div>
                  <Badge variant={p.isActive ? 'success' : 'danger'}>
                    {p.isActive ? 'Aktif' : 'Nonaktif'}
                  </Badge>
                </div>
                {renderActions(p, false)}
              </article>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="bg-surface-muted border-b border-line text-content-muted font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Nama Operator</th>
                  <th className="p-3.5">Jumlah Paket Terdaftar</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {providers.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-soft/50 transition-colors">
                    <td className="p-3.5 font-bold text-content text-sm">{p.name}</td>
                    <td className="p-3.5 font-semibold text-content-muted">
                      {p.packageCount || 0} paket
                    </td>
                    <td className="p-3.5">
                      <Badge variant={p.isActive ? 'success' : 'danger'}>
                        {p.isActive ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      {renderActions(p, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!saveMutation.isPending) setModalOpen(open); }}>
        <DialogContent
          title={editingProvider ? 'Edit Provider' : 'Tambah Provider Baru'}
          description="Masukkan nama operator seluler yang didukung."
          maxWidth="max-w-md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (saveMutation.isPending) return;
              saveMutation.mutate({ name, logoUrl: logoUrl || null });
            }}
            className="flex flex-col gap-4 mt-1"
          >
            {errorMsg && (
              <div role="alert" className="p-3 bg-danger-soft text-danger-ink rounded-[10px] text-xs font-semibold border border-danger-ink/20 flex items-center gap-2">
                <Icon name="alert" size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
            <Input
              label="Nama Provider"
              required
              placeholder="Contoh: Telkomsel"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saveMutation.isPending}
            />
            <Input
              label="URL Logo (Opsional)"
              placeholder="https://... atau /images/providers/..."
              hint="Boleh dikosongkan jika menggunakan tampilan teks standar."
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              disabled={saveMutation.isPending}
            />
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
              <Button variant="outline" size="sm" disabled={saveMutation.isPending} onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="brand" size="sm" loading={saveMutation.isPending}>
                Simpan
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {providerToDelete && (
        <DeleteConfirmDialog
          item={providerToDelete}
          kind="Provider"
          endpoint={`/admin/providers/${providerToDelete.id}`}
          details="Provider yang sudah dihapus tidak muncul lagi dalam pilihan paket baru."
          blockedReason={providerToDelete.packageCount > 0 ? `Masih ada ${providerToDelete.packageCount} paket. Hapus atau pindahkan paket tersebut terlebih dahulu.` : ''}
          onClose={() => setProviderToDelete(null)}
          onDeleted={() => {
            showSuccess(`Provider ${providerToDelete.name} berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
          }}
        />
      )}

      {/* Impact Confirmation Dialog */}
      <Dialog open={impactModalOpen} onOpenChange={(open) => { if (!toggleActiveMutation.isPending) setImpactModalOpen(open); }}>
        <DialogContent
          title="Konfirmasi Penonaktifan Provider"
          description="Periksa dampak sebelum menonaktifkan operator ini dari direktori publik."
          maxWidth="max-w-md"
        >
          <div className="flex flex-col gap-4 mt-1">
            {loadingImpact ? (
              <div className="py-6 text-center text-xs text-content-muted">
                Menghitung dampak penonaktifan...
              </div>
            ) : impactError ? (
              <p role="alert" className="rounded-card border border-danger-ink/20 bg-danger-soft p-4 text-danger-ink text-xs font-semibold">{impactError}</p>
            ) : (
              <div className="bg-warning-soft text-warning-ink p-4 rounded-card border border-warning-ink/20 flex flex-col gap-2 text-xs">
                <span className="font-bold text-sm">
                  Peringatan Dampak Penonaktifan: {providerToToggle?.name}
                </span>
                <p>
                  Jika provider ini dinonaktifkan:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Sebanyak <strong>{impactData?.affectedPackages || 0} paket data</strong> akan
                    otomatis disembunyikan dari katalog publik.
                  </li>
                  <li>
                    Sebanyak <strong>{impactData?.affectedCounters || 0} konter mitra</strong> akan
                    terdampak pada tampilan direktori.
                  </li>
                </ul>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-line">
              <Button variant="outline" size="sm" disabled={toggleActiveMutation.isPending} onClick={() => setImpactModalOpen(false)}>
                Batalkan
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={!impactData || loadingImpact}
                loading={toggleActiveMutation.isPending}
                onClick={() =>
                  toggleActiveMutation.mutate({
                    id: providerToToggle.id,
                    isActive: false,
                  })
                }
              >
                Ya, Nonaktifkan Sekarang
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

