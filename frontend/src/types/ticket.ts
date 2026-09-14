import { DepartmentInfo, UserRole } from './auth';

export type TicketStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'CLOSED'
  | 'CANCELLED';

export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface CategoryInfo {
  id: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
}

export interface TicketAssignment {
  id: string;
  ticketId?: string;
  technicianId: string;
  assignedBy: string;
  assignedAt: string;
  unassignedAt?: string | null;
  isCurrent: boolean;
  notes?: string | null;
  technician?: {
    id: string;
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone_number?: string | null;
    phoneNumber?: string | null;
  };
  assignedByUser?: {
    id: string;
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export interface TicketComment {
  id: string;
  ticketId?: string;
  authorId: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt?: string;
  author?: {
    id: string;
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: UserRole;
  };
}

export interface TicketStatusHistory {
  id: string;
  ticketId?: string;
  changedBy: string;
  previousStatus?: TicketStatus | null;
  newStatus: TicketStatus;
  changedAt: string;
  reason?: string | null;
  actor?: {
    id: string;
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    role: UserRole;
  };
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  categoryId: string;
  priority: TicketPriority;
  status: TicketStatus;
  employeeId: string;
  departmentId: string;
  resolution?: string | null;
  resolvedBy?: string | null;
  closedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  closedAt?: string | null;

  category?: CategoryInfo;
  department?: DepartmentInfo;
  employee?: {
    id: string;
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
    employee_id?: string | null;
    employeeId?: string | null;
    phone_number?: string | null;
    phoneNumber?: string | null;
    department?: DepartmentInfo;
  };
  resolvedByUser?: {
    id: string;
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
  } | null;
  closedByUser?: {
    id: string;
    first_name?: string;
    last_name?: string;
    firstName?: string;
    lastName?: string;
    email: string;
  } | null;
  ticketAssignments?: TicketAssignment[];
  ticketComments?: TicketComment[];
  ticketStatusHistory?: TicketStatusHistory[];
}

export interface TicketFilters {
  status?: TicketStatus | 'ALL';
  priority?: TicketPriority | 'ALL';
  categoryId?: string;
  departmentId?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  categoryId: string;
  priority: TicketPriority;
}

export interface EmployeeDashboardSummary {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  recentTickets: Ticket[];
}

export interface TechnicianDashboardSummary {
  assignedTotal: number;
  inProgress: number;
  resolvedToday: number;
  criticalPending: number;
  recentAssigned: Ticket[];
}
