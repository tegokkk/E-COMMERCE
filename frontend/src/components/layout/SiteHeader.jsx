'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';

export function SiteHeader({ platformName = 'KonterKuota' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', href: '/#hero', icon: 'store' },
    { label: 'Direktori', href: '/#direktori', icon: 'layers' },
    { label: 'Cara Beli', href: '/#cara-beli', icon: 'help' },
    { label: 'Daftar Konter', href: '/#mitra', icon: 'store' },
    { label: 'FAQ', href: '/#faq', icon: 'info' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-chrome/90 backdrop-blur-md border-b border-line/60 px-4 md:px-8 py-3 transition-all select-none">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group shrink-0 min-h-[44px]">
          <div className="w-10 h-10 rounded-full ring-2 ring-brand shadow-xs transition-transform group-hover:scale-105 overflow-hidden">
            <Image
              src="/images/brand-logo.png"
              alt="Logo KonterKuota"
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-base md:text-lg text-content tracking-tight leading-none group-hover:text-brand-ink transition-colors">
              {platformName}
            </span>
            <span className="text-[11px] text-content-muted font-medium hidden sm:inline">
              Cari konter di wilayahmu
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-sm font-semibold text-content-muted">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] rounded-[10px] hover:text-brand-ink hover:bg-surface-soft transition-all active:scale-95"
            >
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        {/* Desktop Right Actions */}
        <div className="hidden lg:flex items-center">
          <Button href="/#direktori" variant="brand" size="sm" icon="search">
            Cari Konter
          </Button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <div className="flex lg:hidden items-center gap-2">
          <Button href="/#direktori" variant="brand" size="sm" icon="search" className="!px-3 !py-1.5 !text-xs">
            Cari
          </Button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-content hover:bg-surface-muted rounded-[10px] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label={mobileMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
            aria-expanded={mobileMenuOpen}
          >
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-3 flex flex-col gap-1 bg-chrome/95 backdrop-blur-md rounded-card p-3 border border-line/70 shadow-card animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-[12px] text-sm font-semibold text-content hover:bg-surface-soft hover:text-brand-ink transition-colors min-h-[44px]"
            >
              <Icon name={item.icon} size={18} className="text-brand-ink" />
              <span>{item.label}</span>
            </a>
          ))}

          <div className="pt-2 mt-1 border-t border-line/60">
            <Link
              href="/privasi"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-2.5 rounded-[12px] text-xs font-medium text-content-muted hover:text-content hover:bg-surface-soft transition-colors min-h-[44px]"
            >
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
