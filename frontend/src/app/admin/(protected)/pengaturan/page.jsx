'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => apiClient('/admin/settings'),
  });

  const [formData, setFormData] = useState({
    platformName: '',
    heroTitle: '',
    heroSubtitle: '',
    logoUrl: '',
    description: '',
    managerWhatsapp: '',
    publicContactEmail: '',
    pilotRegion: '',
    faqs: [],
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (data?.data) {
      setFormData({
        platformName: data.data.platformName || '',
        heroTitle: data.data.heroTitle || '',
        heroSubtitle: data.data.heroSubtitle || '',
        logoUrl: data.data.logoUrl || '',
        description: data.data.description || '',
        managerWhatsapp: data.data.managerWhatsapp || '',
        publicContactEmail: data.data.publicContactEmail || '',
        pilotRegion: data.data.pilotRegion || '',
        faqs: Array.isArray(data.data.faqs) ? data.data.faqs : [],
      });
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      apiClient('/admin/settings', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: (res) => {
      queryClient.setQueryData(['admin', 'settings'], res);
      queryClient.invalidateQueries({ queryKey: ['directory', 'settings'] });
      setSuccessMsg('Pengaturan platform berhasil diperbarui.');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (err) => {
      setErrorMsg(err.message || 'Gagal menyimpan pengaturan.');
    },
  });

  const handleFaqChange = (index, field, value) => {
    const updated = [...formData.faqs];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, faqs: updated }));
  };

  const handleAddFaq = () => {
    setFormData((prev) => ({
      ...prev,
      faqs: [...prev.faqs, { question: '', answer: '' }],
    }));
  };

  const handleRemoveFaq = (index) => {
    setFormData((prev) => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (saveMutation.isPending) return;
    setSuccessMsg('');
    setErrorMsg('');
    saveMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Gagal Memuat Pengaturan"
        message="Tidak dapat mengambil pengaturan platform dari server."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl min-w-0">
      <div>
        <h1 className="text-2xl font-extrabold text-content">Pengaturan Platform</h1>
        <p className="text-xs text-content-muted mt-1">
          Identitas merek, nomor WhatsApp pengelola mitra, teks hero, dan daftar FAQ publik.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface rounded-panel p-5 sm:p-6 md:p-8 border border-line shadow-card flex flex-col gap-6">
        {successMsg && (
          <div role="status" className="p-3.5 bg-success-soft text-success-ink rounded-[10px] text-xs font-semibold border border-success-ink/20 flex items-center gap-2">
            <Icon name="check" size={16} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div role="alert" className="p-3.5 bg-danger-soft text-danger-ink rounded-[10px] text-xs font-semibold border border-danger-ink/20 flex items-center gap-2">
            <Icon name="alert" size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Nama Platform"
            required
            value={formData.platformName}
            onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
            disabled={saveMutation.isPending}
          />
          <Input
            label="Wilayah Pilot Utama"
            required
            value={formData.pilotRegion}
            onChange={(e) => setFormData({ ...formData, pilotRegion: e.target.value })}
            disabled={saveMutation.isPending}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
          <Input
            label="Nomor WhatsApp Pengelola (Opsional)"
            placeholder="08123456789"
            hint="Tombol pendaftaran dan kontak pengelola hanya aktif setelah nomor asli diisi."
            value={formData.managerWhatsapp}
            onChange={(e) => setFormData({ ...formData, managerWhatsapp: e.target.value })}
            disabled={saveMutation.isPending}
          />
          <Input
            label="Email Kontak Publik (Opsional)"
            type="email"
            placeholder="halo@konterkuota.id"
            value={formData.publicContactEmail}
            onChange={(e) => setFormData({ ...formData, publicContactEmail: e.target.value })}
            disabled={saveMutation.isPending}
          />
        </div>

        <Input
          label="Judul Utama Hero (H1)"
          value={formData.heroTitle}
          onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
          disabled={saveMutation.isPending}
        />

        <Textarea
          label="Subjudul Hero"
          value={formData.heroSubtitle}
          onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
          disabled={saveMutation.isPending}
        />

        {/* FAQ Section Editor */}
        <div className="flex flex-col gap-4 pt-4 border-t border-line">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-content flex items-center gap-2">
              <Icon name="help" size={18} className="text-brand-ink" />
              <span>Daftar Pertanyaan Umum (FAQ)</span>
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon="plus"
              onClick={handleAddFaq}
              disabled={saveMutation.isPending}
            >
              Tambah Pertanyaan
            </Button>
          </div>

          <div className="flex flex-col gap-4">
            {formData.faqs.length === 0 ? (
              <div className="p-6 rounded-card bg-surface-muted/40 border border-dashed border-line text-center text-xs text-content-muted">
                Belum ada pertanyaan umum. Klik &ldquo;Tambah Pertanyaan&rdquo; untuk menambahkan FAQ.
              </div>
            ) : (
              formData.faqs.map((faq, idx) => (
                <div key={idx} className="p-4 rounded-card bg-surface-muted/60 border border-line flex flex-col gap-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-content-muted">Pertanyaan #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFaq(idx)}
                      disabled={saveMutation.isPending}
                      className="px-2.5 py-1 min-h-[36px] rounded-[8px] text-danger-ink hover:bg-danger-soft transition-colors text-xs font-bold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-ink/40 disabled:opacity-50"
                      aria-label={`Hapus Pertanyaan #${idx + 1}`}
                    >
                      Hapus
                    </button>
                  </div>
                  <Input
                    label="Pertanyaan"
                    placeholder="Tuliskan pertanyaan..."
                    value={faq.question}
                    onChange={(e) => handleFaqChange(idx, 'question', e.target.value)}
                    disabled={saveMutation.isPending}
                  />
                  <Textarea
                    label="Jawaban"
                    rows={2}
                    placeholder="Tuliskan jawaban..."
                    value={faq.answer}
                    onChange={(e) => handleFaqChange(idx, 'answer', e.target.value)}
                    disabled={saveMutation.isPending}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-line flex justify-end">
          <Button type="submit" variant="brand" size="lg" loading={saveMutation.isPending}>
            Simpan Pengaturan Platform
          </Button>
        </div>
      </form>
    </div>
  );
}

