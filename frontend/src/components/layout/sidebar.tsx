'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
  Ticket,
  PlusCircle,
  BarChart3,
  Users,
  Building2,
  FolderTree,
  History,
  CheckCircle2,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { RoleBadge } from '../shared/role-badge';

export function Sidebar() {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  const employeeLinks = [
    {
      title: 'My Tickets',
      href: '/tickets',
      icon: Ticket,
      active: pathname === '/tickets',
    },
    {
      title: 'Submit Ticket',
      href: '/tickets/new',
      icon: PlusCircle,
      active: pathname === '/tickets/new',
    },
  ];

  const technicianLinks = [
    {
      title: 'Assigned Queue',
      href: '/technician/queue',
      icon: CheckCircle2,
      active: pathname === '/technician/queue',
    },
    {
      title: 'All Tickets',
      href: '/tickets',
      icon: Ticket,
      active: pathname === '/tickets' || (pathname.startsWith('/tickets/') && pathname !== '/tickets/new'),
    },
  ];

  const adminLinks = [
    {
      title: 'Analytics & Reports',
      href: '/admin/reports',
      icon: BarChart3,
      active: pathname === '/admin/reports',
    },
    {
      title: 'Tickets Management',
      href: '/tickets',
      icon: Ticket,
      active: pathname === '/tickets' || (pathname.startsWith('/tickets/') && pathname !== '/tickets/new'),
    },
    {
      title: 'Create Ticket',
      href: '/tickets/new',
      icon: PlusCircle,
      active: pathname === '/tickets/new',
    },
    {
      title: 'Users Administration',
      href: '/admin/users',
      icon: Users,
      active: pathname.startsWith('/admin/users'),
    },
    {
      title: 'Departments',
      href: '/admin/departments',
      icon: Building2,
      active: pathname.startsWith('/admin/departments'),
    },
    {
      title: 'Categories',
      href: '/admin/categories',
      icon: FolderTree,
      active: pathname.startsWith('/admin/categories'),
    },
    {
      title: 'Audit Logs',
      href: '/admin/audit-logs',
      icon: History,
      active: pathname.startsWith('/admin/audit-logs'),
    },
  ];

  const navLinks =
    role === 'ADMINISTRATOR'
      ? adminLinks
      : role === 'TECHNICIAN'
      ? technicianLinks
      : employeeLinks;

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-16 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-center size-9 rounded-lg bg-[#6f1a7e] text-white font-bold text-base shadow-xs">
          CBE
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
            IT Service Desk
          </span>
          <span className="text-[11px] text-zinc-500 truncate">Commercial Bank of Ethiopia</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          Navigation
        </div>
        {navLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors group',
                item.active
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-[#6f1a7e] dark:text-purple-400 font-semibold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/60'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    'size-4.5 shrink-0 transition-colors',
                    item.active
                      ? 'text-[#6f1a7e] dark:text-purple-400'
                      : 'text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200'
                  )}
                />
                <span>{item.title}</span>
              </div>
              {item.active && <ChevronRight className="size-3.5 opacity-70" />}
            </Link>
          );
        })}
      </div>

      {/* User Session Footer */}
      <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40">
        <div className="p-2.5 rounded-lg border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest User'}
            </span>
            {role && <RoleBadge role={role} />}
          </div>
          <p className="text-[11px] text-zinc-500 truncate mb-3">
            {user?.department?.name || user?.email}
          </p>

          <button
            onClick={() => logout()}
            className="flex items-center justify-center gap-2 w-full py-1.5 px-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 rounded border border-transparent hover:border-rose-200 transition-colors"
          >
            <LogOut className="size-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
