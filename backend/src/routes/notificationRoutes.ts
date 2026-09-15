import { Router } from 'express';
import {
  getMyNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllRead,
  deleteNotification,
} from '../controllers/notificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// All notification endpoints require authenticated session
router.use(authenticate);

// Get paginated notifications
router.get('/', getMyNotifications);

// Get unread count for badge
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.patch('/read-all', markAllRead);

// Mark single notification as read
router.patch('/:id/read', markNotificationRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;
