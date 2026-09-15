import { Prisma, notification_type } from '@prisma/client';
import { prisma } from '../config/database';

export class NotFoundError extends Error {
  statusCode: number;
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

export interface CreateNotificationParams {
  userId: string;
  ticketId?: string | null;
  title: string;
  message: string;
  type?: notification_type;
}

export interface NotificationQueryOptions {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

/**
 * Persist a notification for a single user
 */
export const createNotification = async (params: CreateNotificationParams) => {
  try {
    return await prisma.notifications.create({
      data: {
        user_id: params.userId,
        ticket_id: params.ticketId || null,
        title: params.title.trim(),
        message: params.message.trim(),
        type: params.type || 'INFO',
      },
      include: {
        ticket: {
          select: {
            id: true,
            ticket_number: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    });
  } catch (error) {
    console.error('[NotificationService] Failed to create notification:', error);
    return null;
  }
};

/**
 * Persist notifications for multiple users simultaneously
 */
export const notifyUsers = async (
  userIds: string[],
  params: Omit<CreateNotificationParams, 'userId'>
) => {
  if (!userIds || userIds.length === 0) return [];

  // Deduplicate user IDs
  const uniqueUserIds = Array.from(new Set(userIds));

  try {
    const records = uniqueUserIds.map((userId) => ({
      user_id: userId,
      ticket_id: params.ticketId || null,
      title: params.title.trim(),
      message: params.message.trim(),
      type: params.type || 'INFO',
    }));

    await prisma.notifications.createMany({
      data: records,
    });
  } catch (error) {
    console.error('[NotificationService] Failed to batch create notifications:', error);
  }
};

/**
 * Fetch paginated notifications for an authenticated user
 */
export const getUserNotifications = async (
  userId: string,
  options: NotificationQueryOptions = {}
) => {
  const page = Math.max(1, options.page || 1);
  const limit = Math.min(100, Math.max(1, options.limit || 20));
  const skip = (page - 1) * limit;

  const where: Prisma.notificationsWhereInput = {
    user_id: userId,
    ...(options.unreadOnly ? { is_read: false } : {}),
  };

  const [items, total, unreadCount] = await Promise.all([
    prisma.notifications.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
      include: {
        ticket: {
          select: {
            id: true,
            ticket_number: true,
            title: true,
            status: true,
            priority: true,
          },
        },
      },
    }),
    prisma.notifications.count({ where }),
    prisma.notifications.count({
      where: { user_id: userId, is_read: false },
    }),
  ]);

  return {
    notifications: items,
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Retrieve unread count quickly for header badge indicator
 */
export const getUnreadNotificationCount = async (userId: string) => {
  const count = await prisma.notifications.count({
    where: { user_id: userId, is_read: false },
  });
  return { unreadCount: count };
};

/**
 * Mark a specific notification as read
 */
export const markNotificationAsRead = async (
  notificationId: string,
  userId: string
) => {
  const existing = await prisma.notifications.findFirst({
    where: { id: notificationId, user_id: userId },
  });

  if (!existing) {
    throw new NotFoundError('Notification not found or access denied.');
  }

  return prisma.notifications.update({
    where: { id: notificationId },
    data: {
      is_read: true,
      read_at: new Date(),
    },
  });
};

/**
 * Mark all unread notifications for a user as read
 */
export const markAllNotificationsAsRead = async (userId: string) => {
  return prisma.notifications.updateMany({
    where: {
      user_id: userId,
      is_read: false,
    },
    data: {
      is_read: true,
      read_at: new Date(),
    },
  });
};

/**
 * Delete/dismiss a notification record
 */
export const deleteNotification = async (
  notificationId: string,
  userId: string
) => {
  const existing = await prisma.notifications.findFirst({
    where: { id: notificationId, user_id: userId },
  });

  if (!existing) {
    throw new NotFoundError('Notification not found or access denied.');
  }

  return prisma.notifications.delete({
    where: { id: notificationId },
  });
};

/* ============================================================================
 * HIGH-LEVEL DOMAIN EVENT HELPERS
 * ========================================================================= */

/**
 * Trigger notifications when a new ticket is submitted
 */
export const notifyTicketCreated = async (ticket: {
  id: string;
  ticket_number: string;
  title: string;
  employee_id: string;
}) => {
  try {
    // 1. Notify the requester (employee)
    await createNotification({
      userId: ticket.employee_id,
      ticketId: ticket.id,
      title: 'Ticket Submitted Successfully',
      message: `Your incident ${ticket.ticket_number} ("${ticket.title}") has been registered and is pending triage.`,
      type: 'TICKET_CREATED',
    });

    // 2. Notify all active administrators
    const admins = await prisma.users.findMany({
      where: { role: 'ADMINISTRATOR', is_active: true },
      select: { id: true },
    });

    const adminIds = admins
      .map((a) => a.id)
      .filter((id) => id !== ticket.employee_id);

    if (adminIds.length > 0) {
      await notifyUsers(adminIds, {
        ticketId: ticket.id,
        title: 'New Incident Logged',
        message: `New ticket ${ticket.ticket_number} ("${ticket.title}") requires review & assignment.`,
        type: 'TICKET_CREATED',
      });
    }
  } catch (err) {
    console.error('[NotificationService] notifyTicketCreated error:', err);
  }
};

/**
 * Trigger notifications when a ticket is assigned or reassigned
 */
export const notifyTicketAssigned = async (
  ticket: {
    id: string;
    ticket_number: string;
    title: string;
    employee_id: string;
  },
  technicianId: string,
  assignedByName?: string
) => {
  try {
    // 1. Notify assigned technician
    await createNotification({
      userId: technicianId,
      ticketId: ticket.id,
      title: 'Ticket Assigned to You',
      message: `You have been assigned to support incident ${ticket.ticket_number}: "${ticket.title}".`,
      type: 'TICKET_ASSIGNED',
    });

    // 2. Notify the ticket owner (employee)
    if (ticket.employee_id !== technicianId) {
      await createNotification({
        userId: ticket.employee_id,
        ticketId: ticket.id,
        title: 'Technician Assigned',
        message: `An IS support technician has been assigned to investigate your incident ${ticket.ticket_number}.`,
        type: 'TICKET_ASSIGNED',
      });
    }
  } catch (err) {
    console.error('[NotificationService] notifyTicketAssigned error:', err);
  }
};

/**
 * Trigger notifications when ticket status transitions
 */
export const notifyTicketStatusChanged = async (
  ticket: {
    id: string;
    ticket_number: string;
    title: string;
    employee_id: string;
  },
  newStatus: string,
  actorId?: string,
  reason?: string
) => {
  try {
    // Fetch active assigned technician if any
    const activeAssignment = await prisma.ticket_assignments.findFirst({
      where: { ticket_id: ticket.id, is_current: true },
      select: { technician_id: true },
    });

    const techId = activeAssignment?.technician_id;

    let notifType: notification_type = 'STATUS_CHANGED';
    let employeeTitle = `Ticket Status Updated: ${newStatus}`;
    let employeeMsg = `Your ticket ${ticket.ticket_number} status changed to ${newStatus}.`;

    if (newStatus === 'IN_PROGRESS') {
      notifType = 'STATUS_CHANGED';
      employeeTitle = 'Work in Progress';
      employeeMsg = `Technician has begun working on your ticket ${ticket.ticket_number}.`;
    } else if (newStatus === 'RESOLVED') {
      notifType = 'TICKET_RESOLVED';
      employeeTitle = 'Incident Resolved';
      employeeMsg = `Your ticket ${ticket.ticket_number} has been resolved${reason ? ': ' + reason : '. Please verify the fix.'}`;
    } else if (newStatus === 'CLOSED') {
      notifType = 'TICKET_CLOSED';
      employeeTitle = 'Ticket Closed';
      employeeMsg = `Incident ${ticket.ticket_number} has been verified and formally closed.`;
    } else if (newStatus === 'CANCELLED') {
      notifType = 'TICKET_CANCELLED';
      employeeTitle = 'Ticket Cancelled';
      employeeMsg = `Ticket ${ticket.ticket_number} was cancelled.`;
    }

    // 1. Notify employee if not the actor
    if (ticket.employee_id !== actorId) {
      await createNotification({
        userId: ticket.employee_id,
        ticketId: ticket.id,
        title: employeeTitle,
        message: employeeMsg,
        type: notifType,
      });
    }

    // 2. Notify assigned technician if not the actor
    if (techId && techId !== actorId) {
      await createNotification({
        userId: techId,
        ticketId: ticket.id,
        title: `Ticket ${ticket.ticket_number} is now ${newStatus}`,
        message: `Ticket ${ticket.ticket_number} was updated to status ${newStatus}${reason ? ' (' + reason + ')' : ''}.`,
        type: notifType,
      });
    }

    // 3. For critical lifecycle events (Resolved, Closed, Cancelled), also notify administrators if actor wasn't admin
    if (['RESOLVED', 'CLOSED', 'CANCELLED'].includes(newStatus)) {
      const admins = await prisma.users.findMany({
        where: { role: 'ADMINISTRATOR', is_active: true },
        select: { id: true },
      });

      const notifyAdminIds = admins
        .map((a) => a.id)
        .filter((id) => id !== actorId && id !== techId && id !== ticket.employee_id);

      if (notifyAdminIds.length > 0) {
        await notifyUsers(notifyAdminIds, {
          ticketId: ticket.id,
          title: `Ticket ${ticket.ticket_number} ${newStatus}`,
          message: `Ticket ${ticket.ticket_number} was marked as ${newStatus}${reason ? ' (' + reason + ')' : ''}.`,
          type: notifType,
        });
      }
    }
  } catch (err) {
    console.error('[NotificationService] notifyTicketStatusChanged error:', err);
  }
};

/**
 * Trigger notifications when a communication comment is posted
 */
export const notifyCommentAdded = async (
  ticketId: string,
  commentAuthorId: string,
  commentContent: string,
  isInternal: boolean
) => {
  try {
    const ticket = await prisma.tickets.findUnique({
      where: { id: ticketId },
      include: {
        employee: {
          select: { id: true, first_name: true, last_name: true },
        },
        ticket_assignments: {
          where: { is_current: true },
          select: { technician_id: true },
        },
      },
    });

    if (!ticket) return;

    const author = await prisma.users.findUnique({
      where: { id: commentAuthorId },
      select: { first_name: true, last_name: true, role: true },
    });

    const authorName = author ? `${author.first_name} ${author.last_name}` : 'Staff';
    const preview =
      commentContent.length > 90
        ? commentContent.slice(0, 90) + '...'
        : commentContent;

    const activeTechId = ticket.ticket_assignments[0]?.technician_id;

    if (isInternal) {
      // Internal notes notify assigned technician & administrators only
      const admins = await prisma.users.findMany({
        where: { role: 'ADMINISTRATOR', is_active: true },
        select: { id: true },
      });

      const recipientIds = new Set<string>();
      admins.forEach((a) => {
        if (a.id !== commentAuthorId) recipientIds.add(a.id);
      });
      if (activeTechId && activeTechId !== commentAuthorId) {
        recipientIds.add(activeTechId);
      }

      await notifyUsers(Array.from(recipientIds), {
        ticketId: ticket.id,
        title: `Internal Note on ${ticket.ticket_number}`,
        message: `${authorName} added an internal note: "${preview}"`,
        type: 'COMMENT_ADDED',
      });
    } else {
      // Public comment
      if (commentAuthorId === ticket.employee_id) {
        // Employee commented -> notify assigned technician or admins
        if (activeTechId) {
          await createNotification({
            userId: activeTechId,
            ticketId: ticket.id,
            title: `New Message on ${ticket.ticket_number}`,
            message: `${authorName} (Requester) commented: "${preview}"`,
            type: 'COMMENT_ADDED',
          });
        } else {
          const admins = await prisma.users.findMany({
            where: { role: 'ADMINISTRATOR', is_active: true },
            select: { id: true },
          });
          const adminIds = admins.map((a) => a.id).filter((id) => id !== commentAuthorId);
          await notifyUsers(adminIds, {
            ticketId: ticket.id,
            title: `New Message on ${ticket.ticket_number}`,
            message: `${authorName} commented: "${preview}"`,
            type: 'COMMENT_ADDED',
          });
        }
      } else {
        // Technician or admin commented -> notify employee
        await createNotification({
          userId: ticket.employee_id,
          ticketId: ticket.id,
          title: `Update on Ticket ${ticket.ticket_number}`,
          message: `${authorName} responded: "${preview}"`,
          type: 'COMMENT_ADDED',
        });
      }
    }
  } catch (err) {
    console.error('[NotificationService] notifyCommentAdded error:', err);
  }
};
