'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (role === 'ADMINISTRATOR') {
          router.replace('/admin/reports');
        } else if (role === 'TECHNICIAN') {
          router.replace('/technician/queue');
        } else {
          router.replace('/tickets');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [isAuthenticated, isLoading, role, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <Loader2 className="size-5 animate-spin text-[#6f1a7e]" />
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Directing to Commercial Bank of Ethiopia IT Service Desk...
        </span>
      </div>
    </div>
  );
}
