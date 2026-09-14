'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/shared/role-badge';
import {
  Menu,
  X,
  PlusCircle,
  Ticket,
  BarChart3,
  Users,
  Building2,
  FolderTree,
  History,
  CheckCircle2,
  LogOut,
} from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

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

  const employeeLinks = [
    { title: 'My Tickets', href: '/tickets', icon: Ticket },
    { title: 'Submit Ticket', href: '/tickets/new', icon: PlusCircle },
  ];

  const technicianLinks = [
    { title: 'Assigned Queue', href: '/technician/queue', icon: CheckCircle2 },
    { title: 'All Tickets', href: '/tickets', icon: Ticket },
  ];

  const adminLinks = [
    { title: 'Dashboard', href: '/admin/reports', icon: BarChart3 },
    { title: 'Tickets', href: '/tickets', icon: Ticket },
    { title: 'Users', href: '/admin/users', icon: Users },
    { title: 'Departments', href: '/admin/departments', icon: Building2 },
    { title: 'Categories', href: '/admin/categories', icon: FolderTree },
    { title: 'Audit Logs', href: '/admin/audit-logs', icon: History },
  ];

  const links =
    role === 'ADMINISTRATOR'
      ? adminLinks
      : role === 'TECHNICIAN'
      ? technicianLinks
      : employeeLinks;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-sm">
      {/* Left: Mobile Toggle & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden p-2 rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400 font-medium hidden sm:inline">CBE IS Portal</span>
          <span className="text-zinc-300 dark:text-zinc-700 hidden sm:inline">/</span>
          <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {getBreadcrumbTitle()}
          </span>
        </div>
      </div>

      {/* Right: Actions and User Identity */}
      <div className="flex items-center gap-3">
        {pathname !== '/tickets/new' && (
          <Link href="/tickets/new">
            <Button size="sm" className="hidden sm:inline-flex bg-[#6f1a7e] hover:bg-[#561361] text-white">
              <PlusCircle className="size-4 mr-1.5" />
              New Ticket
            </Button>
          </Link>
        )}

        {role && <RoleBadge role={role} className="hidden sm:inline-flex" />}

        <div className="flex items-center gap-2 pl-2 sm:border-l sm:border-zinc-200 dark:sm:border-zinc-800">
          <div className="size-8 rounded-full bg-[#6f1a7e]/10 dark:bg-purple-900/30 text-[#6f1a7e] dark:text-purple-300 font-semibold text-xs flex items-center justify-center border border-[#6f1a7e]/20">
            {user?.firstName?.charAt(0) || 'U'}
            {user?.lastName?.charAt(0) || ''}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 shadow-xl space-y-2">
          <div className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {user ? `${user.firstName} ${user.lastName}` : 'Guest'}
            </p>
            <p className="text-xs text-zinc-500">{user?.email}</p>
          </div>

          <div className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                >
                  <Icon className="size-4 text-zinc-500" />
                  <span>{link.title}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30"
            >
              <LogOut className="size-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
