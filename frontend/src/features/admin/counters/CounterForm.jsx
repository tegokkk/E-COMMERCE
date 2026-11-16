'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Input, Textarea } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { PUBLICATION_STATUS, isAllowedPhotoUrl, INDONESIA_PROVINCES, getCitiesByProvince } from '@konter/shared';

export function CounterForm({ initialData = null, isEdit = false }) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    photoUrl: initialData?.photoUrl || '',
    province: initialData?.province || '',
    city: initialData?.city || '',
    regionId: initialData?.regionId || '',
    address: initialData?.address || '',
    mapUrl: initialData?.mapUrl || '',
    whatsapp: initialData?.whatsapp || '',
    operatingHours: initialData?.operatingHours || '',
    publicationStatus: initialData?.publicationStatus || PUBLICATION_STATUS.DRAFT,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [savingTarget, setSavingTarget] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [photoRemovalPending, setPhotoRemovalPending] = useState(false);
  const saving = Boolean(savingTarget);

  // Fetch regions for dropdown
  const { data: regionsData } = useQuery({
    queryKey: ['admin', 'regions'],
    queryFn: () => apiClient('/admin/regions'),
  });

  const regions = regionsData?.data || [];
  const availableCities = getCitiesByProvince(formData.province);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === 'photoUrl' && value) setPhotoRemovalPending(false);
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleProvinceChange = (province) => {
    setFormData((prev) => ({
      ...prev,
      province,
      city: '',
    }));
    if (fieldErrors.province) setFieldErrors((prev) => ({ ...prev, province: undefined }));
    if (fieldErrors.city) setFieldErrors((prev) => ({ ...prev, city: undefined }));
  };

  const handleSubmit = async (targetStatus) => {
    if (uploading || saving) return;
    const statusToSave = targetStatus || formData.publicationStatus;
    setSavingTarget(statusToSave);
    setGeneralError('');
    setFieldErrors({});

    const payload = {
      ...formData,
      regionId: formData.regionId || null,
      publicationStatus: statusToSave,
    };

    try {
      if (isEdit) {
        await apiClient(`/admin/counters/${initialData.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiClient('/admin/counters', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'counters'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'overview'] }),
      ]);
      router.push('/admin/konter');
    } catch (err) {
      if (err.fields) {
        setFieldErrors(err.fields);
      }
      setGeneralError(err.message || 'Gagal menyimpan data konter.');
    } finally {
      setSavingTarget(null);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploadError('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 4 * 1024 * 1024 || file.size === 0) {
      setUploadError('Pilih foto JPG, PNG, atau WebP maksimal 4 MB.');
      return;
    }
    setUploading(true);
    try {
      const response = await apiClient('/admin/uploads/counter-photo', {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      });
      handleChange('photoUrl', response.data.photoUrl);
    } catch (error) {
      setUploadError(error.message || 'Foto gagal diunggah.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-surface rounded-panel p-6 md:p-8 border border-line shadow-card flex flex-col gap-6 max-w-3xl">
      {generalError && (
        <div role="alert" className="p-3.5 bg-danger-soft text-danger-ink rounded-[10px] text-xs font-semibold border border-danger-ink/20 flex items-center gap-2">
          <Icon name="alert" size={16} className="shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Baris 1: Nama Konter & Nomor WhatsApp */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Nama Konter"
          required
          placeholder="Contoh: Berkah Cell"
          value={formData.name}
          error={fieldErrors.name}
          onChange={(e) => handleChange('name', e.target.value)}
          disabled={saving}
        />

        <Input
          label="Nomor WhatsApp Usaha"
          required
          placeholder="Contoh: 081234567890"
          hint="Gunakan awalan 08 atau 628, contoh: 081234567890."
          value={formData.whatsapp}
          error={fieldErrors.whatsapp}
          onChange={(e) => handleChange('whatsapp', e.target.value)}
          disabled={saving}
        />
      </div>

      {/* Baris 2: Lokasi Seluruh Indonesia (Provinsi, Kota/Kabupaten, Wilayah) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Select
          label="Provinsi"
          required
          placeholder="Pilih Provinsi..."
          value={formData.province}
          error={fieldErrors.province}
          onChange={(e) => handleProvinceChange(e.target.value)}
          options={INDONESIA_PROVINCES.map((p) => ({ value: p, label: p }))}
          disabled={saving}
        />

        <Select
          label="Kota / Kabupaten"
          required
          placeholder={formData.province ? "Pilih Kota / Kabupaten..." : "Pilih Provinsi dahulu"}
          value={formData.city}
          error={fieldErrors.city}
          onChange={(e) => handleChange('city', e.target.value)}
          options={availableCities.map((c) => ({ value: c, label: c }))}
          disabled={saving || !formData.province}
        />

        <Select
          label="Kecamatan / Wilayah"
          placeholder="Pilih Wilayah (Opsional)..."
          value={formData.regionId}
          error={fieldErrors.regionId}
          onChange={(e) => handleChange('regionId', e.target.value)}
          options={regions.map((r) => ({ value: r.id, label: r.name }))}
          disabled={saving}
        />
      </div>

      {/* Baris 3: Jam Operasional */}
      <div>
        <Input
          label="Jam Operasional"
          placeholder="Contoh: 08:00 - 22:00 WIB"
          value={formData.operatingHours}
          error={fieldErrors.operatingHours}
          onChange={(e) => handleChange('operatingHours', e.target.value)}
          disabled={saving}
        />
      </div>

      <Textarea
        label="Alamat Lengkap Usaha"
        required
        placeholder="Nama jalan, nomor ruko/toko, patokan lokasi..."
        value={formData.address}
        error={fieldErrors.address}
        onChange={(e) => handleChange('address', e.target.value)}
        disabled={saving}
      />

      <Textarea
        label="Deskripsi Toko / Layanan"
        placeholder="Penjelasan produk pulsa, kartu perdana, atau spesialisasi kuota..."
        value={formData.description}
        error={fieldErrors.description}
        onChange={(e) => handleChange('description', e.target.value)}
        disabled={saving}
      />

      <div className="flex flex-col gap-3 rounded-card border border-line p-4">
        <div>
          <label htmlFor="counter-photo" className="block text-sm font-semibold text-content">Foto Konter</label>
          <p className="text-xs text-content-muted mt-1">JPG, PNG, atau WebP maksimal 4 MB. Foto akan dirapikan otomatis.</p>
        </div>
        {formData.photoUrl && isAllowedPhotoUrl(formData.photoUrl) && (
          <div className="relative h-40 w-full max-w-64 overflow-hidden rounded-card bg-surface-muted">
            <Image src={formData.photoUrl} alt="Pratinjau foto konter" fill sizes="256px" className="object-cover" />
          </div>
        )}
        <input
          id="counter-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoUpload}
          disabled={saving || uploading}
          className="block w-full text-sm text-content file:mr-3 file:min-h-11 file:cursor-pointer file:rounded-card file:border file:border-line file:bg-surface-soft file:px-4 file:text-content focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
        />
        {uploading && <p role="status" className="text-xs text-content-muted">Mengunggah foto...</p>}
        {uploadError && <p role="alert" className="text-xs text-danger-ink">{uploadError}</p>}
        {fieldErrors.photoUrl && <p role="alert" className="text-xs text-danger-ink">{fieldErrors.photoUrl}</p>}
        {formData.photoUrl && <Button variant="outline" size="sm" className="self-start" disabled={saving || uploading} onClick={() => { handleChange('photoUrl', ''); setPhotoRemovalPending(true); }}>Hapus Foto</Button>}
        {photoRemovalPending && <p role="status" className="text-xs text-content-muted">Simpan perubahan untuk menghapus foto dari profil konter.</p>}
        <Input
          label="Atau masukkan URL foto"
          placeholder="https://... atau /images/counters/..."
          value={formData.photoUrl}
          onChange={(e) => handleChange('photoUrl', e.target.value)}
          disabled={saving || uploading}
        />
      </div>
      <div>
        <Input
          label="URL Google Maps Toko"
          placeholder="https://maps.google.com/?q=..."
          hint="Opsional. Gunakan tautan resmi Google Maps (maps.google.com atau maps.app.goo.gl)."
          value={formData.mapUrl}
          error={fieldErrors.mapUrl}
          onChange={(e) => handleChange('mapUrl', e.target.value)}
          disabled={saving}
        />
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-line">
        <Button
          variant="outline"
          size="md"
          onClick={() => router.back()}
          disabled={saving}
        >
          Batal
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="md"
            loading={savingTarget === PUBLICATION_STATUS.DRAFT}
            disabled={uploading || saving}
            onClick={() => handleSubmit(PUBLICATION_STATUS.DRAFT)}
          >
            Simpan Sebagai Draft
          </Button>

          <Button
            variant="brand"
            size="md"
            loading={savingTarget === PUBLICATION_STATUS.PUBLISHED}
            disabled={uploading || saving}
            onClick={() => handleSubmit(PUBLICATION_STATUS.PUBLISHED)}
          >
            {isEdit ? 'Simpan & Terbitkan' : 'Terbitkan Sekarang'}
          </Button>
        </div>
      </div>
    </div>
  );
}

