import { ticket_priority, ticket_status } from '@prisma/client';

export interface CreateTicketInput {
  title: string;
  description: string;
  categoryId: string;
  priority?: ticket_priority;
}

export interface CancelTicketInput {
  reason: string;
}

export interface AssignTicketInput {
  technicianId: string;
  assignmentNotes?: string;
}

export interface CloseTicketInput {
  notes?: string;
}

export interface CreateCommentInput {
  content: string;
  isInternal?: boolean;
}

export interface TicketQueryFilters {
  page?: number;
  limit?: number;
  status?: ticket_status;
  priority?: ticket_priority;
  categoryId?: string;
  departmentId?: string;
  technicianId?: string;
  search?: string;
}

export interface TicketPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EmployeeDashboardSummary {
  totalTickets: number;
  openTickets: number;
  assignedTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  cancelledTickets: number;
  recentTickets: Array<{
    id: string;
    ticketNumber: string;
    title: string;
    status: ticket_status;
    priority: ticket_priority;
    categoryName: string;
    createdAt: Date;
  }>;
}

export interface StartWorkInput {
  notes?: string;
}

export interface UpdateTicketStatusInput {
  status: 'IN_PROGRESS' | 'RESOLVED';
  notes?: string;
  resolutionNotes?: string;
}

export interface AssignedTicketQueryFilters {
  page?: number;
  limit?: number;
  status?: ticket_status;
  priority?: ticket_priority;
  categoryId?: string;
  search?: string;
}

export interface TechnicianDashboardSummary {
  totalAssignedTickets: number;
  activeTickets: number;
  assignedWaitingTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  criticalActiveTickets: number;
  recentAssignedTickets: Array<{
    id: string;
    ticketNumber: string;
    title: string;
    status: ticket_status;
    priority: ticket_priority;
    categoryName: string;
    departmentName: string;
    employeeName: string;
    createdAt: Date;
  }>;
}
