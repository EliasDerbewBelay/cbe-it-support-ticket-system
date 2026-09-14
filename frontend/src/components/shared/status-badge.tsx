import React from 'react';
import { TicketStatus } from '@/types/ticket';
import { STATUS_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
  showDot?: boolean;
}

export function StatusBadge({ status, className, showDot = true }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: status,
    badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    dotClass: 'bg-zinc-400',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors',
        config.badgeClass,
        className
      )}
    >
      {showDot && (
        <span
          className={cn('size-1.5 rounded-full shrink-0', config.dotClass)}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  );
}
