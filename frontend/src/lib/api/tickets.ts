import { api } from './client';
import { ApiResponse } from '@/types/auth';
import {
  CreateTicketPayload,
  EmployeeDashboardSummary,
  TechnicianDashboardSummary,
  Ticket,
  TicketComment,
  TicketFilters,
  TicketStatus,
} from '@/types/ticket';

function buildQueryString(params: Record<string, any>): string {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
      query.append(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : '';
}

export const ticketApi = {
  // Global listing (Admin)
  getAllTickets: async (
    filters: TicketFilters = {}
  ): Promise<{ tickets: Ticket[]; meta?: ApiResponse['meta'] }> => {
    const qs = buildQueryString(filters);
    const res = await api.get<ApiResponse<Ticket[]>>(`/tickets${qs}`);
    return { tickets: res.data || [], meta: res.meta };
  },

  // Employee's own submitted tickets
  getMyTickets: async (
    filters: TicketFilters = {}
  ): Promise<{ tickets: Ticket[]; meta?: ApiResponse['meta'] }> => {
    const qs = buildQueryString(filters);
    const res = await api.get<ApiResponse<Ticket[]>>(`/tickets/my${qs}`);
    return { tickets: res.data || [], meta: res.meta };
  },

  // Technician queue
  getAssignedTickets: async (
    filters: TicketFilters = {}
  ): Promise<{ tickets: Ticket[]; meta?: ApiResponse['meta'] }> => {
    const qs = buildQueryString(filters);
    const res = await api.get<ApiResponse<Ticket[]>>(`/tickets/assigned${qs}`);
    return { tickets: res.data || [], meta: res.meta };
  },

  // Single ticket details
  getTicketById: async (id: string): Promise<Ticket> => {
    const res = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    if (!res.data) throw new Error('Ticket not found');
    return res.data;
  },

  // Create ticket
  createTicket: async (payload: CreateTicketPayload): Promise<Ticket> => {
    const res = await api.post<ApiResponse<Ticket>>('/tickets', payload);
    if (!res.data) throw new Error(res.message || 'Failed to submit ticket');
    return res.data;
  },

  // Cancel ticket
  cancelTicket: async (id: string, reason: string): Promise<Ticket> => {
    const res = await api.post<ApiResponse<Ticket>>(`/tickets/${id}/cancel`, { reason });
    if (!res.data) throw new Error(res.message || 'Failed to cancel ticket');
    return res.data;
  },

  // Assign technician (Admin)
  assignTicket: async (
    id: string,
    technicianId: string,
    assignmentNotes?: string
  ): Promise<any> => {
    const res = await api.post<ApiResponse<any>>(`/tickets/${id}/assign`, {
      technicianId,
      assignmentNotes,
    });
    return res.data;
  },

  // Start work (Technician)
  startWork: async (id: string, notes?: string): Promise<Ticket> => {
    const res = await api.post<ApiResponse<Ticket>>(`/tickets/${id}/start-work`, { notes });
    if (!res.data) throw new Error(res.message || 'Failed to start work');
    return res.data;
  },

  // Resolve ticket (Technician / Admin)
  resolveTicket: async (id: string, resolutionNotes: string): Promise<Ticket> => {
    const res = await api.post<ApiResponse<Ticket>>(`/tickets/${id}/resolve`, {
      resolutionNotes,
    });
    if (!res.data) throw new Error(res.message || 'Failed to resolve ticket');
    return res.data;
  },

  // Close ticket (Admin)
  closeTicket: async (id: string, notes?: string): Promise<Ticket> => {
    const res = await api.post<ApiResponse<Ticket>>(`/tickets/${id}/close`, { notes });
    if (!res.data) throw new Error(res.message || 'Failed to close ticket');
    return res.data;
  },

  // Update status directly
  updateTicketStatus: async (
    id: string,
    status: TicketStatus,
    notes?: string
  ): Promise<Ticket> => {
    const res = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/status`, {
      status,
      notes,
    });
    if (!res.data) throw new Error(res.message || 'Failed to update status');
    return res.data;
  },

  // Comments
  getComments: async (id: string): Promise<TicketComment[]> => {
    const res = await api.get<ApiResponse<TicketComment[]>>(`/tickets/${id}/comments`);
    return res.data || [];
  },

  addComment: async (
    id: string,
    content: string,
    isInternal: boolean = false
  ): Promise<TicketComment> => {
    const res = await api.post<ApiResponse<TicketComment>>(`/tickets/${id}/comments`, {
      content,
      isInternal,
    });
    if (!res.data) throw new Error(res.message || 'Failed to post comment');
    return res.data;
  },

  // Summaries
  getEmployeeSummary: async (): Promise<EmployeeDashboardSummary> => {
    const res = await api.get<ApiResponse<EmployeeDashboardSummary>>('/tickets/my/summary');
    return (
      res.data || {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0,
        recentTickets: [],
      }
    );
  },

  getTechnicianSummary: async (): Promise<TechnicianDashboardSummary> => {
    const res = await api.get<ApiResponse<TechnicianDashboardSummary>>(
      '/tickets/technician/summary'
    );
    return (
      res.data || {
        assignedTotal: 0,
        inProgress: 0,
        resolvedToday: 0,
        criticalPending: 0,
        recentAssigned: [],
      }
    );
  },
};
