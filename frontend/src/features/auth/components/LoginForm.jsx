'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { login } from '../api';

export function LoginForm({ sessionExpired = false, loggedOut = false }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await login(email, password);
      if (res?.data?.admin) {
        queryClient.setQueryData(['auth', 'me'], { data: res.data.admin });
      }
      router.push('/admin');
    } catch (err) {
      setErrorMessage(err.message || 'Email atau password tidak sesuai.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      {errorMessage ? (
        <div role="alert" className="bg-danger-soft text-danger-ink p-3 rounded-[10px] text-xs font-semibold border border-danger-ink/20 flex items-center gap-2">
          <Icon name="alert" size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      ) : sessionExpired ? (
        <div role="status" className="bg-warning-soft text-warning-ink p-3 rounded-[10px] text-xs font-semibold border border-warning-ink/20 flex items-center gap-2">
          <Icon name="clock" size={16} className="shrink-0" />
          <span>Sesi admin telah berakhir. Silakan masuk kembali.</span>
        </div>
      ) : loggedOut ? (
        <div role="status" className="bg-success-soft text-success-ink p-3 rounded-[10px] text-xs font-semibold border border-success-ink/20 flex items-center gap-2">
          <Icon name="check" size={16} className="shrink-0" />
          <span>Anda berhasil keluar dari panel admin.</span>
        </div>
      ) : null}

      <Input
        label="Email Admin"
        id="admin-email"
        type="email"
        autoComplete="email"
        placeholder="admin@konterkuota.id"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={loading}
      />

      <Input
        label="Password"
        id="admin-password"
        type={showPassword ? 'text' : 'password'}
        autoComplete="current-password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={loading}
        rightSlot={
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            disabled={loading}
            className="px-2.5 py-1.5 min-h-[36px] rounded-[8px] text-xs font-semibold text-content-muted hover:text-content hover:bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink/40 cursor-pointer disabled:opacity-50"
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? 'Tutup' : 'Lihat'}
          </button>
        }
      />

      <Button
        type="submit"
        variant="brand"
        size="lg"
        loading={loading}
        className="w-full mt-2"
      >
        Masuk ke Panel Pengelolaan
      </Button>
    </form>
  );
}

