'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Icon } from '../ui/Icon';
import { useSession } from '@/features/auth/useSession';

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout, admin } = useSession();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);

  useEffect(() => {
    if (!mobileDrawerOpen) return;
    const drawer = drawerRef.current;
    drawer?.querySelector('button')?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMobileDrawerOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !drawer) return;
      const focusable = [...drawer.querySelectorAll('a[href], button:not(:disabled)')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      menuButtonRef.current?.focus();
    };
  }, [mobileDrawerOpen]);

  const navItems = [
    { label: 'Ringkasan', href: '/admin', icon: 'layers' },
    { label: 'Konter', href: '/admin/konter', icon: 'store' },
    { label: 'Provider', href: '/admin/provider', icon: 'wifi' },
    { label: 'Wilayah', href: '/admin/wilayah', icon: 'map_pin' },
    { label: 'Pengaturan', href: '/admin/pengaturan', icon: 'edit' },
  ];

  return (
    <>
      {/* Mobile Header Bar */}
      <div className="lg:hidden sticky top-0 z-30 bg-chrome border-b border-line px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            ref={menuButtonRef}
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 text-content hover:bg-surface-muted rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
            aria-label="Buka menu admin"
          >
            <Icon name="menu" size={22} />
          </button>
          <span className="font-extrabold text-sm text-content">Admin KonterKuota</span>
        </div>
        <Link
          href="/"
          className="text-xs font-semibold text-brand-ink hover:underline flex items-center gap-1 min-h-[44px]"
        >
          <span>Lihat Web</span>
          <Icon name="external_link" size={14} />
        </Link>
      </div>

      {/* Mobile Drawer Backdrop & Menu */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-[#050A14]/80 backdrop-blur-xs"
            aria-hidden="true"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div ref={drawerRef} role="dialog" aria-modal="true" aria-label="Menu admin" className="relative w-72 bg-chrome h-full shadow-dialog p-5 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200 border-r border-line">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-line mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full ring-2 ring-brand overflow-hidden shrink-0">
                    <Image
                      src="/images/brand-logo.png"
                      alt="Logo"
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="font-extrabold text-sm text-content">Admin KonterKuota</span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 min-w-[44px] min-h-[44px] text-content-muted hover:text-content rounded-full flex items-center justify-center"
                  aria-label="Tutup menu admin"
                >
                  <Icon name="close" size={18} />
                </button>
              </div>

              <div className="text-xs text-content-muted mb-4 px-1">
                Admin: <strong className="text-content">{admin?.name || 'Administrator'}</strong>
              </div>

              <nav className="flex flex-col gap-1.5" aria-label="Navigasi admin mobile">
                {navItems.map((item) => {
                  const isActive =
                    item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={clsx(
                        'flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-xs font-bold transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink/40',
                        isActive
                          ? 'bg-brand text-brand-on shadow-xs'
                          : 'text-content-muted hover:bg-surface-muted hover:text-content'
                      )}
                    >
                      <Icon name={item.icon} size={18} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-line flex flex-col gap-2">
              <Link
                href="/"
                className="flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-[12px] text-xs font-semibold text-content-muted hover:bg-surface-muted"
              >
                <Icon name="external_link" size={16} />
                <span>Lihat Website</span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center gap-2 px-3 py-2 rounded-[12px] text-xs font-bold text-danger-ink hover:bg-danger-soft transition-colors min-h-[44px] cursor-pointer"
              >
                <Icon name="logout" size={16} />
                <span>Keluar Akun</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Rail (88px) */}
      <aside className="hidden lg:flex flex-col items-center w-[88px] fixed inset-y-0 left-0 bg-chrome rounded-r-[24px] z-40 py-6 border-r border-line shadow-card select-none">
        {/* Brand */}
        <Link href="/admin" className="mb-6 flex flex-col items-center group gap-1" title="KonterKuota Admin">
          <div className="w-11 h-11 rounded-full ring-2 ring-brand shadow-xs transition-transform group-hover:scale-105 overflow-hidden">
            <Image
              src="/images/brand-logo.png"
              alt="KonterKuota Admin"
              width={44}
              height={44}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-[10px] font-bold text-brand-ink uppercase tracking-wider">Admin</span>
        </Link>

        {/* Nav Items */}
        <nav className="flex-1 flex flex-col items-center gap-3 w-full px-2" aria-label="Navigasi admin">
          {navItems.map((item) => {
            const isActive =
              item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={clsx(
                  'w-full py-2.5 px-1 rounded-[14px] flex flex-col items-center justify-center gap-1 font-bold text-xs transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-ink/40',
                  isActive
                    ? 'bg-brand text-brand-on shadow-xs'
                    : 'text-content-muted hover:bg-surface-muted hover:text-content'
                )}
                title={item.label}
              >
                <Icon name={item.icon} size={20} />
                <span className="text-[10px] leading-tight text-center">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom items */}
        <div className="mt-auto pt-4 border-t border-line w-full px-2 flex flex-col items-center gap-2">
          <Link
            href="/"
            className="p-2 rounded-[12px] text-content-muted hover:text-content hover:bg-surface-muted transition-colors flex items-center justify-center min-w-[44px] min-h-[44px]"
            aria-label="Lihat Website"
            title="Lihat Website"
          >
            <Icon name="external_link" size={18} />
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="p-2 rounded-[12px] text-danger-ink hover:bg-danger-soft transition-colors flex items-center justify-center min-w-[44px] min-h-[44px] cursor-pointer"
            aria-label="Keluar Akun"
            title="Keluar"
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </aside>
    </>
  );
}

