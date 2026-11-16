import React from 'react';
import { apiServer, getPublicSettings } from '@/lib/api-server';
import { HeroSection } from '@/features/landing/components/HeroSection';
import { CounterDirectory } from '@/features/directory/components/CounterDirectory';
import { HowToBuySection } from '@/features/landing/components/HowToBuySection';
import { PartnerSection } from '@/features/landing/components/PartnerSection';
import { FaqSection } from '@/features/landing/components/FaqSection';
import { AnalyticsTracker } from '@/features/analytics/AnalyticsTracker';

export const metadata = {
  alternates: { canonical: '/' },
  title: 'KonterKuota — Direktori Paket Kuota Internet UMKM',
  description:
    'Cari konter pulsa dan paket data berdasarkan wilayah. Lihat rincian yang ditampilkan lalu hubungi penjual melalui WhatsApp.',
};

export default async function HomePage({ searchParams }) {
  const query = await searchParams;
  const initialSearch = typeof query?.q === 'string' ? query.q.trim().slice(0, 100) : '';
  // Fetch initial data on the server for instant SSR HTML & SEO (PRD FR-01 / TECH_STACK 3.1)
  const [settingsRes, providersRes, locationsRes, countersRes] = await Promise.all([
    getPublicSettings(),
    apiServer('/public/providers'),
    apiServer('/public/locations'),
    apiServer('/public/counters?page=1&limit=12'),
  ]);

  const settings = settingsRes?.data || {
    platformName: 'KonterKuota',
    heroTitle: 'Cari Paket Data di Wilayahmu',
    heroSubtitle: 'Temukan konter, lihat harga paket, dan hubungi penjual lewat WhatsApp.',
    managerWhatsapp: null,
    faqs: [],
  };

  const providers = providersRes?.data || [];
  const locations = locationsRes?.data || [];
  const initialCounters = countersRes;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex flex-col gap-12 pb-16">
      <AnalyticsTracker />

      {/* Hero Section */}
      <HeroSection
        platformName={settings.platformName}
        title={settings.heroTitle}
        subtitle={settings.heroSubtitle}
        initialSearch={initialSearch}
        pilotRegion={settings.pilotRegion}
        managerWhatsapp={settings.managerWhatsapp}
        publicContactEmail={settings.publicContactEmail}
      />

      {initialCounters.data.some((counter) => counter.isDemo) && (
        <p className="rounded-card border border-warning-ink/30 bg-warning-soft p-4 text-sm text-warning-ink" role="note">
          Ini data contoh untuk pengembangan. Harga, alamat, dan kontak konter di bawah bukan penawaran nyata.
        </p>
      )}

      {/* Directory Section */}
      <CounterDirectory
        key={initialSearch}
        initialSearch={initialSearch}
        initialData={initialCounters}
        initialProviders={providers}
        initialLocations={locations}
      />

      {/* How To Buy */}
      <HowToBuySection />

      {/* Partner Section */}
      <PartnerSection
        managerWhatsapp={settings.managerWhatsapp}
        platformName={settings.platformName}
      />

      {/* FAQ */}
      <FaqSection faqs={settings.faqs} />
    </div>
  );
}

