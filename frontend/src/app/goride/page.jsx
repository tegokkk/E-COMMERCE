import { Inter, Inter_Tight } from 'next/font/google';
import GoRide from '@/components/ui/goride';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-inter-tight',
  display: 'swap',
});

export const metadata = {
  title: 'GoRide — Interactive City Map Hero',
  description: 'Interactive ride-hailing hero demo with live city map, phone lens, and hold-to-book flow.',
  robots: { index: false, follow: false },
};

const avatarSvg = (bg, initials) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 112 112"><rect width="112" height="112" rx="56" fill="${bg}"/><text x="56" y="60" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif" font-size="38" font-weight="700" fill="#14161B">${initials}</text></svg>`
  )}`;

const DEMO_PROPS = {
  brand: { name: 'GoRide', href: '/goride' },
  tagline: 'Your city, one tap away.',
  nav: {
    links: [
      { label: 'Ride', href: '#gr-title' },
      { label: 'Drive', href: '#gr-title' },
      { label: 'Cities', href: '#gr-title' },
      { label: 'Safety', href: '#gr-title' },
    ],
    signIn: { label: 'Beranda', href: '/' },
    cta: { label: 'Get the app', hover: 'Ride now', href: '#gr-title' },
  },
  copy: {
    headline: 'The city,',
    phrases: ['in your hand.', 'on your schedule.', 'five minutes away.'],
    phraseEvery: 2.8,
    lede: 'Tap any street on the map to set a drop-off, hold Book on the phone, and watch the nearest driver come to you.',
    primary: { label: 'Book a ride', hover: 'Let’s roll', href: '#gr-title' },
    secondary: { label: 'Drive with us', href: '#gr-title' },
    stores: [
      { id: 'ios', label: 'iOS', href: '#gr-title' },
      { id: 'android', label: 'Android', href: '#gr-title' },
    ],
    rating: '4.9',
    ratingNote: 'from 120k+ rides',
    stat: { value: '3 min', label: 'avg. pickup' },
    riders: [
      { name: 'Rina', src: avatarSvg('#FDEFC8', 'RN') },
      { name: 'Dimas', src: avatarSvg('#DCE5E9', 'DM') },
      { name: 'Sari', src: avatarSvg('#E1E6D3', 'SR') },
      { name: 'Budi', src: avatarSvg('#EFE8DC', 'BD') },
    ],
  },
  live: {
    cities: [
      { name: 'Bandung', rides: 1284 },
      { name: 'Jakarta', rides: 4820 },
      { name: 'Surabaya', rides: 2150 },
      { name: 'Yogyakarta', rides: 940 },
    ],
    every: 3.2,
  },
  driver: {
    name: 'Alex Pratama',
    initials: 'AP',
    rating: '4.9',
    trips: '2,410 trips',
    plate: 'D 1428 KQ',
    pin: '4829',
  },
  payment: {
    method: 'Apple Pay',
    note: 'Personal · •••• 4242',
  },
};

export default function GoRidePage() {
  return (
    <div className={`${inter.variable} ${interTight.variable}`}>
      <GoRide {...DEMO_PROPS} />
    </div>
  );
}
