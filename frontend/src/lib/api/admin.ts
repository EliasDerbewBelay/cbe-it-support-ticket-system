import { api } from './client';
import { ApiResponse } from '@/types/auth';
import {
  ActiveTechnician,
  AuditLogItem,
  CategoryDistribution,
  CategoryItem,
  DepartmentDistribution,
  DepartmentItem,
  PerformanceMetrics,
  SystemReportSummary,
  TechnicianWorkload,
  UserItem,
} from '@/types/admin';

export const formatUserItem = (u: any): UserItem => ({
  id: u.id,
  firstName: u.firstName || u.first_name || '',
  lastName: u.lastName || u.last_name || '',
  email: u.email || '',
  role: u.role,
  departmentId: u.departmentId || u.department_id || '',
  employeeId: u.employeeId !== undefined ? u.employeeId : (u.employee_id ?? null),
  phoneNumber: u.phoneNumber !== undefined ? u.phoneNumber : (u.phone_number ?? null),
  isActive: u.isActive !== undefined ? u.isActive : (u.is_active !== undefined ? u.is_active : true),
  createdAt: u.createdAt || u.created_at || '',
  updatedAt: u.updatedAt || u.updated_at || '',
  department: u.department
    ? {
        id: u.department.id,
        name: u.department.name,
      }
    : null,
  _count: u._count
    ? {
        submittedTickets: u._count.submittedTickets ?? u._count.submitted_tickets,
        technicianAssignments: u._count.technicianAssignments ?? u._count.technician_assignments,
      }
    : undefined,
});

