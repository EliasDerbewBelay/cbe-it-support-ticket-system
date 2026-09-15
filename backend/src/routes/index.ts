import { Router } from 'express';
import healthRoutes from './healthRoutes';
import authRoutes from './authRoutes';
import ticketRoutes from './ticketRoutes';
import categoryRoutes from './categoryRoutes';
import userRoutes from './userRoutes';
import departmentRoutes from './departmentRoutes';
import reportRoutes from './reportRoutes';
import lifecycleRoutes from './lifecycleRoutes';
import notificationRoutes from './notificationRoutes';

const apiRouter = Router();

// Mount health routes under /api/health
apiRouter.use('/health', healthRoutes);

// Mount authentication and authorization routes under /api/auth
apiRouter.use('/auth', authRoutes);

// Mount ticket management routes under /api/tickets
apiRouter.use('/tickets', ticketRoutes);

// Mount category catalog routes under /api/categories
apiRouter.use('/categories', categoryRoutes);

// Mount user management routes under /api/users
apiRouter.use('/users', userRoutes);

// Mount department routes under /api/departments
apiRouter.use('/departments', departmentRoutes);

// Mount management reports and analytics under /api/reports
apiRouter.use('/reports', reportRoutes);

// Mount audit logs and compliance history under /api/audit-logs
apiRouter.use('/audit-logs', lifecycleRoutes);

// Mount notification routes under /api/notifications
apiRouter.use('/notifications', notificationRoutes);

export default apiRouter;
