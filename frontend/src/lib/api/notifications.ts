import { api } from './client';
import { NotificationItem, NotificationsResponse } from '@/types/notification';

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export const notificationApi = {
  /**
   * Fetch paginated notifications for current user
   */
  getNotifications: async (params: NotificationQueryParams = {}): Promise<NotificationsResponse> => {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.unreadOnly) query.append('unreadOnly', 'true');

    const qs = query.toString();
    const endpoint = `/notifications${qs ? `?${qs}` : ''}`;
    const response = await api.get<{
      success: boolean;
      data: NotificationItem[];
      meta: {
        total: number;
        unreadCount: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>(endpoint);

    return {
      notifications: response.data || [],
      total: response.meta?.total || 0,
      unreadCount: response.meta?.unreadCount || 0,
      page: response.meta?.page || 1,
      limit: response.meta?.limit || 20,
      totalPages: response.meta?.totalPages || 1,
    };
  },

  /**
   * Fetch unread notification count
   */
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{
      success: boolean;
      data: { unreadCount: number };
    }>('/notifications/unread-count');
    return response.data?.unreadCount || 0;
  },

  /**
   * Mark single notification as read
   */
  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all unread notifications as read
   */
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId: string): Promise<void> => {
    await api.delete(`/notifications/${notificationId}`);
  },
};
