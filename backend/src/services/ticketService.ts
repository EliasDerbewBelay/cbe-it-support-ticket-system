import { Prisma, user_role } from '@prisma/client';
import { prisma } from '../config/database';
import {
  CreateTicketInput,
  TicketQueryFilters,
  EmployeeDashboardSummary,
  TechnicianDashboardSummary,
  AssignedTicketQueryFilters,
  UpdateTicketStatusInput,
} from '../types/ticket';
import { SanitizedUser } from '../types/auth';

export class NotFoundError extends Error {
  statusCode: number;
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export class ValidationError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

export class ForbiddenError extends Error {
  statusCode: number;
  constructor(message: string = 'Forbidden: Access denied') {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

/**
 * Submit a new IT support ticket
 */
export const createTicket = async (
  employeeId: string,
  departmentId: string,
  input: CreateTicketInput
) => {
  // Validate that the category exists and is currently active
  const category = await prisma.categories.findUnique({
    where: { id: input.categoryId },
  });

  if (!category || !category.is_active) {
    throw new ValidationError('Selected category does not exist or is inactive.');
  }

  // Create Ticket and initial Status History atomically in a transaction
  return prisma.$transaction(async (tx) => {
    const newTicket = await tx.tickets.create({
      data: {
        title: input.title.trim(),
        description: input.description.trim(),
        category_id: input.categoryId,
        priority: input.priority || 'MEDIUM',
        status: 'OPEN',
        employee_id: employeeId,
        department_id: departmentId,
      },
      include: {
        category: {
          select: { id: true, name: true, description: true },
        },
        department: {
          select: { id: true, name: true },
        },
      },
    });

    // Append initial status history entry (null -> OPEN)
    await tx.ticket_status_history.create({
      data: {
        ticket_id: newTicket.id,
        changed_by: employeeId,
        previous_status: null,
        new_status: 'OPEN',
        reason: 'Ticket submitted by employee',
      },
    });

    return newTicket;
  });
};

/**
 * Retrieve paginated tickets submitted by the authenticated employee
 */
export const getEmployeeTickets = async (
  employeeId: string,
  filters: TicketQueryFilters
) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  // Build filter conditions restricted to the employee's ownership
  const where: Prisma.ticketsWhereInput = {
    employee_id: employeeId,
  };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.categoryId) {
    where.category_id = filters.categoryId;
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { ticket_number: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [total, tickets] = await Promise.all([
    prisma.tickets.count({ where }),
    prisma.tickets.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        category: {
          select: { id: true, name: true },
        },
        department: {
          select: { id: true, name: true },
        },
        ticket_assignments: {
          where: { is_current: true },
          take: 1,
          include: {
            technician: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    tickets,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Retrieve comprehensive details for a single ticket with role-based masking
 */
export const getTicketDetails = async (
  ticketId: string,
  requestingUser: SanitizedUser
) => {
  const ticket = await prisma.tickets.findUnique({
    where: { id: ticketId },
    include: {
      category: {
        select: { id: true, name: true, description: true },
      },
      department: {
        select: { id: true, name: true, description: true },
      },
      employee: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone_number: true,
          employee_id: true,
        },
      },
      ticket_assignments: {
        where: { is_current: true },
        include: {
          technician: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
              phone_number: true,
            },
          },
          assigned_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      },
      ticket_comments: {
        orderBy: { created_at: 'asc' },
        include: {
          author: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              role: true,
            },
          },
        },
      },
      ticket_status_history: {
        orderBy: { changed_at: 'asc' },
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
      },
    },
  });

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  // Enforce resource ownership: Employees can only view tickets they submitted
  if (requestingUser.role === 'EMPLOYEE' && ticket.employee_id !== requestingUser.id) {
    throw new ForbiddenError('Access denied: You do not have permission to view this ticket.');
  }

  // Enforce Technician Operational Scope (Rule 5 / FR-TECH-06):
  // Technicians can only view tickets assigned to them, resolved by them, or submitted by them
  if (requestingUser.role === 'TECHNICIAN') {
    const isAssigned = ticket.ticket_assignments.some(
      (a) => a.technician_id === requestingUser.id
    );
    const isResolver = ticket.resolved_by === requestingUser.id;
    const isSubmitter = ticket.employee_id === requestingUser.id;

    if (!isAssigned && !isResolver && !isSubmitter) {
      throw new ForbiddenError('Access denied: You are not authorized to view tickets assigned to other technicians.');
    }
  }

  // Enforce Note Privacy (BR-11): Strip internal diagnostic notes from employee view
  if (requestingUser.role === 'EMPLOYEE') {
    ticket.ticket_comments = ticket.ticket_comments.filter((c) => !c.is_internal);
  }

  return ticket;
};

/**
 * Cancel an open ticket
 */
export const cancelTicket = async (
  ticketId: string,
  userId: string,
  userRole: user_role,
  reason: string
) => {
  const ticket = await prisma.tickets.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  // Verify permissions and lifecycle preconditions
  if (userRole === 'EMPLOYEE') {
    if (ticket.employee_id !== userId) {
      throw new ForbiddenError('Access denied: You can only cancel your own tickets.');
    }

    if (ticket.status !== 'OPEN') {
      throw new ValidationError(
        `Employees can only cancel tickets while in OPEN status. Current status is ${ticket.status}.`
      );
    }
  }

  if (ticket.status === 'CLOSED' || ticket.status === 'CANCELLED') {
    throw new ValidationError(`Cannot cancel a ticket that is already ${ticket.status}.`);
  }

  return prisma.$transaction(async (tx) => {
    const updatedTicket = await tx.tickets.update({
      where: { id: ticketId },
      data: { status: 'CANCELLED' },
      include: {
        category: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });

    await tx.ticket_status_history.create({
      data: {
        ticket_id: ticketId,
        changed_by: userId,
        previous_status: ticket.status,
        new_status: 'CANCELLED',
        reason: reason.trim(),
      },
    });

    return updatedTicket;
  });
};

/**
 * Append a communication comment to a ticket
 */
export const addComment = async (
  ticketId: string,
  authorId: string,
  authorRole: user_role,
  content: string,
  isInternal?: boolean
) => {
  const ticket = await prisma.tickets.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  // Employee validation
  if (authorRole === 'EMPLOYEE') {
    if (ticket.employee_id !== authorId) {
      throw new ForbiddenError('Access denied: You can only comment on your own tickets.');
    }

    if (ticket.status === 'CLOSED' || ticket.status === 'CANCELLED') {
      throw new ValidationError('Cannot add comments to a closed or cancelled ticket.');
    }
  }

  // Technician validation (FR-TECH-06 / Rule 5)
  if (authorRole === 'TECHNICIAN') {
    const isAssigned = await prisma.ticket_assignments.findFirst({
      where: {
        ticket_id: ticketId,
        technician_id: authorId,
        is_current: true,
      },
    });

    if (!isAssigned) {
      throw new ForbiddenError('Access denied: You can only add comments or notes to tickets actively assigned to you.');
    }

    if (ticket.status === 'CLOSED' || ticket.status === 'CANCELLED') {
      throw new ValidationError('Cannot add comments to a closed or cancelled ticket.');
    }
  }

  // Employees can never create internal notes (BR-11)
  const effectiveIsInternal = authorRole === 'EMPLOYEE' ? false : Boolean(isInternal);

  return prisma.ticket_comments.create({
    data: {
      ticket_id: ticketId,
      author_id: authorId,
      content: content.trim(),
      is_internal: effectiveIsInternal,
    },
    include: {
      author: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          role: true,
        },
      },
    },
  });
};

/**
 * Retrieve comments for a ticket with role-based filtering
 */
export const getComments = async (
  ticketId: string,
  requestingUser: SanitizedUser
) => {
  const ticket = await prisma.tickets.findUnique({
    where: { id: ticketId },
    select: { id: true, employee_id: true, resolved_by: true },
  });

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  if (requestingUser.role === 'EMPLOYEE' && ticket.employee_id !== requestingUser.id) {
    throw new ForbiddenError('Access denied: You can only view comments on your own tickets.');
  }

  if (requestingUser.role === 'TECHNICIAN') {
    const isAssigned = await prisma.ticket_assignments.findFirst({
      where: { ticket_id: ticketId, technician_id: requestingUser.id },
    });
    const isResolver = ticket.resolved_by === requestingUser.id;
    const isSubmitter = ticket.employee_id === requestingUser.id;

    if (!isAssigned && !isResolver && !isSubmitter) {
      throw new ForbiddenError('Access denied: You are not authorized to view comments for this ticket.');
    }
  }

  const where: Prisma.ticket_commentsWhereInput = {
    ticket_id: ticketId,
  };

  if (requestingUser.role === 'EMPLOYEE') {
    where.is_internal = false;
  }

  return prisma.ticket_comments.findMany({
    where,
    orderBy: { created_at: 'asc' },
    include: {
      author: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          role: true,
        },
      },
    },
  });
};

