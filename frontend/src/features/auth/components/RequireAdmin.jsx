'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, isManualLogoutInProgress } from '../useSession';

export function RequireAdmin({ children }) {
  const router = useRouter();
  const { admin, isLoading, isAuthenticated } = useSession();
  const wasAuthenticatedRef = useRef(false);

  useEffect(() => {
    if (admin) {
      wasAuthenticatedRef.current = true;
    }
  }, [admin]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      if (isManualLogoutInProgress()) {
        router.replace('/admin/login?loggedOut=1');
      } else if (wasAuthenticatedRef.current) {
        router.replace('/admin/login?expired=1');
      } else {
        router.replace('/admin/login');
      }
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-transparent">
        <div className="bg-surface rounded-panel p-8 border border-line shadow-card flex flex-col items-center gap-4 max-w-sm w-full">
          <div className="w-10 h-10 rounded-full border-2 border-brand-ink border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-content-muted">Memverifikasi sesi admin...</span>
        </div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return children;
}

