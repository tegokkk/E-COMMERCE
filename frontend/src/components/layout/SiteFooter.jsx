'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function SiteFooter({ platformName = 'KonterKuota', managerWhatsapp = null, publicContactEmail = null }) {
  const currentYear = new Date().getFullYear();
  const router = useRouter();
  const tapCountRef = useRef(0);
  const resetTimerRef = useRef(null);

  const handleCopyrightTap = () => {
    tapCountRef.current += 1;
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      router.push('/admin/login');
      return;
    }
    resetTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 2000);
  };

  return (
    <footer className="bg-chrome border-t border-line mt-auto py-12 px-4 md:px-8 text-sm">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        {/* Brand Col */}
        <div className="flex flex-col gap-3 md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full ring-2 ring-brand overflow-hidden shrink-0">
              <Image
                src="/images/brand-logo.png"
                alt="Logo"
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-extrabold text-lg text-content">{platformName}</span>
          </div>
          <p className="text-content-muted text-sm max-w-sm">
            Cari konter berdasarkan wilayah, lihat paket dan harganya, lalu hubungi penjual lewat WhatsApp.
          </p>
        </div>

        {/* Quick links */}
        <div className="flex flex-col gap-1">
          <span className="font-bold text-content text-sm">Navigasi</span>
          <Link href="/#direktori" className="text-content-muted hover:text-content transition-colors min-h-[44px] flex items-center">
            Direktori Konter
          </Link>
          <Link href="/#cara-beli" className="text-content-muted hover:text-content transition-colors min-h-[44px] flex items-center">
            Cara Cek Paket
          </Link>
          <Link href="/#mitra" className="text-content-muted hover:text-content transition-colors min-h-[44px] flex items-center">
            Daftar Konter
          </Link>
          <Link href="/#faq" className="text-content-muted hover:text-content transition-colors min-h-[44px] flex items-center">
            FAQ
          </Link>
        </div>

        {/* Legal & Contacts */}
        <div className="flex flex-col gap-1">
          <span className="font-bold text-content text-sm">Bantuan</span>
          <Link href="/privasi" className="text-content-muted hover:text-content transition-colors min-h-[44px] flex items-center">
            Kebijakan Privasi
          </Link>
          {managerWhatsapp && (
            <a
              href={`https://wa.me/${managerWhatsapp}?text=${encodeURIComponent(`Halo ${platformName}, saya mau tanya soal direktori konter.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-content-muted hover:text-content transition-colors min-h-[44px] flex items-center"
            >
              Chat kami
            </a>
          )}
          {publicContactEmail && (
            <a href={`mailto:${publicContactEmail}`} className="text-content-muted hover:text-content transition-colors min-h-[44px] flex items-center">
              Email kami
            </a>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-content-muted">
        <p onClick={handleCopyrightTap} className="select-none cursor-default">
          © {currentYear} {platformName}
        </p>
        <p>Transaksi langsung antara kamu dan penjual. Kami hanya direktori.</p>
      </div>
    </footer>
  );
}

