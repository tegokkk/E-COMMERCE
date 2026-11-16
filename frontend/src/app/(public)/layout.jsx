import React from 'react';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { getPublicSettings } from '@/lib/api-server';

export default async function PublicLayout({ children }) {
  const settingsData = await getPublicSettings();
  const settings = settingsData?.data || {
    platformName: 'KonterKuota',
    managerWhatsapp: null,
  };

  return (
    <div className="min-h-screen bg-transparent text-content flex flex-col overflow-x-hidden">
      <SiteHeader platformName={settings.platformName} />
      <main className="flex-1 w-full min-w-0">{children}</main>
      <SiteFooter
        platformName={settings.platformName}
        managerWhatsapp={settings.managerWhatsapp}
        publicContactEmail={settings.publicContactEmail}
      />
    </div>
  );
}
