'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Route protection for Admin & Technician paths
  useEffect(() => {
    if (!isLoading && isAuthenticated && role) {
      if (pathname.startsWith('/admin') && role !== 'ADMINISTRATOR') {
        router.replace('/tickets');
      }
      if (pathname.startsWith('/technician') && role !== 'TECHNICIAN' && role !== 'ADMINISTRATOR') {
        router.replace('/tickets');
      }
    }
  }, [isLoading, isAuthenticated, role, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-500">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
          <Loader2 className="size-5 animate-spin text-[#6f1a7e]" />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Verifying security session...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-50/70 dark:bg-zinc-950">
      {/* Pinned Desktop Sidebar & Mobile Slide-out Drawer */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area offset by the fixed sidebar width on desktop */}
      <div className="lg:pl-64 flex flex-col min-h-screen min-w-0 transition-[padding] duration-200">
        <Header onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
