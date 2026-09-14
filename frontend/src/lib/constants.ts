import { TicketPriority, TicketStatus } from '@/types/ticket';
import { UserRole } from '@/types/auth';

export const APP_NAME = 'CBE IT Service Desk';
export const APP_DESCRIPTION = 'Commercial Bank of Ethiopia IT Support & Incident Management';

export const STATUS_CONFIG: Record<
  TicketStatus,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    badgeClass: string;
    bgClass: string;
    dotClass: string;
    description: string;
  }
> = {
  OPEN: {
    label: 'Open',
    variant: 'outline',
    badgeClass: 'border-blue-500/30 text-blue-700 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
    bgClass: 'bg-blue-500',
    dotClass: 'bg-blue-500',
    description: 'Ticket logged and waiting for review and technician assignment.',
  },
  ASSIGNED: {
    label: 'Assigned',
    variant: 'outline',
    badgeClass: 'border-sky-500/30 text-sky-700 bg-sky-50 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
    bgClass: 'bg-sky-500',
    dotClass: 'bg-sky-500',
    description: 'Technician has been assigned and notified.',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    variant: 'outline',
    badgeClass: 'border-amber-500/30 text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
    bgClass: 'bg-amber-500',
    dotClass: 'bg-amber-500 animate-pulse',
    description: 'Support technician is actively investigating and troubleshooting.',
  },
  RESOLVED: {
    label: 'Resolved',
    variant: 'outline',
    badgeClass: 'border-emerald-500/30 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    bgClass: 'bg-emerald-500',
    dotClass: 'bg-emerald-500',
    description: 'Issue has been corrected and verified by the technician.',
  },
  CLOSED: {
    label: 'Closed',
    variant: 'secondary',
    badgeClass: 'border-zinc-300 text-zinc-600 bg-zinc-100 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-700',
    bgClass: 'bg-zinc-400',
    dotClass: 'bg-zinc-400',
    description: 'Ticket concluded and archived by IS administration.',
  },
  CANCELLED: {
    label: 'Cancelled',
    variant: 'destructive',
    badgeClass: 'border-rose-500/30 text-rose-700 bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
    bgClass: 'bg-rose-500',
    dotClass: 'bg-rose-500',
    description: 'Cancelled by requester or administrator.',
  },
};

export const PRIORITY_CONFIG: Record<
  TicketPriority,
  {
    label: string;
    variant: 'default' | 'secondary' | 'outline' | 'destructive';
    badgeClass: string;
    indicatorClass: string;
  }
> = {
  LOW: {
    label: 'Low',
    variant: 'secondary',
    badgeClass: 'border-zinc-200 text-zinc-600 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300',
    indicatorClass: 'bg-zinc-400',
  },
  MEDIUM: {
    label: 'Medium',
    variant: 'outline',
    badgeClass: 'border-blue-300 text-blue-700 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-300',
    indicatorClass: 'bg-blue-500',
  },
  HIGH: {
    label: 'High',
    variant: 'outline',
    badgeClass: 'border-amber-300 text-amber-800 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-300',
    indicatorClass: 'bg-amber-500',
  },
  CRITICAL: {
    label: 'Critical',
    variant: 'destructive',
    badgeClass: 'border-red-400 text-red-700 bg-red-50 dark:bg-red-950/50 dark:text-red-300 font-semibold',
    indicatorClass: 'bg-red-600 animate-ping',
  },
};

export const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    badgeClass: string;
    description: string;
  }
> = {
  EMPLOYEE: {
    label: 'Employee',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300',
    description: 'Branch / Department Bank Staff requesting IT support',
  },
  TECHNICIAN: {
    label: 'IS Technician',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300',
    description: 'IT Systems / Network Support Engineer',
  },
  ADMINISTRATOR: {
    label: 'IS Administrator',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300',
    description: 'Helpdesk Supervisor & System Administrator',
  },
};
