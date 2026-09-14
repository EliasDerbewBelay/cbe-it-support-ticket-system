import React from 'react';
import Link from 'next/link';
import { Ticket } from '@/types/ticket';
import { StatusBadge } from '@/components/shared/status-badge';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { formatRelativeTime } from '@/lib/utils';
import { Building2, User, Clock, ChevronRight } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  const employeeName = ticket.employee
    ? `${ticket.employee.firstName || ticket.employee.first_name || ''} ${
        ticket.employee.lastName || ticket.employee.last_name || ''
      }`.trim()
    : 'Unknown Requester';

  const currentAssignment = ticket.ticketAssignments?.find((a) => a.isCurrent);
  const techName = currentAssignment?.technician
    ? `${currentAssignment.technician.firstName || currentAssignment.technician.first_name || ''} ${
        currentAssignment.technician.lastName || currentAssignment.technician.last_name || ''
      }`.trim()
    : null;

  return (
    <Link
      href={`/tickets/${ticket.id}`}
      className="block group rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 transition-all hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xs"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-semibold text-[#6f1a7e] dark:text-purple-400">
              {ticket.ticketNumber}
            </span>
            <span className="text-zinc-300 dark:text-zinc-700">&bull;</span>
            <span className="text-xs text-zinc-500 font-medium truncate">
              {ticket.category?.name || 'General'}
            </span>
          </div>

          <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#6f1a7e] dark:group-hover:text-purple-400 transition-colors line-clamp-1">
            {ticket.title}
          </h3>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-0.5">
            {ticket.description}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5">
            <User className="size-3.5 text-zinc-400" />
            <span className="truncate max-w-[120px]">{employeeName}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Building2 className="size-3.5 text-zinc-400" />
            <span className="truncate max-w-[120px]">{ticket.department?.name || 'IS'}</span>
          </div>

          {techName && (
            <div className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300 font-medium">
              <span className="truncate max-w-[120px]">Tech: {techName}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Clock className="size-3.5 text-zinc-400" />
            <span>{formatRelativeTime(ticket.createdAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[#6f1a7e] dark:text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          <span>View</span>
          <ChevronRight className="size-3.5" />
        </div>
      </div>
    </Link>
  );
}
