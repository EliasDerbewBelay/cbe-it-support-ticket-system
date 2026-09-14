import { UserRole } from './auth';
import { TicketStatus } from './ticket';

export interface DepartmentItem {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users?: number;
    tickets?: number;
  };
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    tickets?: number;
  };
}

export interface UserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  departmentId: string;
  employeeId?: string | null;
  phoneNumber?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  department?: {
    id: string;
    name: string;
  } | null;
  _count?: {
    submittedTickets?: number;
    technicianAssignments?: number;
  };
}

export interface ActiveTechnician {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  department?: {
    name: string;
  };
  activeAssignmentsCount: number;
}

export interface SystemReportSummary {
  totalTickets: number;
  openTickets: number;
  assignedTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  closedTickets: number;
  cancelledTickets: number;
  criticalPending: number;
  resolutionRatePercent: number;
}

export interface CategoryDistribution {
  categoryId: string;
  categoryName: string;
  count: number;
  percentage: number;
}

export interface DepartmentDistribution {
  departmentId: string;
  departmentName: string;
  count: number;
  percentage: number;
}

export interface TechnicianWorkload {
  technicianId: string;
  technicianName: string;
  assignedCount: number;
  inProgressCount: number;
  resolvedCount: number;
}

export interface PerformanceMetrics {
  avgResolutionHours: number;
  withinSlaPercent: number;
  breachedSlaPercent: number;
  totalResolvedCount: number;
}

export interface AuditLogItem {
  id: string;
  ticketId: string;
  ticket?: {
    ticketNumber: string;
    title: string;
  };
  changedBy: string;
  actor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
  };
  previousStatus?: TicketStatus | null;
  newStatus: TicketStatus;
  reason?: string | null;
  changedAt: string;
}
