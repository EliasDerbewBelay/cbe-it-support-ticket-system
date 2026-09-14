import { Prisma, ticket_priority, ticket_status } from '@prisma/client';
import { prisma } from '../config/database';
import { SanitizedUser } from '../types/auth';
import {
  AuditLogQueryFilters,
  HistoryTimelineEvent,
  StageDuration,
  TicketLifecycleAnalytics,
  TransitionInput,
} from '../types/lifecycle';
import {
  getAllowedTransitions,
  getValidTransitionRule,
  isTerminalState,
} from '../utils/fsm';
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from './ticketService';

/**
 * Helper to format duration milliseconds into a human-readable string
 */
export const formatDurationMs = (ms: number): string => {
  if (ms < 1000) return '< 1s';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    return `${days}d ${remHours}h`;
  }
  if (hours > 0) {
    const remMins = minutes % 60;
    return `${hours}h ${remMins}m`;
  }
  if (minutes > 0) {
    const remSecs = seconds % 60;
    return `${minutes}m ${remSecs}s`;
  }
  return `${seconds}s`;
};

/**
 * Standard SLA resolution targets per CBE priority tier (in hours)
 */
export const getSlaTargetHours = (priority: ticket_priority): number => {
  switch (priority) {
    case 'CRITICAL':
      return 4;
    case 'HIGH':
      return 8;
    case 'MEDIUM':
      return 24;
    case 'LOW':
      return 72;
    default:
      return 24;
  }
};

/**
 * Retrieve chronological status history timeline for a single ticket
 */
export const getTicketHistory = async (
  ticketId: string,
  requestingUser: SanitizedUser
) => {
  const ticket = await prisma.tickets.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      ticket_number: true,
      status: true,
      employee_id: true,
      resolved_by: true,
      ticket_assignments: {
        where: { is_current: true },
        select: { technician_id: true },
      },
    },
  });

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  // Scoping checks (Rule 1 & Rule 5)
  if (requestingUser.role === 'EMPLOYEE' && ticket.employee_id !== requestingUser.id) {
    throw new ForbiddenError('Access denied: You can only view the history of your own tickets.');
  }

  if (requestingUser.role === 'TECHNICIAN') {
    const isAssigned = ticket.ticket_assignments.some(
      (a) => a.technician_id === requestingUser.id
    );
    const isResolver = ticket.resolved_by === requestingUser.id;
    const isSubmitter = ticket.employee_id === requestingUser.id;

    if (!isAssigned && !isResolver && !isSubmitter) {
      throw new ForbiddenError('Access denied: You are not authorized to view the history of tickets assigned to other technicians.');
    }
  }

  const rawHistory = await prisma.ticket_status_history.findMany({
    where: { ticket_id: ticketId },
    orderBy: { changed_at: 'asc' },
    include: {
      actor: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          role: true,
          email: true,
          employee_id: true,
        },
      },
    },
  });

  const events: HistoryTimelineEvent[] = rawHistory.map((item, index) => {
    let durationInPreviousStateMs: number | null = null;
    let durationFormatted: string | null = null;

    if (index > 0) {
      const prevChangedAt = rawHistory[index - 1].changed_at.getTime();
      const currentChangedAt = item.changed_at.getTime();
      durationInPreviousStateMs = Math.max(0, currentChangedAt - prevChangedAt);
      durationFormatted = formatDurationMs(durationInPreviousStateMs);
    }

    return {
      id: item.id,
      ticketId: item.ticket_id,
      previousStatus: item.previous_status,
      newStatus: item.new_status,
      changedAt: item.changed_at,
      reason: item.reason,
      durationInPreviousStateMs,
      durationFormatted,
      actor: {
        id: item.actor.id,
        firstName: item.actor.first_name,
        lastName: item.actor.last_name,
        role: item.actor.role,
        email: item.actor.email,
        employeeId: item.actor.employee_id,
      },
    };
  });

  return {
    ticketId: ticket.id,
    ticketNumber: ticket.ticket_number,
    currentStatus: ticket.status,
    totalTransitions: events.length,
    events,
  };
};

/**
 * Retrieve comprehensive lifecycle SLA metrics and stage durations for a ticket
 */
