'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { toDatetimeLocal, fromDatetimeLocal } from '@/lib/datetime';
import { counterPackagesApi, counterPackagesPath, counterPackageKeys } from './paths';
import {
  PUBLICATION_STATUS,
  AVAILABILITY_STATUS,
} from '@konter/shared';

export function PackageForm({ counter, initialData = null, isEdit = false }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    providerId: initialData?.providerId || '',
    name: initialData?.name || '',
    quotaSummary: initialData?.quotaSummary || '',
    quotaDetails: initialData?.quotaDetails || '',
    activePeriod: initialData?.activePeriod || '30 Hari',
    price: initialData?.price !== undefined ? String(initialData.price) : '',
    terms: initialData?.terms || '',
    availabilityStatus: initialData?.availabilityStatus || AVAILABILITY_STATUS.AVAILABLE,
    publicationStatus: initialData?.publicationStatus || PUBLICATION_STATUS.DRAFT,
    displayUntil: toDatetimeLocal(initialData?.displayUntil),
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [savingTarget, setSavingTarget] = useState(null);
  const saving = Boolean(savingTarget);

  const { data: providersData, isLoading: loadingProviders, isError: providersError, refetch: retryProviders } = useQuery({
    queryKey: ['admin', 'providers'],
    queryFn: () => apiClient('/admin/providers'),
  });

  const providers = (providersData?.data || []).filter((p) => p.isActive || p.id === initialData?.providerId);
  const canSave = isEdit || counter.publicationStatus === PUBLICATION_STATUS.PUBLISHED;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (targetStatus) => {
    if (saving || !canSave || loadingProviders || providersError) return;
    const statusToSave = targetStatus || formData.publicationStatus;
    setSavingTarget(statusToSave);
    setGeneralError('');
    setFieldErrors({});

    const parsedPrice = parseInt(formData.price, 10);

    try {
      const payload = {
        ...formData,
        price: isNaN(parsedPrice) ? 0 : parsedPrice,
        publicationStatus: statusToSave,
        displayUntil: fromDatetimeLocal(formData.displayUntil, initialData?.displayUntil),
      };
      if (isEdit) {
        await apiClient(`${counterPackagesApi(counter.id)}/${initialData.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiClient(counterPackagesApi(counter.id), {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: counterPackageKeys.all(counter.id) }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'counters'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] }),
      ]);
      router.push(counterPackagesPath(counter.id));
    } catch (err) {
      if (err.fields) {
        setFieldErrors(err.fields);
      }
      setGeneralError(err.message || 'Gagal menyimpan data paket.');
    } finally {
      setSavingTarget(null);
    }
  };

  return (
    <div className="bg-surface rounded-panel p-6 md:p-8 border border-line shadow-card flex flex-col gap-6 max-w-3xl">
      {providersError && (
        <div role="alert" className="rounded-card bg-danger-soft p-3 text-danger-ink">
          <p>Provider gagal dimuat. Isian paket tetap tersimpan di form.</p>
          <Button variant="outline" size="sm" onClick={() => retryProviders()}>Coba Lagi</Button>
        </div>
      )}

      {generalError && (
        <div role="alert" className="p-3.5 bg-danger-soft text-danger-ink rounded-[10px] text-xs font-semibold border border-danger-ink/20 flex items-center gap-2">
          <Icon name="alert" size={16} className="shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Konter Pemilik"
          value={counter.name}
          readOnly
          hint="Paket ini hanya dikelola di dalam konter ini."
        />

        <Select
          label="Pilih Provider"
          required
          placeholder="Pilih Provider..."
          value={formData.providerId}
          error={fieldErrors.providerId}
          onChange={(e) => handleChange('providerId', e.target.value)}
          options={providers.map((p) => ({ value: p.id, label: p.name }))}
          disabled={saving}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <Input
            label="Nama Paket"
            required
            placeholder="Contoh: InternetMAX 14 GB"
            value={formData.name}
            error={fieldErrors.name}
            onChange={(e) => handleChange('name', e.target.value)}
            disabled={saving}
          />
        </div>
        <div>
          <Input
            label="Harga (Rupiah)"
            required
            type="number"
            min={0}
            placeholder="35000"
            hint="Angka saja tanpa titik, contoh: 35000."
            value={formData.price}
            error={fieldErrors.price}
            onChange={(e) => handleChange('price', e.target.value)}
            disabled={saving}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Ringkasan Kuota"
          required
          placeholder="Contoh: 14 GB"
          hint="Tampil menonjol di kartu paket."
          value={formData.quotaSummary}
          error={fieldErrors.quotaSummary}
          onChange={(e) => handleChange('quotaSummary', e.target.value)}
          disabled={saving}
        />

        <Input
          label="Masa Aktif Paket"
          required
          placeholder="Contoh: 30 Hari atau 7 Hari"
          value={formData.activePeriod}
          error={fieldErrors.activePeriod}
          onChange={(e) => handleChange('activePeriod', e.target.value)}
          disabled={saving}
        />
      </div>

      <Textarea
        label="Rincian Pembagian Kuota"
        placeholder="Contoh: 10 GB Kuota Utama + 4 GB Kuota Lokal 24 Jam..."
        value={formData.quotaDetails}
        error={fieldErrors.quotaDetails}
        onChange={(e) => handleChange('quotaDetails', e.target.value)}
        disabled={saving}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Status Ketersediaan"
          required
          value={formData.availabilityStatus}
          error={fieldErrors.availabilityStatus}
          onChange={(e) => handleChange('availabilityStatus', e.target.value)}
          options={[
            { value: AVAILABILITY_STATUS.AVAILABLE, label: 'Tersedia (Tanya Paket)' },
            { value: AVAILABILITY_STATUS.NEEDS_CONFIRMATION, label: 'Perlu Konfirmasi (Tanya Ketersediaan)' },
            { value: AVAILABILITY_STATUS.UNAVAILABLE, label: 'Habis / Tidak Tersedia' },
          ]}
          disabled={saving}
        />

        <Input
          label="Batas Penayangan (Opsional)"
          type="datetime-local"
          hint="Waktu lokal perangkat. Kosongkan jika paket tayang tanpa batas waktu."
          value={formData.displayUntil}
          error={fieldErrors.displayUntil}
          onChange={(e) => handleChange('displayUntil', e.target.value)}
          disabled={saving}
        />
      </div>

      <Textarea
        label="Syarat & Ketentuan"
        placeholder="Contoh: Khusus nomor prabayar wilayah Jawa Barat..."
        value={formData.terms}
        error={fieldErrors.terms}
        onChange={(e) => handleChange('terms', e.target.value)}
        disabled={saving}
      />

      {/* Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line">
        <Button
          variant="outline"
          size="md"
          onClick={() => router.push(counterPackagesPath(counter.id))}
          disabled={saving}
        >
          Batal
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="md"
            loading={savingTarget === PUBLICATION_STATUS.DRAFT}
            disabled={saving || !canSave || loadingProviders || providersError}
            onClick={() => handleSubmit(PUBLICATION_STATUS.DRAFT)}
          >
            Simpan Draft
          </Button>

          <Button
            variant="brand"
            size="md"
            loading={savingTarget === PUBLICATION_STATUS.PUBLISHED}
            disabled={saving || !canSave || loadingProviders || providersError}
            onClick={() => handleSubmit(PUBLICATION_STATUS.PUBLISHED)}
          >
            {isEdit ? 'Simpan & Terbitkan' : 'Terbitkan Sekarang'}
          </Button>
        </div>
      </div>
    </div>
  );
}