/**
 * Retrieve employee dashboard summary metrics
 */
export const getEmployeeDashboardSummary = async (
  employeeId: string
): Promise<EmployeeDashboardSummary> => {
  const [
    totalTickets,
    openTickets,
    assignedTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    cancelledTickets,
    recentRaw,
  ] = await Promise.all([
    prisma.tickets.count({ where: { employee_id: employeeId } }),
    prisma.tickets.count({ where: { employee_id: employeeId, status: 'OPEN' } }),
    prisma.tickets.count({ where: { employee_id: employeeId, status: 'ASSIGNED' } }),
    prisma.tickets.count({ where: { employee_id: employeeId, status: 'IN_PROGRESS' } }),
    prisma.tickets.count({ where: { employee_id: employeeId, status: 'RESOLVED' } }),
    prisma.tickets.count({ where: { employee_id: employeeId, status: 'CLOSED' } }),
    prisma.tickets.count({ where: { employee_id: employeeId, status: 'CANCELLED' } }),
    prisma.tickets.findMany({
      where: { employee_id: employeeId },
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        ticket_number: true,
        title: true,
        status: true,
        priority: true,
        created_at: true,
        category: {
          select: { name: true },
        },
      },
    }),
  ]);

  const recentTickets = recentRaw.map((t) => ({
    id: t.id,
    ticketNumber: t.ticket_number,
    title: t.title,
    status: t.status,
    priority: t.priority,
    categoryName: t.category.name,
    createdAt: t.created_at,
  }));

  return {
    totalTickets,
    openTickets,
    assignedTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    cancelledTickets,
    recentTickets,
  };
};

