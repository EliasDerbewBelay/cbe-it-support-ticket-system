import { Router } from 'express';
import {
  login,
  logout,
  getMe,
  verifyEmployeeAccess,
  verifyTechnicianAccess,
  verifyAdminAccess,
} from '../controllers/authController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// Public routes
router.post('/login', login);
router.post('/logout', logout);

// Authenticated session profile route
router.get('/me', authenticate, getMe);

// Role authorization demonstration / verification routes
router.get(
  '/test/employee',
  authenticate,
  authorize('EMPLOYEE', 'ADMINISTRATOR'),
  verifyEmployeeAccess
);

router.get(
  '/test/technician',
  authenticate,
  authorize('TECHNICIAN', 'ADMINISTRATOR'),
  verifyTechnicianAccess
);

router.get(
  '/test/admin',
  authenticate,
  authorize('ADMINISTRATOR'),
  verifyAdminAccess
);

export default router;
