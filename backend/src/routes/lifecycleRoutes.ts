import { Router } from 'express';
import { getGlobalAuditLog } from '../controllers/lifecycleController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Global audit log endpoints require authentication and ADMINISTRATOR role
router.use(authenticate);
router.use(authorize('ADMINISTRATOR'));

// GET /api/audit-logs - Query system-wide status history events with filtering
router.get('/', getGlobalAuditLog);

export default router;
