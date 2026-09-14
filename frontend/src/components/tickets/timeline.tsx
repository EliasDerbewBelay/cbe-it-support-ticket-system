import React from 'react';
import { TicketStatusHistory } from '@/types/ticket';
import { StatusBadge } from '@/components/shared/status-badge';
import { RoleBadge } from '@/components/shared/role-badge';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import { ArrowRight, History } from 'lucide-react';

interface TimelineProps {
  history: TicketStatusHistory[];
}

export function Timeline({ history }: TimelineProps) {
  if (!history || history.length === 0) {
    return (
      <div className="flex items-center gap-2 p-4 text-xs text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/30 rounded-lg border border-dashed border-zinc-200 dark:border-zinc-800">
        <History className="size-4" />
        <span>No lifecycle transitions recorded yet.</span>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
      {history.map((event, index) => {
        const actorName = event.actor
          ? `${event.actor.firstName || event.actor.first_name || ''} ${
              event.actor.lastName || event.actor.last_name || ''
            }`.trim()
          : 'System Actor';

        return (
          <div key={event.id || index} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-6 top-1.5 size-4 rounded-full border-2 border-white dark:border-zinc-900 bg-[#6f1a7e] shadow-xs" />

            <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {event.previousStatus && (
                    <>
                      <StatusBadge status={event.previousStatus} showDot={false} />
                      <ArrowRight className="size-3 text-zinc-400" />
                    </>
                  )}
                  <StatusBadge status={event.newStatus} />
                </div>

                <span className="text-[11px] text-zinc-400" title={formatDate(event.changedAt)}>
                  {formatRelativeTime(event.changedAt)}
                </span>
              </div>

              {event.reason && (
                <p className="text-xs text-zinc-600 dark:text-zinc-300 bg-zinc-50 dark:bg-zinc-800/60 p-2 rounded border border-zinc-100 dark:border-zinc-800">
                  <span className="font-medium text-zinc-700 dark:text-zinc-200">Note: </span>
                  {event.reason}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1 text-[11px] text-zinc-500">
                <span>By {actorName}</span>
                {event.actor?.role && <RoleBadge role={event.actor.role} />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
