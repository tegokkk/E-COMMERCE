'use client';

import React from 'react';
import { Icon } from '@/components/ui/Icon';

export function HowToBuySection() {
  const steps = [
    {
      number: '1',
      title: 'Cari Konter',
      description: 'Pilih wilayah atau ketik nama daerah untuk menemukan konter terdekat.',
      icon: 'search',
    },
    {
      number: '2',
      title: 'Pilih Paket',
      description: 'Bandingkan kuota, masa aktif, dan harga paket sesuai kebutuhanmu.',
      icon: 'package',
    },
    {
      number: '3',
      title: 'Hubungi Penjual',
      description: 'Klik tombol WhatsApp untuk konfirmasi ketersediaan dan transaksi langsung.',
      icon: 'whatsapp',
    },
  ];

  return (
    <section id="cara-beli" className="scroll-mt-24 py-10 md:py-12 border-t border-line">
      <div className="flex flex-col gap-2 text-center max-w-xl mx-auto mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-content tracking-tight">
          Cara Cek dan Beli Paket
        </h2>
        <p className="text-sm text-content-muted">
          Tiga langkah praktis menemukan paket kuota di wilayahmu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((step) => (
          <div
            key={step.number}
            className="bg-surface rounded-card p-6 border border-line shadow-card flex flex-col gap-4 relative overflow-hidden transition-all duration-200 hover:border-brand-ink/40 hover:shadow-panel"
          >
            <div className="flex items-center justify-between">
              <div className="w-11 h-11 rounded-control bg-brand-soft text-brand-ink flex items-center justify-center font-bold">
                <Icon name={step.icon} size={22} />
              </div>
              <span className="text-2xl font-black text-brand-ink/20 font-mono">
                0{step.number}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-content mb-1">{step.title}</h3>
              <p className="text-xs text-content-muted leading-relaxed">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
