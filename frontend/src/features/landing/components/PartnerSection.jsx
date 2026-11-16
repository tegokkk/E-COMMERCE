'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { trackEvent } from '@/features/analytics/track-event';
import { generatePartnerSignupMessage, createWhatsAppUrl } from '@/lib/whatsapp';

export function PartnerSection({ managerWhatsapp = null, platformName = 'KonterKuota' }) {
  const handlePartnerClick = () => {
    if (!managerWhatsapp) return;
    trackEvent('partner_signup_clicked', { buttonPosition: 'partner_section' });
    const msg = generatePartnerSignupMessage({ platformName });
    const url = createWhatsAppUrl(managerWhatsapp, msg);
    window.location.href = url;
  };

  return (
    <section id="mitra" className="scroll-mt-24 py-10 md:py-12">
      <div className="bg-brand-soft rounded-panel p-6 sm:p-8 md:p-10 border border-line-warm shadow-card flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex flex-col gap-3 max-w-xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-content tracking-tight">
            Daftarkan Konter ke Direktori
          </h2>
          <p className="text-sm text-content-muted leading-relaxed">
            Bantu calon pembeli di wilayahmu menemukan tokomu dan melihat daftar paket kuota yang kamu sediakan.
          </p>
          <ul className="flex flex-col gap-2 text-xs text-content font-medium mt-1">
            <li className="flex items-center gap-2">
              <Icon name="check" size={16} className="text-whatsapp shrink-0" />
              <span>Tampil pada pencarian wilayah dan provider</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon name="check" size={16} className="text-whatsapp shrink-0" />
              <span>Pembeli langsung menghubungi WhatsApp tokomu</span>
            </li>
            <li className="flex items-center gap-2">
              <Icon name="check" size={16} className="text-whatsapp shrink-0" />
              <span>Pembaruan informasi paket dibantu oleh tim kami</span>
            </li>
          </ul>
        </div>

        <div className="shrink-0 flex flex-col items-center gap-2 w-full sm:w-auto">
          <Button
            variant="whatsapp"
            size="lg"
            icon="whatsapp"
            onClick={handlePartnerClick}
            disabled={!managerWhatsapp}
            className="w-full sm:w-auto"
          >
            {managerWhatsapp ? 'Daftar lewat WhatsApp' : 'Pendaftaran Belum Dibuka'}
          </Button>
          <span className="text-xs text-content-muted text-center">
            {managerWhatsapp ? 'Siapkan nama, alamat, dan nomor WhatsApp tokomu' : 'Kontak pendaftaran belum aktif'}
          </span>
        </div>
      </div>
    </section>
  );
}
