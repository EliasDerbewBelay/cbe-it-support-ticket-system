import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30',
        className
      )}
    >
      <div className="flex items-center justify-center size-12 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 mb-4">
        <Icon className="size-6" />
      </div>
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
