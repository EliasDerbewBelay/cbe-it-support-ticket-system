export type NotificationType =
  | 'INFO'
  | 'TICKET_CREATED'
  | 'TICKET_ASSIGNED'
  | 'STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'TICKET_RESOLVED'
  | 'TICKET_CLOSED'
  | 'TICKET_CANCELLED';

export interface NotificationTicket {
  id: string;
  ticket_number: string;
  title: string;
  status: string;
  priority: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  ticket_id?: string | null;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
  ticket?: NotificationTicket | null;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
