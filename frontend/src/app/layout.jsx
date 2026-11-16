import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Providers from './providers';
import { GlyphBackground } from '@/components/ui/backgrounds-glyph';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const metadata = {
  title: 'KonterKuota — Direktori Paket Kuota Internet UMKM',
  description:
    'Cari konter berdasarkan wilayah, lihat paket internet yang ditampilkan, lalu tanyakan ketersediaan kepada penjual lewat WhatsApp.',
  metadataBase: new URL(process.env.SITE_URL || 'http://localhost:3000'),
  icons: {
    icon: '/images/brand-logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen bg-canvas text-content antialiased flex flex-col relative">
        <GlyphBackground
          className="fixed inset-0 z-0 pointer-events-none"
          glowColor="#3B82F6"
          shapeColor="#FACC15"
          fontSize={11}
          interactive={true}
        />
        <div className="relative z-10 flex min-h-screen flex-col">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}

