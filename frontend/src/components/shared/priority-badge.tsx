import React from 'react';
import { TicketPriority } from '@/types/ticket';
import { PRIORITY_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp } from 'lucide-react';

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
  showIcon?: boolean;
}

export function PriorityBadge({ priority, className, showIcon = true }: PriorityBadgeProps) {
  const config = PRIORITY_CONFIG[priority] || {
    label: priority,
    badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  };

  const renderIcon = () => {
    switch (priority) {
      case 'CRITICAL':
        return <AlertCircle className="size-3 text-red-600 dark:text-red-400" />;
      case 'HIGH':
        return <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400" />;
      case 'MEDIUM':
        return <ArrowUp className="size-3 text-blue-600 dark:text-blue-400" />;
      case 'LOW':
        return <ArrowDown className="size-3 text-zinc-500 dark:text-zinc-400" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border transition-colors',
        config.badgeClass,
        className
      )}
    >
      {showIcon && renderIcon()}
      <span>{config.label}</span>
    </span>
  );
}
