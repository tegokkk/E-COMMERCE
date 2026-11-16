'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export default function GlobalError({ reset }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-surface rounded-panel p-8 md:p-12 border border-danger-ink/20 shadow-card max-w-md flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-danger-soft text-danger-ink flex items-center justify-center">
          <Icon name="alert" size={28} />
        </div>
        <h1 className="text-xl font-bold text-content">Terjadi Kendala Teknis</h1>
        <p className="text-xs text-content-muted">
          Data belum dapat dimuat. Periksa koneksi Anda, lalu coba lagi.
        </p>
        <Button variant="brand" size="md" onClick={() => reset()}>
          Muat Ulang Halaman
        </Button>
      </div>
    </div>
  );
}

