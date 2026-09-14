'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api/admin';
import { AuditLogItem } from '@/types/admin';
import { PageHeader } from '@/components/shared/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { RoleBadge } from '@/components/shared/role-badge';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EmptyState } from '@/components/shared/empty-state';
import { toast } from 'sonner';
import { History, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadLogs = useCallback(
    async (showRefresh = false) => {
      if (showRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const data = await adminApi.getAuditLogs({
          newStatus: statusFilter === 'ALL' ? undefined : statusFilter,
          limit: 100,
        });
        setLogs(data.logs || []);
      } catch (err: any) {
        toast.error(err?.message || 'Failed to retrieve system audit logs');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [statusFilter]
  );

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Audit & Lifecycle Trail"
        description="Immutable chronological register of all incident state transitions, technician handovers, and resolution events."
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadLogs(true)}
          disabled={isRefreshing}
          className="text-xs"
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Trail
        </Button>
      </PageHeader>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500">Filter Transition:</span>
          <div className="w-[150px]">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
              <SelectTrigger className="h-8.5 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Transitions</SelectItem>
                <SelectItem value="OPEN">Opened</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <span className="text-xs text-zinc-400 font-mono">{logs.length} logged events</span>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <Loader2 className="size-6 animate-spin text-[#6f1a7e]" />
          <span className="text-xs text-zinc-500 mt-2 font-medium">Reading audit journal...</span>
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          icon={History}
          title="No audit events found"
          description="There are no lifecycle transition events logged for this filter."
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50/70 dark:bg-zinc-900/60">
              <TableRow className="border-b border-zinc-200 dark:border-zinc-800">
                <TableHead className="w-[140px] text-xs font-semibold">Timestamp</TableHead>
                <TableHead className="w-[110px] text-xs font-semibold">Incident #</TableHead>
                <TableHead className="w-[240px] text-xs font-semibold">State Transition</TableHead>
                <TableHead className="text-xs font-semibold">Actor / User</TableHead>
                <TableHead className="text-xs font-semibold">Audit Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const actorName = log.actor
                  ? `${log.actor.firstName || ''} ${log.actor.lastName || ''}`.trim()
                  : 'System Service';

                return (
                  <TableRow
                    key={log.id}
                    className="border-b border-zinc-100 dark:border-zinc-800/60 hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40"
                  >
                    <TableCell className="text-xs text-zinc-500 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300">
                          {formatDate(log.changedAt)}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {formatRelativeTime(log.changedAt)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="font-mono text-xs font-semibold text-[#6f1a7e] dark:text-purple-400">
                      <Link href={`/tickets/${log.ticketId}`} className="hover:underline">
                        {log.ticket?.ticketNumber || 'TKT-RECORD'}
                      </Link>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {log.previousStatus && (
                          <>
                            <StatusBadge status={log.previousStatus} showDot={false} />
                            <ArrowRight className="size-3 text-zinc-400" />
                          </>
                        )}
                        <StatusBadge status={log.newStatus} />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                          {actorName}
                        </span>
                        {log.actor?.role && <RoleBadge role={log.actor.role} />}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-zinc-600 dark:text-zinc-300 max-w-sm">
                      {log.reason ? (
                        <span className="italic">{log.reason}</span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
