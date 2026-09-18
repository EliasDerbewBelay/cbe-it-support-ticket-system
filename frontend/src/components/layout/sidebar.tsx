'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  badge?: string;
}

interface SidebarSection {
  groupTitle: string;
  items: SidebarItem[];
}

export function Sidebar({ mobileOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { role } = useAuth();

  const employeeSections: SidebarSection[] = [
    {
      groupTitle: 'Incident Management',
      items: [
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
          badge: 'New',
        },
      ],
    },
  ];

  const technicianSections: SidebarSection[] = [
    {
      groupTitle: 'Engineering Workbench',
      items: [
        {
          title: 'Assigned Queue',
          href: '/technician/queue',
          icon: CheckCircle2,
          active: pathname === '/technician/queue',
          badge: 'Active',
        },
        {
          title: 'All Tickets',
          href: '/tickets',
          icon: Ticket,
          active: pathname === '/tickets' || (pathname.startsWith('/tickets/') && pathname !== '/tickets/new'),
        },
        {
          title: 'Submit Ticket',
          href: '/tickets/new',
          icon: PlusCircle,
          active: pathname === '/tickets/new',
        },
      ],
    },
  ];

  const adminSections: SidebarSection[] = [
    {
      groupTitle: 'Operations & Analytics',
      items: [
        {
          title: 'Executive Analytics',
          href: '/admin/reports',
          icon: BarChart3,
          active: pathname === '/admin/reports',
        },
        {
          title: 'Tickets Directory',
          href: '/tickets',
          icon: Ticket,
          active: pathname === '/tickets' || (pathname.startsWith('/tickets/') && pathname !== '/tickets/new'),
        },
        {
          title: 'Log New Incident',
          href: '/tickets/new',
          icon: PlusCircle,
          active: pathname === '/tickets/new',
        },
      ],
    },
    {
      groupTitle: 'Institutional Administration',
      items: [
        {
          title: 'User Management',
          href: '/admin/users',
          icon: Users,
          active: pathname.startsWith('/admin/users'),
        },
        {
          title: 'Branch & Departments',
          href: '/admin/departments',
          icon: Building2,
          active: pathname.startsWith('/admin/departments'),
        },
        {
          title: 'Category Taxonomy',
          href: '/admin/categories',
          icon: FolderTree,
          active: pathname.startsWith('/admin/categories'),
        },
        {
          title: 'System Audit Logs',
          href: '/admin/audit-logs',
          icon: History,
          active: pathname.startsWith('/admin/audit-logs'),
        },
      ],
    },
  ];

  const sections =
    role === 'ADMINISTRATOR'
      ? adminSections
      : role === 'TECHNICIAN'
      ? technicianSections
      : employeeSections;

  const renderSidebarContent = (isMobile = false) => (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950">
        <Link
          href="/tickets"
          onClick={isMobile ? onClose : undefined}
          className="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <div className="relative flex items-center justify-center size-9 shrink-0">
            <Image
              src="/cbe_logo.png"
              alt="Commercial Bank of Ethiopia Logo"
              width={36}
              height={36}
              className="size-full object-contain"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1.5">
              IT Service Desk
            </span>
            <span className="text-[11px] text-zinc-500 truncate font-normal">
              Commercial Bank of Ethiopia
            </span>
          </div>
        </Link>

        {isMobile && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 [scrollbar-width:thin]">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-2.5 pb-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              {section.groupTitle}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={isMobile ? onClose : undefined}
                    className={cn(
                      'flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg transition-all group',
                      item.active
                        ? 'bg-purple-50 dark:bg-purple-950/40 text-[#6f1a7e] dark:text-purple-300 font-semibold shadow-2xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900'
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon
                        className={cn(
                          'size-4 shrink-0 transition-colors',
                          item.active
                            ? 'text-[#6f1a7e] dark:text-purple-400'
                            : 'text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                        )}
                      />
                      <span className="truncate">{item.title}</span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-[#6f1a7e]/10 text-[#6f1a7e] dark:bg-purple-900/30 dark:text-purple-300 rounded-md">
                          {item.badge}
                        </span>
                      )}
                      {item.active && (
                        <ChevronRight className="size-3 text-[#6f1a7e] dark:text-purple-400 opacity-80" />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Fixed Desktop Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col w-64 h-dvh border-r border-zinc-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-950 shadow-xs">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-over Drawer & Backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-72 h-dvh bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-left duration-250">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
}
