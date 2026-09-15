'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/shared/role-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Menu,
  PlusCircle,
  LogOut,
  User,
  ChevronDown,
  Mail,
  Building2,
  BadgeCheck,
  Phone,
  Shield,
  Calendar,
} from 'lucide-react';
import { formatDate, getInitials } from '@/lib/utils';

interface HeaderProps {
  onToggleMobileMenu?: () => void;
}

export function Header({ onToggleMobileMenu }: HeaderProps) {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

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
    <>
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

        {/* Right: Quick Action & User Profile Dropdown */}
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

          {/* Clickable Profile Section Triggering Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="flex items-center gap-2 sm:pl-2 sm:border-l sm:border-zinc-200 dark:sm:border-zinc-800 py-1 px-1.5 sm:px-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#6f1a7e]/30 group select-none"
              aria-label="User profile menu"
            >
              <div className="size-8 rounded-full bg-[#6f1a7e]/10 dark:bg-purple-900/30 text-[#6f1a7e] dark:text-purple-300 font-bold text-xs flex items-center justify-center border border-[#6f1a7e]/20 shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                {getInitials(user?.firstName, user?.lastName)}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-tight">
                  {user ? `${user.firstName} ${user.lastName}` : 'Staff User'}
                </span>
                <span className="text-[10px] text-zinc-400 leading-tight truncate max-w-[130px]">
                  {user?.department?.name || 'Commercial Bank of Ethiopia'}
                </span>
              </div>
              <ChevronDown className="size-3.5 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-transform duration-200" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              side="bottom"
              sideOffset={8}
              className="w-72 p-2 rounded-xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl"
            >
              {/* Header Profile Identity Overview */}
              <div className="p-3 bg-zinc-50/80 dark:bg-zinc-900/60 rounded-lg border border-zinc-100 dark:border-zinc-800/80 mb-1">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-full bg-[#6f1a7e] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ring-2 ring-purple-500/20">
                    {getInitials(user?.firstName, user?.lastName)}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {user ? `${user.firstName} ${user.lastName}` : 'Staff User'}
                    </span>
                    <span className="text-[11px] text-zinc-500 truncate">
                      {user?.email || '—'}
                    </span>
                  </div>
                </div>
                {role && (
                  <div className="mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">Role</span>
                    <RoleBadge role={role} className="scale-90 origin-right" />
                  </div>
                )}
              </div>

              <DropdownMenuSeparator className="my-1 border-zinc-100 dark:border-zinc-800" />

              {/* Click to See Detail of the Profile */}
              <DropdownMenuItem
                onClick={() => setProfileDialogOpen(true)}
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-lg text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-[#6f1a7e] dark:hover:text-purple-300 cursor-pointer transition-colors"
              >
                <div className="size-7 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-[#6f1a7e] dark:text-purple-400 flex items-center justify-center shrink-0">
                  <User className="size-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">Profile Details</span>
                  <span className="text-[10px] text-zinc-400 font-normal">View account and organization info</span>
                </div>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 border-zinc-100 dark:border-zinc-800" />

              {/* Logout Option */}
              <DropdownMenuItem
                onClick={() => logout()}
                variant="destructive"
                className="flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-300 cursor-pointer transition-colors"
              >
                <div className="size-7 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <LogOut className="size-3.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold">Sign Out Session</span>
                  <span className="text-[10px] text-rose-500/80 font-normal">End your active session</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Profile Details Dialog Modal */}
      <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden rounded-2xl border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
          {/* Visual Header Banner */}
          <div className="bg-gradient-to-br from-[#6f1a7e] via-[#561361] to-[#3f0c47] p-6 text-white relative">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white font-black text-xl flex items-center justify-center shadow-lg shrink-0">
                {getInitials(user?.firstName, user?.lastName)}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white truncate">
                  {user ? `${user.firstName} ${user.lastName}` : 'Staff User'}
                </h2>
                <p className="text-xs text-purple-200 truncate mt-0.5">
                  {user?.email || '—'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {role && (
                    <RoleBadge
                      role={role}
                      className="bg-white/15 text-white border-white/20 shadow-xs"
                    />
                  )}
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DialogHeader className="sr-only">
            <DialogTitle>Staff Profile Record</DialogTitle>
            <DialogDescription>Details of the logged in CBE employee</DialogDescription>
          </DialogHeader>

          {/* User Information Grid */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                  <Mail className="size-3.5 text-[#6f1a7e] dark:text-purple-400" />
                  <span className="font-medium text-zinc-500 dark:text-zinc-400">Email Address</span>
                </div>
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {user?.email || '—'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                  <Building2 className="size-3.5 text-[#6f1a7e] dark:text-purple-400" />
                  <span className="font-medium text-zinc-500 dark:text-zinc-400">Department</span>
                </div>
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {user?.department?.name || 'Commercial Bank of Ethiopia'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                  <BadgeCheck className="size-3.5 text-[#6f1a7e] dark:text-purple-400" />
                  <span className="font-medium text-zinc-500 dark:text-zinc-400">Employee / Staff ID</span>
                </div>
                <div className="text-xs font-semibold font-mono text-zinc-800 dark:text-zinc-200 truncate">
                  {user?.employeeId || (user?.id ? `CBE-${user.id.slice(0, 8).toUpperCase()}` : '—')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                  <Phone className="size-3.5 text-[#6f1a7e] dark:text-purple-400" />
                  <span className="font-medium text-zinc-500 dark:text-zinc-400">Phone Number</span>
                </div>
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                  {user?.phoneNumber || 'Not provided'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                  <Shield className="size-3.5 text-[#6f1a7e] dark:text-purple-400" />
                  <span className="font-medium text-zinc-500 dark:text-zinc-400">Institutional Role</span>
                </div>
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {user?.role || 'EMPLOYEE'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                  <Calendar className="size-3.5 text-[#6f1a7e] dark:text-purple-400" />
                  <span className="font-medium text-zinc-500 dark:text-zinc-400">Account Created</span>
                </div>
                <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                  {formatDate(user?.createdAt)}
                </div>
              </div>
            </div>

            {user?.department?.description && (
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/60 dark:border-zinc-800/80 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Department Description: </span>
                {user.department.description}
              </div>
            )}
          </div>

          {/* Modal Actions Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/40">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setProfileDialogOpen(false);
                logout();
              }}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 border-rose-200/60 dark:border-rose-900/40 text-xs font-medium"
            >
              <LogOut className="size-3.5 mr-1.5" />
              Sign Out
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setProfileDialogOpen(false)}
              className="bg-[#6f1a7e] hover:bg-[#561361] text-white text-xs px-5 shadow-xs font-medium"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
