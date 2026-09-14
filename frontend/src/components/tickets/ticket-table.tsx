import React from 'react';
import Link from 'next/link';
import { Ticket } from '@/types/ticket';
import { StatusBadge } from '@/components/shared/status-badge';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { formatRelativeTime } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';

interface TicketTableProps {
  tickets: Ticket[];
  onAssignClick?: (ticket: Ticket) => void;
  isAdmin?: boolean;
}

export function TicketTable({ tickets, onAssignClick, isAdmin }: TicketTableProps) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <Table>
        <TableHeader className="bg-zinc-50/70 dark:bg-zinc-900/60">
          <TableRow className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
            <TableHead className="w-[110px] text-xs font-semibold">Ticket ID</TableHead>
            <TableHead className="text-xs font-semibold">Title & Category</TableHead>
            <TableHead className="w-[120px] text-xs font-semibold">Status</TableHead>
            <TableHead className="w-[100px] text-xs font-semibold">Priority</TableHead>
            <TableHead className="text-xs font-semibold">Requester</TableHead>
            <TableHead className="text-xs font-semibold">Technician</TableHead>
            <TableHead className="w-[110px] text-xs font-semibold text-right">Logged</TableHead>
            <TableHead className="w-[80px] text-xs font-semibold text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => {
            const requester = ticket.employee
              ? `${ticket.employee.firstName || ticket.employee.first_name || ''} ${
                  ticket.employee.lastName || ticket.employee.last_name || ''
                }`.trim()
              : 'Unknown';

            const currentAssignment = ticket.ticketAssignments?.find((a) => a.isCurrent);
            const technician = currentAssignment?.technician
              ? `${currentAssignment.technician.firstName || currentAssignment.technician.first_name || ''} ${
                  currentAssignment.technician.lastName || currentAssignment.technician.last_name || ''
                }`.trim()
              : null;

            return (
              <TableRow
                key={ticket.id}
                className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition-colors"
              >
                <TableCell className="font-mono text-xs font-semibold text-[#6f1a7e] dark:text-purple-400">
                  <Link href={`/tickets/${ticket.id}`} className="hover:underline">
                    {ticket.ticketNumber}
                  </Link>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col max-w-sm">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="font-medium text-sm text-zinc-900 dark:text-zinc-100 hover:text-[#6f1a7e] dark:hover:text-purple-400 truncate"
                    >
                      {ticket.title}
                    </Link>
                    <span className="text-[11px] text-zinc-400">
                      {ticket.category?.name || 'General'}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <StatusBadge status={ticket.status} />
                </TableCell>

                <TableCell>
                  <PriorityBadge priority={ticket.priority} />
                </TableCell>

                <TableCell>
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      {requester}
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      {ticket.department?.name || 'IS Dept'}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  {technician ? (
                    <span className="text-xs font-medium text-purple-700 dark:text-purple-300">
                      {technician}
                    </span>
                  ) : isAdmin && onAssignClick && ticket.status !== 'CLOSED' && ticket.status !== 'CANCELLED' ? (
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => onAssignClick(ticket)}
                      className="text-[11px] h-6 px-1.5 border-purple-200 text-[#6f1a7e] hover:bg-purple-50"
                    >
                      Assign
                    </Button>
                  ) : (
                    <span className="text-xs text-zinc-400 italic">Unassigned</span>
                  )}
                </TableCell>

                <TableCell className="text-right text-xs text-zinc-500 whitespace-nowrap">
                  {formatRelativeTime(ticket.createdAt)}
                </TableCell>

                <TableCell className="text-right">
                  <Link href={`/tickets/${ticket.id}`}>
                    <Button variant="ghost" size="icon-xs" className="hover:text-[#6f1a7e]">
                      <ChevronRight className="size-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
