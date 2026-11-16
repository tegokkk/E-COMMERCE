import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata = {
  alternates: { canonical: '/privasi' },
  title: 'Kebijakan Privasi — KonterKuota',
  description: 'Penjelasan kebijakan privasi dan perlindungan data di platform KonterKuota.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-10">
      <div className="bg-surface rounded-panel p-6 md:p-10 border border-line shadow-card flex flex-col gap-6">
        <div>
          <Link href="/" className="text-xs font-semibold text-brand-ink hover:underline mb-3 inline-block">
            ← Kembali ke Beranda
          </Link>
          <h1 className="text-2xl md:text-3xl font-extrabold text-content">
            Kebijakan Privasi KonterKuota
          </h1>
          <p className="text-xs text-content-muted mt-1">Terakhir diperbarui: 6 November 2026</p>
        </div>

        <div className="flex flex-col gap-5 text-sm text-content-muted leading-relaxed">
          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-content">1. Informasi Usaha Konter</h2>
            <p>
              Data konter yang diterbitkan pada direktori mencakup nama usaha, alamat toko, jam operasional, dan katalog paket data. Pengunjung dapat membuka WhatsApp usaha melalui tombol kontak. Pemilik usaha dapat meminta perubahan atau penarikan data melalui pengelola.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-content">2. Transaksi dan Komunikasi</h2>
            <p>
              Platform KonterKuota tidak memproses transaksi pembayaran maupun pengisian kuota di dalam website. Ketika pengunjung mengklik tombol WhatsApp, percakapan dan kesepakatan transaksi dilakukan secara langsung antara pembeli dan pemilik konter pada aplikasi WhatsApp.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-content">3. Pengukuran Penggunaan Situs</h2>
            <p>
              Kami menghitung interaksi seperti penggunaan pencarian dan klik tombol WhatsApp dengan ID acak yang disimpan per tab browser. Catatan analitik tidak berisi nomor telepon pengunjung, isi pesan WhatsApp, atau kata kunci pencarian. Event yang berumur lebih dari 90 hari dijadwalkan untuk dihapus.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-content">4. Kontak Pengelola</h2>
            <p>
              Jika Anda adalah pemilik konter yang ingin memperbarui atau menarik data usaha dari direktori, hubungi pengelola melalui kontak yang tercantum di footer website.
            </p>
          </section>
        </div>

        <div className="pt-6 border-t border-line">
          <Button href="/" variant="brand" size="md">
            Kembali ke Direktori Konter
          </Button>
        </div>
      </div>
    </div>
  );
}

