import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const metadata = {
  title: 'Login Admin — KonterKuota',
};

export default async function AdminLoginPage({ searchParams }) {
  const params = await searchParams;
  const sessionExpired = params?.expired === '1';
  const loggedOut = params?.loggedOut === '1';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-transparent">
      <div className="w-full max-w-md bg-surface rounded-panel p-6 sm:p-8 border border-line shadow-panel flex flex-col items-center gap-6">
        {/* Brand */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-14 h-14 rounded-full ring-2 ring-brand shadow-xs overflow-hidden">
            <Image
              src="/images/brand-logo.png"
              alt="KonterKuota"
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-xl font-extrabold text-content mt-1">Masuk Panel Admin</h1>
          <p className="text-xs text-content-muted">
            Kelola direktori konter, paket kuota, provider, dan pengaturan platform.
          </p>
        </div>

        <LoginForm sessionExpired={sessionExpired} loggedOut={loggedOut} />

        <div className="pt-4 border-t border-line w-full text-center">
          <Link href="/" className="text-xs font-semibold text-brand-ink hover:underline">
            ← Kembali ke Website Publik
          </Link>
        </div>
      </div>
    </div>
  );
}

