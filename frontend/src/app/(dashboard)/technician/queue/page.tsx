'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ticketApi } from '@/lib/api/tickets';
import { TechnicianDashboardSummary, Ticket } from '@/types/ticket';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { PriorityBadge } from '@/components/shared/priority-badge';
import { ResolveModal } from '@/components/tickets/resolve-modal';
import { RadialProgressChart } from '@/components/charts/radial-progress-chart';
import { ApexProgressBar } from '@/components/charts/apex-progress-bar';
import { formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { EmptyState } from '@/components/shared/empty-state';
import { toast } from 'sonner';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlayCircle,
  Loader2,
  ChevronRight,
  RefreshCw,
  BarChart2,
} from 'lucide-react';

export default function TechnicianQueuePage() {
  const [summary, setSummary] = useState<TechnicianDashboardSummary | null>(null);
  const [assignedTickets, setAssignedTickets] = useState<Ticket[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(true);

  // Quick Resolve modal
  const [resolveTarget, setResolveTarget] = useState<Ticket | null>(null);

  const loadData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const [sum, res] = await Promise.all([
        ticketApi.getTechnicianSummary(),
        ticketApi.getAssignedTickets({ limit: 100 }),
      ]);
      setSummary(sum);
      setAssignedTickets(res.tickets || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load technician queue');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStartWork = async (ticketId: string) => {
    try {
      await ticketApi.startWork(ticketId);
      toast.success('Investigation started. Status updated to In Progress.');
      loadData(true);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to start work');
    }
  };

  const safeAssigned = Array.isArray(assignedTickets) ? assignedTickets : [];

  const filteredTickets = safeAssigned.filter((t) => {
    if (statusFilter === 'ALL') return true;
    return t.status === statusFilter;
  });

  const totalAssigned = summary?.assignedTotal ?? safeAssigned.length;
  const resolvedCount =
    summary?.resolvedToday ??
    safeAssigned.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
  const inProgressCount =
    summary?.inProgress ?? safeAssigned.filter((t) => t.status === 'IN_PROGRESS').length;
  const criticalCount =
    summary?.criticalPending ??
    safeAssigned.filter(
      (t) => t.priority === 'CRITICAL' && t.status !== 'RESOLVED' && t.status !== 'CLOSED'
    ).length;

  const resolutionRate =
    totalAssigned > 0 ? Math.round((resolvedCount / totalAssigned) * 100) : 0;
  const inProgressRate =
    totalAssigned > 0 ? Math.round((inProgressCount / totalAssigned) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Technician Work Queue"
        description="Assigned incident queue, active troubleshooting assignments, and performance analysis."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAnalysis(!showAnalysis)}
          className="text-xs"
        >
          <BarChart2 className="size-3.5 mr-1.5 text-purple-600" />
          {showAnalysis ? 'Hide Analysis' : 'Show Analysis'}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => loadData(true)}
          disabled={isRefreshing || isLoading}
          className="text-xs"
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Queue
        </Button>
      </PageHeader>

      {/* Technician KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <div className="flex items-center justify-between text-zinc-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Assigned Total</span>
            <Wrench className="size-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{totalAssigned}</p>
        </div>

        <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 shadow-2xs">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">In Progress</span>
            <Clock className="size-4" />
          </div>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-300">{inProgressCount}</p>
        </div>

        <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/40 dark:bg-red-950/20 shadow-2xs">
          <div className="flex items-center justify-between text-red-700 dark:text-red-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Critical Pending</span>
            <AlertTriangle className="size-4" />
          </div>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{criticalCount}</p>
        </div>

        <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Resolved</span>
            <CheckCircle2 className="size-4" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{resolvedCount}</p>
        </div>
      </div>

      {/* Technician ApexCharts Analysis Section */}
      {showAnalysis && (
        <Card className="border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart2 className="size-4 text-[#6f1a7e]" />
              Technician Resolution & Workload Progress Analysis
            </CardTitle>
            <CardDescription className="text-xs">
              Real-time progress monitoring powered by ApexCharts for assigned workload.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              {/* Radial Progress Gauge */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-2 border-r-0 md:border-r border-zinc-100 dark:border-zinc-800">
                <RadialProgressChart
                  value={resolutionRate}
                  label="Workload Done"
                  color="#10b981"
                  height={200}
                  sublabel={`${resolvedCount} of ${totalAssigned} resolved`}
                />
              </div>

              {/* Progress Bars Breakdown */}
              <div className="md:col-span-8 space-y-4">
                <ApexProgressBar
                  value={resolutionRate}
                  label="Resolved Incident Rate"
                  color="#10b981"
                  height={32}
                />
                <ApexProgressBar
                  value={inProgressRate}
                  label="Currently In Progress"
                  color="#f59e0b"
                  height={32}
                />
                <ApexProgressBar
                  value={totalAssigned > 0 ? Math.round(((totalAssigned - inProgressCount - resolvedCount) / totalAssigned) * 100) : 0}
                  label="Queued / Awaiting Triage"
                  color="#3b82f6"
                  height={32}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {(['ALL', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === tab
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {tab === 'ALL'
              ? 'All Incidents'
              : tab === 'ASSIGNED'
              ? 'Awaiting Work'
              : tab === 'IN_PROGRESS'
              ? 'Active Work'
              : 'Resolved'}
          </button>
        ))}
      </div>

      {/* Queue Table */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <Loader2 className="size-6 animate-spin text-[#6f1a7e]" />
          <span className="text-xs text-zinc-500 mt-2">Loading assigned incidents...</span>
        </div>
      ) : filteredTickets.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No tickets in this queue"
          description="You currently have no tickets matching this state filter."
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50/70 dark:bg-zinc-900/60">
              <TableRow className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                <TableHead className="w-[110px] text-xs font-semibold">Ticket #</TableHead>
                <TableHead className="text-xs font-semibold">Summary</TableHead>
                <TableHead className="w-[110px] text-xs font-semibold">Priority</TableHead>
                <TableHead className="w-[120px] text-xs font-semibold">Status</TableHead>
                <TableHead className="text-xs font-semibold">Requester</TableHead>
                <TableHead className="w-[110px] text-xs font-semibold text-right">Logged</TableHead>
                <TableHead className="w-[140px] text-xs font-semibold text-right">Quick Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => {
                const requesterName = ticket.employee
                  ? `${ticket.employee.firstName || ticket.employee.first_name || ''} ${
                      ticket.employee.lastName || ticket.employee.last_name || ''
                    }`.trim()
                  : 'Staff';

                return (
                  <TableRow
                    key={ticket.id}
                    className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
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
                      <PriorityBadge priority={ticket.priority} />
                    </TableCell>

                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                          {requesterName}
                        </span>
                        <span className="text-[11px] text-zinc-400">
                          {ticket.department?.name || 'IS'}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right text-xs text-zinc-500">
                      {formatRelativeTime(ticket.createdAt)}
                    </TableCell>

                    <TableCell className="text-right">
                      {ticket.status === 'ASSIGNED' || ticket.status === 'OPEN' ? (
                        <Button
                          size="xs"
                          onClick={() => handleStartWork(ticket.id)}
                          className="bg-amber-600 hover:bg-amber-700 text-white text-[11px]"
                        >
                          <PlayCircle className="size-3 mr-1" />
                          Start
                        </Button>
                      ) : ticket.status === 'IN_PROGRESS' ? (
                        <Button
                          size="xs"
                          onClick={() => setResolveTarget(ticket)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px]"
                        >
                          <CheckCircle2 className="size-3 mr-1" />
                          Resolve
                        </Button>
                      ) : (
                        <Link href={`/tickets/${ticket.id}`}>
                          <Button variant="ghost" size="xs">
                            View <ChevronRight className="size-3 ml-0.5" />
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Quick Resolve Modal */}
      {resolveTarget && (
        <ResolveModal
          isOpen={!!resolveTarget}
          onClose={() => setResolveTarget(null)}
          ticketId={resolveTarget.id}
          ticketNumber={resolveTarget.ticketNumber}
          onResolved={() => loadData(true)}
        />
      )}
    </div>
  );
}
