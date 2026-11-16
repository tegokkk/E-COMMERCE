'use client';

import React, { useState, useRef, useEffect } from 'react';
import clsx from 'clsx';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { Dialog, DialogContent } from '@/components/ui/Dialog';
import { DeleteConfirmDialog } from '@/components/ui/DeleteConfirmDialog';
import { Skeleton, EmptyState } from '@/components/ui/States';
import { ErrorState } from '@/components/ui/ErrorState';

export default function AdminRegionsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [name, setName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const successTimerRef = useRef(null);
  const [regionToDelete, setRegionToDelete] = useState(null);

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
    queryKey: ['admin', 'regions'],
    queryFn: () => apiClient('/admin/regions'),
  });

  const regions = data?.data || [];

  const saveMutation = useMutation({
    mutationFn: (payload) => {
      if (editingRegion) {
        return apiClient(`/admin/regions/${editingRegion.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      }
      return apiClient('/admin/regions', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      const wasEdit = Boolean(editingRegion);
      queryClient.invalidateQueries({ queryKey: ['admin', 'regions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
      setModalOpen(false);
      setEditingRegion(null);
      setName('');
      showSuccess(wasEdit ? 'Wilayah berhasil diperbarui.' : 'Wilayah baru berhasil ditambahkan.');
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Gagal menyimpan wilayah.');
    },
  });

  const handleOpenAdd = () => {
    setEditingRegion(null);
    setName('');
    setErrorMsg('');
    setModalOpen(true);
  };

  const handleOpenEdit = (region) => {
    setEditingRegion(region);
    setName(region.name);
    setErrorMsg('');
    setModalOpen(true);
  };

  const renderActions = (r, isTable = false) => (
    <div className={clsx('flex flex-wrap items-center gap-2', isTable && 'justify-end')}>
      <Button variant="outline" size="sm" icon="edit" onClick={() => handleOpenEdit(r)}>Edit</Button>
      <Button variant="danger" size="sm" onClick={() => setRegionToDelete(r)}>Hapus</Button>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-content">Kelola Wilayah</h1>
          <p className="text-xs text-content-muted mt-1">
            Daftar kecamatan, kelurahan, atau area jangkauan operasional konter UMKM.
          </p>
        </div>
        <Button variant="brand" size="sm" icon="plus" onClick={handleOpenAdd} className="shrink-0">
          Tambah Wilayah
        </Button>
      </div>

      {actionSuccess && (
        <div role="status" className="rounded-card border border-success-ink/20 bg-success-soft p-3 text-xs font-semibold text-success-ink flex items-center gap-2">
          <Icon name="check" size={16} className="shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="bg-surface rounded-card p-4 border border-line flex flex-col gap-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : isError ? (
        <ErrorState
          title="Gagal Memuat Wilayah"
          message="Tidak dapat mengambil daftar wilayah dari server."
          onRetry={refetch}
        />
      ) : regions.length === 0 ? (
        <EmptyState
          icon="map_pin"
          title="Belum Ada Wilayah Terdaftar"
          description="Tambahkan daftar kecamatan atau wilayah agar pencarian lokasi lebih akurat."
          actionLabel="Tambah Wilayah"
          actionVariant="brand"
          onAction={handleOpenAdd}
        />
      ) : (
        <div className="bg-surface rounded-card border border-line shadow-card overflow-hidden">
          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-line">
            {regions.map((r) => (
              <article key={r.id} className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-sm font-bold text-content break-words">{r.name}</h2>
                    <p className="text-xs text-content-muted mt-0.5">{r.counterCount || 0} konter terdaftar</p>
                  </div>
                </div>
                {renderActions(r, false)}
              </article>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[460px] text-left text-xs">
              <thead className="bg-surface-muted border-b border-line text-content-muted font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Nama Wilayah</th>
                  <th className="p-3.5">Jumlah Konter Terdaftar</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {regions.map((r) => (
                  <tr key={r.id} className="hover:bg-surface-soft/50 transition-colors">
                    <td className="p-3.5 font-bold text-content text-sm">{r.name}</td>
                    <td className="p-3.5 font-semibold text-content-muted">
                      {r.counterCount || 0} konter
                    </td>
                    <td className="p-3.5 text-right">
                      {renderActions(r, true)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!saveMutation.isPending) setModalOpen(open); }}>
        <DialogContent
          title={editingRegion ? 'Edit Wilayah' : 'Tambah Wilayah Baru'}
          description="Masukkan nama wilayah atau kecamatan."
          maxWidth="max-w-md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (saveMutation.isPending) return;
              saveMutation.mutate({ name });
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
              label="Nama Wilayah"
              required
              placeholder="Contoh: Bandung Wetan"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
      {regionToDelete && (
        <DeleteConfirmDialog
          item={regionToDelete}
          kind="Wilayah"
          endpoint={`/admin/regions/${regionToDelete.id}`}
          details="Wilayah ini akan hilang dari daftar pilihan konter."
          blockedReason={regionToDelete.counterCount > 0 ? `Masih ada ${regionToDelete.counterCount} konter. Pindahkan atau hapus konter tersebut terlebih dahulu.` : ''}
          onClose={() => setRegionToDelete(null)}
          onDeleted={() => {
            showSuccess(`Wilayah ${regionToDelete.name} berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['admin', 'regions'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] });
          }}
        />
      )}
    </div>
  );
}

