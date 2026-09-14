import React from 'react';
import { UserRole } from '@/types/auth';
import { ROLE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Shield, Wrench, User } from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const config = ROLE_CONFIG[role] || {
    label: role,
    badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  };

  const getIcon = () => {
    switch (role) {
      case 'ADMINISTRATOR':
        return <Shield className="size-3 text-amber-600 dark:text-amber-400" />;
      case 'TECHNICIAN':
        return <Wrench className="size-3 text-purple-600 dark:text-purple-400" />;
      case 'EMPLOYEE':
        return <User className="size-3 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        config.badgeClass,
        className
      )}
    >
      {getIcon()}
      <span>{config.label}</span>
    </span>
  );
}
