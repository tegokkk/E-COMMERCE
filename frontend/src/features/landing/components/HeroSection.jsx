'use client';

import React from 'react';
import { HeroSection as HeroSectionTemplate } from '@/components/ui/hero-section-2';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

function renderHighlightedTitle(text) {
  if (!text || typeof text !== 'string') return text;
  const keyword = 'Wilayahmu';
  const index = text.indexOf(keyword);
  if (index === -1) return text;

  const before = text.slice(0, index);
  const after = text.slice(index + keyword.length);

  return (
    <>
      {before}
      <span className="text-brand">{keyword}</span>
      {after}
    </>
  );
}

export function HeroSection({
  platformName = 'KonterKuota',
  title = 'Cari Paket Data di Wilayahmu',
  subtitle = 'Temukan konter, lihat harga paket, dan hubungi penjual lewat WhatsApp.',
  initialSearch = '',
  pilotRegion = null,
  managerWhatsapp = null,
  publicContactEmail = null,
}) {
  return (
    <HeroSectionTemplate
      id="hero"
      aria-labelledby="hero-title"
      className="mt-4 md:mt-6"
      logo={{
        url: '/images/brand-logo.png',
        alt: `Logo ${platformName}`,
        text: platformName,
      }}
      slogan="CONNECT • PAY • GO"
      title={renderHighlightedTitle(title)}
      subtitle={subtitle}
      callToAction={{
        text: 'LIHAT DAFTAR KONTER →',
        href: '#direktori',
      }}
      backgroundImage="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80"
      contactInfo={{
        website: publicContactEmail || 'konterkuota.id',
        phone: managerWhatsapp || 'Hubungi via WhatsApp',
        address: pilotRegion || 'Jangkauan Indonesia',
      }}
    >
      <form
        action="/#direktori"
        method="get"
        role="search"
        aria-label="Cari konter dan paket"
        className="w-full max-w-lg"
      >
        <label htmlFor="hero-search" className="sr-only">
          Nama konter, paket, atau wilayah
        </label>
        <div className="flex items-center gap-2 rounded-control border border-line bg-surface-soft p-1.5 shadow-sm transition-all focus-within:border-brand-ink/60 focus-within:ring-2 focus-within:ring-brand-ink/30">
          <Icon name="search" size={20} className="ml-2.5 shrink-0 text-brand-ink" />
          <input
            id="hero-search"
            name="q"
            type="search"
            maxLength={100}
            defaultValue={initialSearch}
            placeholder="Cari konter, paket, atau wilayah..."
            className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-content placeholder:text-content-muted focus:outline-none"
          />
          <Button type="submit" variant="brand" size="md" className="shrink-0">
            Cari
          </Button>
        </div>
        <p className="mt-2 text-xs text-content-muted">
          Contoh: Coblong, Telkomsel, atau 10 GB
        </p>
      </form>
    </HeroSectionTemplate>
  );
}
