'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/shared/role-badge';
import { Menu, PlusCircle } from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const { user, role } = useAuth();

  const getBreadcrumbTitle = () => {
    if (pathname === '/tickets') return 'Tickets Overview';
    if (pathname === '/tickets/new') return 'Log New Support Request';
    if (pathname.startsWith('/tickets/')) return 'Ticket Incident Record';
    if (pathname === '/technician/queue') return 'Assigned Queue';
    if (pathname === '/admin/reports') return 'Executive Dashboard & Analytics';
    if (pathname === '/admin/users') return 'User Accounts Administration';
    if (pathname === '/admin/departments') return 'Organizational Departments';
    if (pathname === '/admin/categories') return 'Incident Category Catalogs';
    if (pathname === '/admin/audit-logs') return 'System Audit & Transition Logs';
    return 'Service Desk';
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md">
      {/* Left: Mobile Drawer Trigger & Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 -ml-1 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          aria-label="Toggle Navigation Drawer"
        >
          <Menu className="size-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium hidden sm:inline">CBE IS Portal</span>
          <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">/</span>
          <h1 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
            {getBreadcrumbTitle()}
          </h1>
        </div>
      </div>

      {/* Right: Quick Action & User Profile Pill */}
      <div className="flex items-center gap-3">
        {pathname !== '/tickets/new' && (
          <Link href="/tickets/new">
            <Button
              size="sm"
              className="hidden sm:inline-flex bg-[#6f1a7e] hover:bg-[#561361] text-white shadow-xs text-xs font-medium"
            >
              <PlusCircle className="size-3.5 mr-1.5" />
              New Ticket
            </Button>
          </Link>
        )}

        {role && <RoleBadge role={role} className="hidden sm:inline-flex" />}

        <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-zinc-200 dark:sm:border-zinc-800">
          <div className="size-8 rounded-full bg-[#6f1a7e]/10 dark:bg-purple-900/30 text-[#6f1a7e] dark:text-purple-300 font-bold text-xs flex items-center justify-center border border-[#6f1a7e]/20 shadow-2xs">
            {user?.firstName?.charAt(0) || 'U'}
            {user?.lastName?.charAt(0) || ''}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-tight">
              {user ? `${user.firstName} ${user.lastName}` : 'Staff'}
            </span>
            <span className="text-[10px] text-zinc-400 leading-tight">
              {user?.department?.name || 'Commercial Bank of Ethiopia'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
