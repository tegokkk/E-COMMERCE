import React from 'react';
import { RequireAdmin } from '@/features/auth/components/RequireAdmin';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function ProtectedAdminLayout({ children }) {
  return (
    <RequireAdmin>
      <div className="min-h-screen bg-transparent text-content flex flex-col">
        <AdminSidebar />
        <div className="flex-1 lg:pl-[88px] flex flex-col w-full min-w-0">
          <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-[1440px] w-full mx-auto min-w-0">
            {children}
          </main>
        </div>
      </div>
    </RequireAdmin>
  );
}