export const getTicketLifecycleAnalytics = async (
  ticketId: string,
  requestingUser: SanitizedUser
): Promise<TicketLifecycleAnalytics> => {
  const ticket = await prisma.tickets.findUnique({
    where: { id: ticketId },
    include: {
      employee: {
        select: { id: true, first_name: true, last_name: true, email: true },
      },
      ticket_assignments: {
        where: { is_current: true },
        select: { technician_id: true },
      },
    },
  });

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  // Scoping checks
  if (requestingUser.role === 'EMPLOYEE' && ticket.employee_id !== requestingUser.id) {
    throw new ForbiddenError('Access denied: You can only view lifecycle analytics for your own tickets.');
  }

  if (requestingUser.role === 'TECHNICIAN') {
    const isAssigned = ticket.ticket_assignments.some(
      (a) => a.technician_id === requestingUser.id
    );
    const isResolver = ticket.resolved_by === requestingUser.id;
    const isSubmitter = ticket.employee_id === requestingUser.id;

    if (!isAssigned && !isResolver && !isSubmitter) {
      throw new ForbiddenError('Access denied: You are not authorized to view lifecycle analytics for this ticket.');
    }
  }

  const historyResult = await getTicketHistory(ticketId, requestingUser);
  const events = historyResult.events;

  const nowTime = new Date().getTime();
  const createdTime = ticket.created_at.getTime();

  // Total lifespan
  const endTime = ticket.closed_at ? ticket.closed_at.getTime() : nowTime;
  const totalLifespanHours = Number(Math.max(0, (endTime - createdTime) / 3600000).toFixed(2));

  // SLA thresholds
  const slaTargetHours = getSlaTargetHours(ticket.priority);

  // Milestone durations
  let timeToFirstAssignmentHours: number | null = null;
  let timeToInvestigationHours: number | null = null;
  let timeToResolutionHours: number | null = null;
  let timeToClosureHours: number | null = null;

  const firstAssigned = events.find((e) => e.newStatus === 'ASSIGNED');
  if (firstAssigned) {
    timeToFirstAssignmentHours = Number(
      Math.max(0, (firstAssigned.changedAt.getTime() - createdTime) / 3600000).toFixed(2)
    );
  }

  const firstInProgress = events.find((e) => e.newStatus === 'IN_PROGRESS');
  if (firstInProgress && firstAssigned) {
    timeToInvestigationHours = Number(
      Math.max(0, (firstInProgress.changedAt.getTime() - firstAssigned.changedAt.getTime()) / 3600000).toFixed(2)
    );
  }

  if (ticket.resolved_at) {
    timeToResolutionHours = Number(
      Math.max(0, (ticket.resolved_at.getTime() - createdTime) / 3600000).toFixed(2)
    );
  }

  if (ticket.closed_at && ticket.resolved_at) {
    timeToClosureHours = Number(
      Math.max(0, (ticket.closed_at.getTime() - ticket.resolved_at.getTime()) / 3600000).toFixed(2)
    );
  }

  // Calculate stage breakdown
  const stageDurationsMs: Record<ticket_status, number> = {
    OPEN: 0,
    ASSIGNED: 0,
    IN_PROGRESS: 0,
    RESOLVED: 0,
    CLOSED: 0,
    CANCELLED: 0,
  };

  for (let i = 0; i < events.length; i++) {
    const currentEvent = events[i];
    const nextEvent = events[i + 1];
    const segmentStart = currentEvent.changedAt.getTime();
    const segmentEnd = nextEvent ? nextEvent.changedAt.getTime() : endTime;
    const segmentDuration = Math.max(0, segmentEnd - segmentStart);

    stageDurationsMs[currentEvent.newStatus] += segmentDuration;
  }

  const stageBreakdown: Record<ticket_status, StageDuration> = {
    OPEN: {
      status: 'OPEN',
      durationMs: stageDurationsMs.OPEN,
      durationHours: Number((stageDurationsMs.OPEN / 3600000).toFixed(2)),
      formatted: formatDurationMs(stageDurationsMs.OPEN),
    },
    ASSIGNED: {
      status: 'ASSIGNED',
      durationMs: stageDurationsMs.ASSIGNED,
      durationHours: Number((stageDurationsMs.ASSIGNED / 3600000).toFixed(2)),
      formatted: formatDurationMs(stageDurationsMs.ASSIGNED),
    },
    IN_PROGRESS: {
      status: 'IN_PROGRESS',
      durationMs: stageDurationsMs.IN_PROGRESS,
      durationHours: Number((stageDurationsMs.IN_PROGRESS / 3600000).toFixed(2)),
      formatted: formatDurationMs(stageDurationsMs.IN_PROGRESS),
    },
    RESOLVED: {
      status: 'RESOLVED',
      durationMs: stageDurationsMs.RESOLVED,
      durationHours: Number((stageDurationsMs.RESOLVED / 3600000).toFixed(2)),
      formatted: formatDurationMs(stageDurationsMs.RESOLVED),
    },
    CLOSED: {
      status: 'CLOSED',
      durationMs: stageDurationsMs.CLOSED,
      durationHours: Number((stageDurationsMs.CLOSED / 3600000).toFixed(2)),
      formatted: formatDurationMs(stageDurationsMs.CLOSED),
    },
    CANCELLED: {
      status: 'CANCELLED',
      durationMs: stageDurationsMs.CANCELLED,
      durationHours: Number((stageDurationsMs.CANCELLED / 3600000).toFixed(2)),
      formatted: formatDurationMs(stageDurationsMs.CANCELLED),
    },
  };

  // SLA breach computation
  const resolutionElapsedHours = timeToResolutionHours ?? totalLifespanHours;
  const slaBreached = resolutionElapsedHours > slaTargetHours;
  const slaMarginHours = Number((slaTargetHours - resolutionElapsedHours).toFixed(2));

  return {
    ticketId: ticket.id,
    ticketNumber: ticket.ticket_number,
    title: ticket.title,
    currentStatus: ticket.status,
    priority: ticket.priority,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    resolvedAt: ticket.resolved_at,
    closedAt: ticket.closed_at,
    isTerminal: isTerminalState(ticket.status),
    totalLifespanHours,
    timeToFirstAssignmentHours,
    timeToInvestigationHours,
    timeToResolutionHours,
    timeToClosureHours,
    stageBreakdown,
    slaTargetHours,
    slaBreached,
    slaMarginHours,
    timeline: events,
  };
};

