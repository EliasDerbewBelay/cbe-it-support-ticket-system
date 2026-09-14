'use client';

import React from 'react';

interface ApexProgressBarProps {
  value?: number; // 0 to 100
  label?: string;
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export function ApexProgressBar({
  value = 0,
  label,
  color = '#6f1a7e',
  showPercentage = true,
}: ApexProgressBarProps) {
  const safeValue =
    typeof value === 'number' && !isNaN(value)
      ? Math.min(Math.max(Math.round(value), 0), 100)
      : 0;

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {label && (
            <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate mr-2">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100 shrink-0 ml-auto">
              {safeValue}%
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800/80 overflow-hidden border border-zinc-200/50 dark:border-zinc-800">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${safeValue}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
