import React from 'react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-surface rounded-panel p-8 md:p-12 border border-line shadow-card max-w-md flex flex-col items-center gap-4">
        <span className="text-5xl font-black text-brand-ink">404</span>
        <h1 className="text-xl font-bold text-content">Halaman Tidak Ditemukan</h1>
        <p className="text-xs text-content-muted">
          Halaman yang Anda cari tidak tersedia atau alamat URL telah dipindahkan.
        </p>
        <Button href="/" variant="brand" size="md">
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  );
}