/**
 * Retrieve all active ticket categories for dropdowns
 */
export const getActiveCategories = async () => {
  return prisma.categories.findMany({
    where: { is_active: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
};

/**
 * Global ticket list for Administrators and Technicians with multi-dimensional filtering
 */
export const getAllTickets = async (
  filters: TicketQueryFilters,
  requestingUser?: SanitizedUser
) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.ticketsWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.categoryId) {
    where.category_id = filters.categoryId;
  }

  if (filters.departmentId) {
    where.department_id = filters.departmentId;
  }

  if (requestingUser?.role === 'TECHNICIAN') {
    where.ticket_assignments = {
      some: {
        technician_id: requestingUser.id,
        ...(filters.status === 'RESOLVED' || filters.status === 'CLOSED' ? {} : { is_current: true }),
      },
    };
  } else if (requestingUser?.role === 'EMPLOYEE') {
    where.employee_id = requestingUser.id;
  } else if (filters.technicianId) {
    where.ticket_assignments = {
      some: {
        technician_id: filters.technicianId,
        is_current: true,
      },
    };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { ticket_number: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [total, tickets] = await Promise.all([
    prisma.tickets.count({ where }),
    prisma.tickets.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      include: {
        category: {
          select: { id: true, name: true },
        },
        department: {
          select: { id: true, name: true },
        },
        employee: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            employee_id: true,
          },
        },
        ticket_assignments: {
          where: { is_current: true },
          take: 1,
          include: {
            technician: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return {
    tickets,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Assign or reassign an open/active ticket to a technician (Administrator capability)
 */
export const assignTechnician = async (
  ticketId: string,
  technicianId: string,
  adminId: string,
  assignmentNotes?: string
) => {
  const ticket = await prisma.tickets.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  if (ticket.status === 'CLOSED' || ticket.status === 'CANCELLED') {
    throw new ValidationError(`Cannot assign a ticket that is already ${ticket.status}.`);
  }

  // Validate technician eligibility
  const technician = await prisma.users.findUnique({
    where: { id: technicianId },
  });

  if (!technician) {
    throw new NotFoundError('Technician not found');
  }

  if (technician.role !== 'TECHNICIAN') {
    throw new ValidationError('The target user must have the TECHNICIAN role to receive ticket assignments.');
  }

  if (!technician.is_active) {
    throw new ValidationError('Cannot assign tickets to a deactivated technician account.');
  }

  return prisma.$transaction(async (tx) => {
    // 1. Deactivate existing active assignment if this ticket was previously assigned
    await tx.ticket_assignments.updateMany({
      where: {
        ticket_id: ticketId,
        is_current: true,
      },
      data: {
        is_current: false,
        unassigned_at: new Date(),
      },
    });

    // 2. Insert new assignment audit record
    const assignment = await tx.ticket_assignments.create({
      data: {
        ticket_id: ticketId,
        technician_id: technicianId,
        assigned_by: adminId,
        is_current: true,
        notes: assignmentNotes?.trim() || null,
      },
      include: {
        technician: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true,
          },
        },
      },
    });

    // 3. Update ticket status to ASSIGNED if currently OPEN
    const previousStatus = ticket.status;
    const targetStatus = ticket.status === 'OPEN' ? 'ASSIGNED' : ticket.status;

    const updatedTicket = await tx.tickets.update({
      where: { id: ticketId },
      data: {
        status: targetStatus,
      },
      include: {
        category: true,
        department: true,
        employee: {
          select: { id: true, first_name: true, last_name: true, email: true },
        },
      },
    });

    // 4. Append status history audit entry
    await tx.ticket_status_history.create({
      data: {
        ticket_id: ticketId,
        changed_by: adminId,
        previous_status: previousStatus,
        new_status: targetStatus,
        reason: `Assigned to technician ${technician.first_name} ${technician.last_name}${assignmentNotes ? ' - Remarks: ' + assignmentNotes.trim() : ''}`,
      },
    });

    return {
      ticket: updatedTicket,
      assignment,
    };
  });
};

/**
 * Formally close a resolved ticket (Administrator capability)
 */
export const closeTicket = async (
  ticketId: string,
  adminId: string,
  notes?: string
) => {
  const ticket = await prisma.tickets.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) {
    throw new NotFoundError('Ticket not found');
  }

  // Enforce BR-08: A ticket can only be closed once it has been resolved
  if (ticket.status !== 'RESOLVED') {
    throw new ValidationError(
      `A ticket can only be closed after it has been RESOLVED by a technician. Current status is ${ticket.status}.`
    );
  }

  return prisma.$transaction(async (tx) => {
    const now = new Date();

    const updatedTicket = await tx.tickets.update({
      where: { id: ticketId },
      data: {
        status: 'CLOSED',
        closed_by: adminId,
        closed_at: now,
      },
      include: {
        category: true,
        department: true,
        employee: {
          select: { id: true, first_name: true, last_name: true, email: true },
        },
      },
    });

    await tx.ticket_status_history.create({
      data: {
        ticket_id: ticketId,
        changed_by: adminId,
        previous_status: 'RESOLVED',
        new_status: 'CLOSED',
        reason: notes?.trim() || 'Ticket verified and closed by administrator.',
      },
    });

    return updatedTicket;
  });
};

/**
 * Mark ticket as RESOLVED with mandatory resolution notes (Technician or Administrator)
 */
export const resolveTicket = async (
  ticketId: string,
  userId: string,
  userRole: user_role,
  resolutionNotes: string
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

  // Enforce FR-TECH-06 / Rule 5: Technician must be the currently assigned technician
  if (userRole === 'TECHNICIAN') {
    const isAssigned = ticket.ticket_assignments.some(
      (a) => a.technician_id === userId && a.is_current
    );
    if (!isAssigned) {
      throw new ForbiddenError('Access denied: You can only resolve tickets actively assigned to you.');
    }
  }

  if (['CLOSED', 'CANCELLED'].includes(ticket.status)) {
    throw new ValidationError(`Cannot resolve a ticket that is already ${ticket.status}.`);
  }

  if (ticket.status === 'OPEN') {
    throw new ValidationError('Cannot resolve an open ticket. It must be assigned and investigated first.');
  }

  const trimmedNotes = resolutionNotes.trim();
  if (trimmedNotes.length < 20) {
    throw new ValidationError('Resolution notes must be at least 20 characters in length.');
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const updated = await tx.tickets.update({
      where: { id: ticketId },
      data: {
        status: 'RESOLVED',
        resolution: trimmedNotes,
        resolved_by: userId,
        resolved_at: now,
        updated_at: now,
      },
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

    // Record transition in status history
    await tx.ticket_status_history.create({
      data: {
        ticket_id: ticketId,
        changed_by: userId,
        previous_status: ticket.status,
        new_status: 'RESOLVED',
        reason: trimmedNotes,
      },
    });

    // Append public comment for submitter feedback
    await tx.ticket_comments.create({
      data: {
        ticket_id: ticketId,
        author_id: userId,
        content: `Issue Resolved: ${trimmedNotes}`,
        is_internal: false,
      },
    });

    return updated;
  });
};

/**
 * Transition ticket from ASSIGNED to IN_PROGRESS (Technician starts work)
 */
export const startWork = async (
  ticketId: string,
  userId: string,
  userRole: user_role,
  notes?: string
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

  // Enforce FR-TECH-06: Only the assigned technician (or Administrator) can start work
  if (userRole === 'TECHNICIAN') {
    const isAssigned = ticket.ticket_assignments.some(
      (a) => a.technician_id === userId && a.is_current
    );
    if (!isAssigned) {
      throw new ForbiddenError('Access denied: You can only start work on tickets actively assigned to you.');
    }
  }

  // Idempotent: If already in progress, return ticket
  if (ticket.status === 'IN_PROGRESS') {
    return ticket;
  }

  // Precondition: Must be in ASSIGNED status
  if (ticket.status !== 'ASSIGNED') {
    throw new ValidationError(
      `Cannot start work on a ticket with status ${ticket.status}. Ticket must be in ASSIGNED status.`
    );
  }

  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const updated = await tx.tickets.update({
      where: { id: ticketId },
      data: {
        status: 'IN_PROGRESS',
        updated_at: now,
      },
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

    // Record FSM transition into audit history (BR-07, FR-HIS-01, FR-HIS-02)
    await tx.ticket_status_history.create({
      data: {
        ticket_id: ticketId,
        changed_by: userId,
        previous_status: 'ASSIGNED',
        new_status: 'IN_PROGRESS',
        reason: notes?.trim() || 'Technician commenced diagnostic and troubleshooting work.',
      },
    });

    // If optional notes were provided, also record as an internal note
    if (notes && notes.trim().length > 0) {
      await tx.ticket_comments.create({
        data: {
          ticket_id: ticketId,
          author_id: userId,
          content: `Troubleshooting started: ${notes.trim()}`,
          is_internal: true,
        },
      });
    }

    return updated;
  });
};

/**
 * Transition ticket lifecycle status (Technician or Administrator)
 */
export const updateTicketStatus = async (
  ticketId: string,
  userId: string,
  userRole: user_role,
  input: UpdateTicketStatusInput
) => {
  if (input.status === 'IN_PROGRESS') {
    return startWork(ticketId, userId, userRole, input.notes);
  }

  if (input.status === 'RESOLVED') {
    if (!input.resolutionNotes || input.resolutionNotes.trim().length < 20) {
      throw new ValidationError(
        'Resolution notes (minimum 20 characters) are required when transitioning to RESOLVED status.'
      );
    }
    return resolveTicket(ticketId, userId, userRole, input.resolutionNotes);
  }

  throw new ValidationError(`Unsupported status transition to ${input.status}.`);
};

/**
 * Retrieve list of tickets assigned to a technician with filtering & pagination
 */
export const getAssignedTickets = async (
  technicianId: string,
  filters: AssignedTicketQueryFilters
) => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.ticketsWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
    if (filters.status === 'RESOLVED' || filters.status === 'CLOSED') {
      where.ticket_assignments = {
        some: { technician_id: technicianId },
      };
    } else {
      where.ticket_assignments = {
        some: { technician_id: technicianId, is_current: true },
      };
    }
  } else {
    where.ticket_assignments = {
      some: { technician_id: technicianId },
    };
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.categoryId) {
    where.category_id = filters.categoryId;
  }

  if (filters.search) {
    where.OR = [
      { ticket_number: { contains: filters.search, mode: 'insensitive' } },
      { title: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { employee: { first_name: { contains: filters.search, mode: 'insensitive' } } },
      { employee: { last_name: { contains: filters.search, mode: 'insensitive' } } },
    ];
  }

  const [total, rawTickets] = await Promise.all([
    prisma.tickets.count({ where }),
    prisma.tickets.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updated_at: 'desc' },
      include: {
        category: {
          select: { id: true, name: true },
        },
        department: {
          select: { id: true, name: true },
        },
        employee: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            employee_id: true,
          },
        },
        ticket_assignments: {
          where: { is_current: true },
          select: {
            assigned_at: true,
            notes: true,
          },
        },
      },
    }),
  ]);

  const tickets = rawTickets.map((t) => ({
    id: t.id,
    ticketNumber: t.ticket_number,
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
    categoryId: t.category_id,
    categoryName: t.category.name,
    departmentId: t.department_id,
    departmentName: t.department.name,
    employee: {
      id: t.employee.id,
      name: `${t.employee.first_name} ${t.employee.last_name}`,
      email: t.employee.email,
      employeeId: t.employee.employee_id,
    },
    assignedAt: t.ticket_assignments[0]?.assigned_at || null,
    assignmentNotes: t.ticket_assignments[0]?.notes || null,
    createdAt: t.created_at,
    updatedAt: t.updated_at,
    resolvedAt: t.resolved_at,
  }));

  return {
    tickets,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

/**
 * Retrieve technician dashboard metrics and recent assigned queue
 */
export const getTechnicianDashboardSummary = async (
  technicianId: string
): Promise<TechnicianDashboardSummary> => {
  const [
    totalAssignedTickets,
    assignedWaitingTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    criticalActiveTickets,
    recentRaw,
  ] = await Promise.all([
    prisma.tickets.count({
      where: {
        ticket_assignments: {
          some: { technician_id: technicianId },
        },
      },
    }),
    prisma.tickets.count({
      where: {
        status: 'ASSIGNED',
        ticket_assignments: {
          some: { technician_id: technicianId, is_current: true },
        },
      },
    }),
    prisma.tickets.count({
      where: {
        status: 'IN_PROGRESS',
        ticket_assignments: {
          some: { technician_id: technicianId, is_current: true },
        },
      },
    }),
    prisma.tickets.count({
      where: {
        status: 'RESOLVED',
        OR: [
          { resolved_by: technicianId },
          { ticket_assignments: { some: { technician_id: technicianId, is_current: true } } },
        ],
      },
    }),
    prisma.tickets.count({
      where: {
        status: 'CLOSED',
        OR: [
          { resolved_by: technicianId },
          { ticket_assignments: { some: { technician_id: technicianId } } },
        ],
      },
    }),
    prisma.tickets.count({
      where: {
        status: { in: ['ASSIGNED', 'IN_PROGRESS'] },
        priority: { in: ['CRITICAL', 'HIGH'] },
        ticket_assignments: {
          some: { technician_id: technicianId, is_current: true },
        },
      },
    }),
    prisma.tickets.findMany({
      where: {
        ticket_assignments: {
          some: { technician_id: technicianId, is_current: true },
        },
      },
      orderBy: { updated_at: 'desc' },
      take: 5,
      include: {
        category: { select: { name: true } },
        department: { select: { name: true } },
        employee: { select: { first_name: true, last_name: true } },
      },
    }),
  ]);

  const activeTickets = assignedWaitingTickets + inProgressTickets;

  const recentAssignedTickets = recentRaw.map((t) => ({
    id: t.id,
    ticketNumber: t.ticket_number,
    title: t.title,
    status: t.status,
    priority: t.priority,
    categoryName: t.category.name,
    departmentName: t.department.name,
    employeeName: `${t.employee.first_name} ${t.employee.last_name}`,
    createdAt: t.created_at,
  }));

  return {
    totalAssignedTickets,
    activeTickets,
    assignedWaitingTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
    criticalActiveTickets,
    recentAssignedTickets,
  };
};