/**
 * Retrieve permitted next states from the current status according to the user's role
 */
export const getAllowedTransitionsForTicket = async (
  ticketId: string,
  requestingUser: SanitizedUser
) => {
  const ticket = await prisma.tickets.findUnique({
    where: { id: ticketId },
    select: {
      id: true,
      status: true,
      employee_id: true,
      resolved_by: true,
      ticket_assignments: {
        where: { is_current: true },
        select: { technician_id: true },
      },
    },
  });

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  // If employee: only allowed cancellation if OPEN
  if (requestingUser.role === 'EMPLOYEE' && ticket.employee_id !== requestingUser.id) {
    throw new ForbiddenError('Access denied: You do not own this ticket.');
  }

  // If technician: only allowed actions if assigned
  if (requestingUser.role === 'TECHNICIAN') {
    const isAssigned = ticket.ticket_assignments.some(
      (a) => a.technician_id === requestingUser.id
    );
    if (!isAssigned) {
      throw new ForbiddenError('Access denied: You are not assigned to this ticket.');
    }
  }

  const transitions = getAllowedTransitions(ticket.status, requestingUser.role);

  return {
    ticketId: ticket.id,
    currentStatus: ticket.status,
    role: requestingUser.role,
    allowedTransitions: transitions,
  };
};

/**
 * Global audit trail log of all status transitions (Administrator exclusive)
 */
