import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notificationService';
import { NotFoundError } from '../services/notificationService';

/**
 * Get paginated notifications for current authenticated user
 * GET /api/notifications
 */
export const getMyNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await notificationService.getUserNotifications(userId, {
      page,
      limit,
      unreadOnly,
    });

    res.status(200).json({
      success: true,
      data: result.notifications,
      meta: {
        total: result.total,
        unreadCount: result.unreadCount,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread notification count for badge display
 * GET /api/notifications/unread-count
 */
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const result = await notificationService.getUnreadNotificationCount(userId);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read
 * PATCH /api/notifications/:id/read
 */
export const markNotificationRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id as string;

    const updated = await notificationService.markNotificationAsRead(
      notificationId,
      userId
    );

    res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: updated,
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    next(error);
  }
};

/**
 * Mark all notifications as read for current user
 * PATCH /api/notifications/read-all
 */
export const markAllRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    await notificationService.markAllNotificationsAsRead(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const notificationId = req.params.id as string;

    await notificationService.deleteNotification(notificationId, userId);

    res.status(200).json({
      success: true,
      message: 'Notification removed successfully.',
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }
    next(error);
  }
};
