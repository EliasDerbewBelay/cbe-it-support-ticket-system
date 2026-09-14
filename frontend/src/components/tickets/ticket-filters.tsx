import React from 'react';
import { TicketPriority, TicketStatus } from '@/types/ticket';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, LayoutGrid, List, RotateCcw } from 'lucide-react';

interface TicketFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: TicketStatus | 'ALL';
  onStatusChange: (status: TicketStatus | 'ALL') => void;
  priority: TicketPriority | 'ALL';
  onPriorityChange: (priority: TicketPriority | 'ALL') => void;
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
  onReset?: () => void;
}

export function TicketFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  viewMode,
  onViewModeChange,
  onReset,
}: TicketFiltersProps) {
  const isFiltered = search !== '' || status !== 'ALL' || priority !== 'ALL';

  return (
    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs">
      {/* Search Input */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
        <Input
          placeholder="Search ticket #, title, or description..."
          className="pl-9 h-9 text-xs"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter Selects */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="w-[130px]">
          <Select
            value={status}
            onValueChange={(val) => onStatusChange((val || 'ALL') as TicketStatus | 'ALL')}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="ASSIGNED">Assigned</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-[130px]">
          <Select
            value={priority}
            onValueChange={(val) => onPriorityChange((val || 'ALL') as TicketPriority | 'ALL')}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priorities</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isFiltered && onReset && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-9 px-2.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            <RotateCcw className="size-3.5 mr-1" />
            Reset
          </Button>
        )}

        {/* View Switcher */}
        <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 bg-zinc-50 dark:bg-zinc-900 ml-auto">
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'table'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-700'
            }`}
            title="Table View"
          >
            <List className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('cards')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-xs'
                : 'text-zinc-400 hover:text-zinc-700'
            }`}
            title="Card View"
          >
            <LayoutGrid className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
