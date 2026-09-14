import { ticket_status, ticket_priority, user_role } from '@prisma/client';

export interface HistoryTimelineEvent {
  id: string;
  ticketId: string;
  previousStatus: ticket_status | null;
  newStatus: ticket_status;
  changedAt: Date;
  reason: string | null;
  durationInPreviousStateMs: number | null;
  durationFormatted: string | null;
  actor: {
    id: string;
    firstName: string;
    lastName: string;
    role: user_role;
    email: string;
    employeeId: string | null;
  };
}

export interface StageDuration {
  status: ticket_status;
  durationMs: number;
  durationHours: number;
  formatted: string;
}

export interface TicketLifecycleAnalytics {
  ticketId: string;
  ticketNumber: string;
  title: string;
  currentStatus: ticket_status;
  priority: ticket_priority;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt: Date | null;
  closedAt: Date | null;
  isTerminal: boolean;
  totalLifespanHours: number;
  timeToFirstAssignmentHours: number | null;
  timeToInvestigationHours: number | null;
  timeToResolutionHours: number | null;
  timeToClosureHours: number | null;
  stageBreakdown: Record<ticket_status, StageDuration>;
  slaTargetHours: number;
  slaBreached: boolean;
  slaMarginHours: number;
  timeline: HistoryTimelineEvent[];
}

export interface AuditLogQueryFilters {
  page?: number;
  limit?: number;
  ticketId?: string;
  changedBy?: string;
  previousStatus?: ticket_status;
  newStatus?: ticket_status;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface TransitionInput {
  targetStatus: ticket_status;
  reason?: string;
  resolutionNotes?: string;
  technicianId?: string;
}
