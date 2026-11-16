'use client';

import React from 'react';
import Link from 'next/link';
import { CounterForm } from '@/features/admin/counters/CounterForm';

export default function NewCounterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/konter" className="text-xs font-semibold text-brand-ink hover:underline mb-2 inline-block">
          ← Kembali ke Daftar Konter
        </Link>
        <h1 className="text-2xl font-extrabold text-content">Tambah Konter Baru</h1>
        <p className="text-xs text-content-muted mt-1">
          Masukkan informasi usaha, alamat, dan kontak WhatsApp konter kuota.
        </p>
      </div>

      <CounterForm />
    </div>
  );
}