export const adminApi = {
  // Users
  getUsers: async (params: {
    role?: string;
    departmentId?: string;
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ users: UserItem[]; meta?: ApiResponse['meta'] }> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'ALL') {
        query.append(k, String(v));
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get<ApiResponse<any[]>>(`/users${qs}`);
    const rawList = Array.isArray(res.data) ? res.data : [];
    return { users: rawList.map(formatUserItem), meta: res.meta };
  },

  createUser: async (payload: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role: string;
    departmentId: string;
    employeeId?: string;
    phoneNumber?: string;
  }): Promise<UserItem> => {
    const res = await api.post<ApiResponse<any>>('/users', payload);
    if (!res.data) throw new Error(res.message || 'Failed to create user');
    return formatUserItem(res.data);
  },

  updateUser: async (
    id: string,
    payload: {
      firstName?: string;
      lastName?: string;
      email?: string;
      password?: string;
      role?: string;
      departmentId?: string;
      employeeId?: string | null;
      phoneNumber?: string | null;
      isActive?: boolean;
    }
  ): Promise<UserItem> => {
    const res = await api.patch<ApiResponse<any>>(`/users/${id}`, payload);
    if (!res.data) throw new Error(res.message || 'Failed to update user');
    return formatUserItem(res.data);
  },

  resetUserPassword: async (
    id: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    const res = await api.post<ApiResponse<any>>(`/users/${id}/reset-password`, { password });
    return { success: res.success, message: res.message };
  },

  getActiveTechnicians: async (): Promise<ActiveTechnician[]> => {
    const res = await api.get<ApiResponse<ActiveTechnician[]>>('/users/technicians/active');
    return res.data || [];
  },

  // Departments
  getDepartments: async (includeInactive: boolean = false): Promise<DepartmentItem[]> => {
    const res = await api.get<ApiResponse<DepartmentItem[]>>(
      `/departments${includeInactive ? '?includeInactive=true' : ''}`
    );
    return res.data || [];
  },

  createDepartment: async (payload: {
    name: string;
    description?: string;
  }): Promise<DepartmentItem> => {
    const res = await api.post<ApiResponse<DepartmentItem>>('/departments', payload);
    if (!res.data) throw new Error(res.message || 'Failed to create department');
    return res.data;
  },

  updateDepartment: async (
    id: string,
    payload: { name?: string; description?: string; isActive?: boolean }
  ): Promise<DepartmentItem> => {
    const res = await api.patch<ApiResponse<DepartmentItem>>(`/departments/${id}`, payload);
    if (!res.data) throw new Error(res.message || 'Failed to update department');
    return res.data;
  },

  // Categories
  getCategories: async (includeInactive: boolean = false): Promise<CategoryItem[]> => {
    const res = await api.get<ApiResponse<CategoryItem[]>>(
      `/categories${includeInactive ? '?includeInactive=true' : ''}`
    );
    return res.data || [];
  },

  createCategory: async (payload: {
    name: string;
    description?: string;
  }): Promise<CategoryItem> => {
    const res = await api.post<ApiResponse<CategoryItem>>('/categories', payload);
    if (!res.data) throw new Error(res.message || 'Failed to create category');
    return res.data;
  },

  updateCategory: async (
    id: string,
    payload: { name?: string; description?: string; isActive?: boolean }
  ): Promise<CategoryItem> => {
    const res = await api.patch<ApiResponse<CategoryItem>>(`/categories/${id}`, payload);
    if (!res.data) throw new Error(res.message || 'Failed to update category');
    return res.data;
  },

  // Reports
  getReportSummary: async (): Promise<SystemReportSummary> => {
    const res = await api.get<ApiResponse<any>>('/reports/summary');
    const d = res.data;
    if (!d) {
      return {
        totalTickets: 0,
        openTickets: 0,
        assignedTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,
        closedTickets: 0,
        cancelledTickets: 0,
        criticalPending: 0,
        resolutionRatePercent: 0,
      };
    }
    return {
      totalTickets: Number(d.totalTickets ?? d.tickets?.total ?? 0),
      openTickets: Number(d.openTickets ?? d.tickets?.open ?? 0),
      assignedTickets: Number(d.assignedTickets ?? d.tickets?.assigned ?? 0),
      inProgressTickets: Number(d.inProgressTickets ?? d.tickets?.inProgress ?? 0),
      resolvedTickets: Number(d.resolvedTickets ?? d.tickets?.resolved ?? 0),
      closedTickets: Number(d.closedTickets ?? d.tickets?.closed ?? 0),
      cancelledTickets: Number(d.cancelledTickets ?? d.tickets?.cancelled ?? 0),
      criticalPending: Number(d.criticalPending ?? d.tickets?.criticalActive ?? 0),
      resolutionRatePercent: Number(
        d.resolutionRatePercent ?? d.tickets?.resolutionRatePercentage ?? 0
      ),
    };
  },

  getReportByCategory: async (): Promise<CategoryDistribution[]> => {
    const res = await api.get<ApiResponse<any[]>>('/reports/by-category');
    const list = Array.isArray(res.data) ? res.data : [];
    return list.map((item: any) => ({
      categoryId: item.categoryId || item.id || '',
      categoryName: item.categoryName || item.name || 'Uncategorized',
      count: Number(item.count ?? item.totalTickets ?? 0),
      percentage: Number(item.percentage ?? 0),
    }));
  },

  getReportByDepartment: async (): Promise<DepartmentDistribution[]> => {
    const res = await api.get<ApiResponse<any[]>>('/reports/by-department');
    const list = Array.isArray(res.data) ? res.data : [];
    return list.map((item: any) => ({
      departmentId: item.departmentId || item.id || '',
      departmentName: item.departmentName || item.name || 'Unknown Department',
      count: Number(item.count ?? item.totalTickets ?? 0),
      percentage: Number(item.percentage ?? 0),
    }));
  },

  getReportByTechnician: async (): Promise<TechnicianWorkload[]> => {
    const res = await api.get<ApiResponse<any[]>>('/reports/by-technician');
    const list = Array.isArray(res.data) ? res.data : [];
    return list.map((item: any) => ({
      technicianId: item.technicianId || item.id || '',
      technicianName:
        item.technicianName ||
        item.name ||
        `${item.first_name || ''} ${item.last_name || ''}`.trim() ||
        'Technician',
      assignedCount: Number(
        item.assignedCount ?? item.totalHistoricalAssignments ?? item.activeTicketsCount ?? 0
      ),
      inProgressCount: Number(item.inProgressCount ?? 0),
      resolvedCount: Number(item.resolvedCount ?? item.totalResolvedCount ?? 0),
    }));
  },

  getPerformanceMetrics: async (): Promise<PerformanceMetrics> => {
    const res = await api.get<ApiResponse<any>>('/reports/performance');
    const d = res.data;
    if (!d) {
      return {
        avgResolutionHours: 0,
        withinSlaPercent: 100,
        breachedSlaPercent: 0,
        totalResolvedCount: 0,
      };
    }
    return {
      avgResolutionHours: Number(d.avgResolutionHours ?? d.overallAverageResolutionHours ?? 0),
      withinSlaPercent: Number(d.withinSlaPercent ?? 100),
      breachedSlaPercent: Number(d.breachedSlaPercent ?? 0),
      totalResolvedCount: Number(d.totalResolvedCount ?? d.totalResolvedSample ?? 0),
    };
  },

  // Audit Logs
  getAuditLogs: async (params: {
    ticketId?: string;
    changedBy?: string;
    newStatus?: string;
    page?: number;
    limit?: number;
  } = {}): Promise<{ logs: AuditLogItem[]; meta?: ApiResponse['meta'] }> => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, String(v));
      }
    });
    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get<ApiResponse<AuditLogItem[]>>(`/audit-logs${qs}`);
    return { logs: res.data || [], meta: res.meta };
  },
};