export const getGlobalStatusAuditLog = async (filters: AuditLogQueryFilters) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.ticket_status_historyWhereInput = {};

  if (filters.ticketId) {
    where.ticket_id = filters.ticketId;
  }

  if (filters.changedBy) {
    where.changed_by = filters.changedBy;
  }

  if (filters.previousStatus) {
    where.previous_status = filters.previousStatus;
  }

  if (filters.newStatus) {
    where.new_status = filters.newStatus;
  }

  if (filters.startDate || filters.endDate) {
    where.changed_at = {};
    if (filters.startDate) where.changed_at.gte = filters.startDate;
    if (filters.endDate) where.changed_at.lte = filters.endDate;
  }

  if (filters.search) {
    where.OR = [
      { reason: { contains: filters.search, mode: 'insensitive' } },
      { ticket: { ticket_number: { contains: filters.search, mode: 'insensitive' } } },
      { ticket: { title: { contains: filters.search, mode: 'insensitive' } } },
      { actor: { first_name: { contains: filters.search, mode: 'insensitive' } } },
      { actor: { last_name: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  const [total, rawLogs] = await Promise.all([
    prisma.ticket_status_history.count({ where }),
    prisma.ticket_status_history.findMany({
      where,
      skip,
      take: limit,
      orderBy: { changed_at: 'desc' },
      include: {
        ticket: {
          select: {
            id: true,
            ticket_number: true,
            title: true,
            priority: true,
            status: true,
          },
        },
        actor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            role: true,
            email: true,
            employee_id: true,
          },
        },
      },
    }),
  ]);

  const logs = rawLogs.map((log) => ({
    id: log.id,
    ticket: {
      id: log.ticket.id,
      ticketNumber: log.ticket.ticket_number,
      title: log.ticket.title,
      priority: log.ticket.priority,
      status: log.ticket.status,
    },
    previousStatus: log.previous_status,
    newStatus: log.new_status,
    changedAt: log.changed_at,
    reason: log.reason,
    actor: {
      id: log.actor.id,
      name: `${log.actor.first_name} ${log.actor.last_name}`,
      role: log.actor.role,
      email: log.actor.email,
      employeeId: log.actor.employee_id,
    },
  }));

  return {
    logs,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Execute a formal FSM status transition with validation and atomic audit logging
 */
export const executeStatusTransition = async (
  ticketId: string,
  input: TransitionInput,
  requestingUser: SanitizedUser
) => {
  const ticket = await prisma.tickets.findUnique({
    where: { id: ticketId },
    include: {
      ticket_assignments: {
        where: { is_current: true },
      },
    },
  });

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  // Check terminal state invariant (BR-08)
  if (isTerminalState(ticket.status)) {
    throw new ValidationError(
      `Cannot transition a ticket in terminal status ${ticket.status}. Closed or cancelled tickets are immutable.`
    );
  }

  // Check FSM rule
  const rule = getValidTransitionRule(ticket.status, input.targetStatus, requestingUser.role);

  if (!rule) {
    throw new ValidationError(
      `Invalid state transition: Cannot transition ticket from ${ticket.status} to ${input.targetStatus} with role ${requestingUser.role}.`
    );
  }

  // Scoping validations
  if (requestingUser.role === 'EMPLOYEE') {
    if (ticket.employee_id !== requestingUser.id) {
      throw new ForbiddenError('Access denied: You can only transition your own tickets.');
    }
  }

  if (requestingUser.role === 'TECHNICIAN') {
    const isAssigned = ticket.ticket_assignments.some(
      (a) => a.technician_id === requestingUser.id && a.is_current
    );
    if (!isAssigned) {
      throw new ForbiddenError('Access denied: You are not the currently assigned technician.');
    }
  }

  // Rule requirement validations
  if (rule.requiresReason && (!input.reason || input.reason.trim().length < 5)) {
    throw new ValidationError(`A reason (minimum 5 characters) is required to transition to ${input.targetStatus}.`);
  }

  if (rule.requiresResolutionNotes && (!input.resolutionNotes || input.resolutionNotes.trim().length < 20)) {
    throw new ValidationError('Resolution notes (minimum 20 characters) are required when resolving a ticket.');
  }

  let targetTechnicianId: string | undefined = undefined;
  if (rule.requiresTechnician) {
    if (!input.technicianId) {
      throw new ValidationError(`A technician must be designated when transitioning to ${input.targetStatus}.`);
    }
    const technician = await prisma.users.findUnique({
      where: { id: input.technicianId },
    });
    if (!technician || technician.role !== 'TECHNICIAN' || !technician.is_active) {
      throw new ValidationError('The specified technician does not exist or is inactive.');
    }
    targetTechnicianId = input.technicianId;
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    // 1. If technician assignment is involved (OPEN -> ASSIGNED or ASSIGNED -> ASSIGNED)
    if (targetTechnicianId) {
      await tx.ticket_assignments.updateMany({
        where: { ticket_id: ticketId, is_current: true },
        data: { is_current: false, unassigned_at: now },
      });

      await tx.ticket_assignments.create({
        data: {
          ticket_id: ticketId,
          technician_id: targetTechnicianId,
          assigned_by: requestingUser.id,
          assigned_at: now,
          is_current: true,
          notes: input.reason?.trim() || null,
        },
      });
    }

    // 2. Prepare ticket updates
    const dataUpdate: Prisma.ticketsUncheckedUpdateInput = {
      status: input.targetStatus,
      updated_at: now,
    };

    if (input.targetStatus === 'RESOLVED') {
      dataUpdate.resolution = input.resolutionNotes?.trim();
      dataUpdate.resolved_by = requestingUser.id;
      dataUpdate.resolved_at = now;
    } else if (input.targetStatus === 'CLOSED') {
      dataUpdate.closed_by = requestingUser.id;
      dataUpdate.closed_at = now;
    }

    const updatedTicket = await tx.tickets.update({
      where: { id: ticketId },
      data: dataUpdate,
      include: {
        category: true,
        department: true,
        employee: {
          select: { id: true, first_name: true, last_name: true, email: true },
        },
        ticket_assignments: {
          where: { is_current: true },
          include: {
            technician: {
              select: { id: true, first_name: true, last_name: true, email: true },
            },
          },
        },
      },
    });

    // 3. Record in audit history
    const transitionLog = await tx.ticket_status_history.create({
      data: {
        ticket_id: ticketId,
        changed_by: requestingUser.id,
        previous_status: ticket.status,
        new_status: input.targetStatus,
        reason:
          input.resolutionNotes?.trim() ||
          input.reason?.trim() ||
          rule.description,
      },
      include: {
        actor: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            role: true,
          },
        },
      },
    });

    // 4. If resolution or comment provided, record as comment
    if (input.resolutionNotes) {
      await tx.ticket_comments.create({
        data: {
          ticket_id: ticketId,
          author_id: requestingUser.id,
          content: `Issue Resolved: ${input.resolutionNotes.trim()}`,
          is_internal: false,
        },
      });
    }

    return {
      ticket: updatedTicket,
      transition: transitionLog,
    };
  });
};
