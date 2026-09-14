'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { ticketApi } from '@/lib/api/tickets';
import { Ticket, TicketFilters as FilterType, TicketPriority, TicketStatus } from '@/types/ticket';
import { PageHeader } from '@/components/shared/page-header';
import { TicketCard } from '@/components/tickets/ticket-card';
import { TicketTable } from '@/components/tickets/ticket-table';
import { TicketFilters } from '@/components/tickets/ticket-filters';
import { EmptyState } from '@/components/shared/empty-state';
import { AssignModal } from '@/components/tickets/assign-modal';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function TicketsPage() {
  const router = useRouter();
  const { isEmployee, isAdmin } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters state
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<TicketStatus | 'ALL'>('ALL');
  const [priority, setPriority] = useState<TicketPriority | 'ALL'>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');

  // Assign Modal state
  const [assignTarget, setAssignTarget] = useState<Ticket | null>(null);

  const fetchTickets = useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const filters: FilterType = {
          search: search.trim() || undefined,
          status: status === 'ALL' ? undefined : status,
          priority: priority === 'ALL' ? undefined : priority,
          limit: 100,
        };

        let result: { tickets: Ticket[] };
        if (isEmployee) {
          result = await ticketApi.getMyTickets(filters);
        } else {
          result = await ticketApi.getAllTickets(filters);
        }

        setTickets(result.tickets || []);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to fetch tickets');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [isEmployee, search, status, priority]
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('ALL');
    setPriority('ALL');
  };

  // Quick stats summary
  const totalCount = tickets.length;
  const openCount = tickets.filter((t) => t.status === 'OPEN' || t.status === 'ASSIGNED').length;
  const inProgressCount = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
  const resolvedCount = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEmployee ? 'My Support Tickets' : 'IT Incident Records'}
        description={
          isEmployee
            ? 'Track, monitor, and manage your reported IT requests across Commercial Bank of Ethiopia.'
            : 'Comprehensive institutional repository of all bank IT incidents, troubleshooting logs, and resolutions.'
        }
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchTickets(true)}
          disabled={isRefreshing || isLoading}
          className="text-xs"
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>

        <Link href="/tickets/new">
          <Button size="sm" className="bg-[#6f1a7e] hover:bg-[#561361] text-white text-xs">
            <PlusCircle className="size-3.5 mr-1.5" />
            New Ticket
          </Button>
        </Link>
      </PageHeader>

      {/* Metrics Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Total</span>
          <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">{totalCount}</p>
        </div>
        <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20">
          <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider">
            Pending Triage
          </span>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mt-0.5">{openCount}</p>
        </div>
        <div className="p-3 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/40 dark:bg-amber-950/20">
          <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider">
            In Progress
          </span>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-0.5">{inProgressCount}</p>
        </div>
        <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20">
          <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
            Resolved
          </span>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-0.5">{resolvedCount}</p>
        </div>
      </div>

      {/* Filters Bar */}
      <TicketFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        priority={priority}
        onPriorityChange={setPriority}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onReset={handleResetFilters}
      />

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <Loader2 className="size-6 animate-spin text-[#6f1a7e]" />
          <span className="text-xs text-zinc-500 mt-2 font-medium">Loading ticket database...</span>
        </div>
      ) : tickets.length === 0 ? (
        <EmptyState
          title="No incidents found"
          description={
            search || status !== 'ALL' || priority !== 'ALL'
              ? 'No support tickets matched your specific filter criteria. Try resetting filters.'
              : 'You currently have no recorded support tickets in this view.'
          }
          actionLabel={isEmployee ? 'Submit Support Request' : undefined}
          onAction={isEmployee ? () => router.push('/tickets/new') : undefined}
        />
      ) : viewMode === 'table' ? (
        <TicketTable
          tickets={tickets}
          isAdmin={isAdmin}
          onAssignClick={(t) => setAssignTarget(t)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map((t) => (
            <TicketCard key={t.id} ticket={t} />
          ))}
        </div>
      )}

      {/* Assign Modal */}
      {assignTarget && (
        <AssignModal
          isOpen={!!assignTarget}
          onClose={() => setAssignTarget(null)}
          ticketId={assignTarget.id}
          ticketNumber={assignTarget.ticketNumber}
          onAssigned={() => fetchTickets(true)}
        />
      )}
    </div>
  );
}
