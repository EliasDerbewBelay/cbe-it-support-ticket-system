import { Router } from 'express';
import {
  getSummary,
  getByCategory,
  getByDepartment,
  getByTechnician,
  getPerformance,
} from '../controllers/reportController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// All reporting endpoints require authentication and ADMINISTRATOR role
router.use(authenticate);
router.use(authorize('ADMINISTRATOR'));

// 1. Executive summary KPI cards
router.get('/summary', getSummary);

// 2. Ticket breakdown by category
router.get('/by-category', getByCategory);

// 3. Ticket volume by requesting department
router.get('/by-department', getByDepartment);

// 4. Technician workload and resolution performance
router.get('/by-technician', getByTechnician);

// 5. Performance and SLA resolution time analytics
router.get('/performance', getPerformance);

export default router;
