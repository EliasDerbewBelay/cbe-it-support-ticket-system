import { Router } from 'express';
import {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
} from '../controllers/departmentController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// All department routes require an authenticated user
router.use(authenticate);

// 1. List departments (any authenticated user can list active departments; admins can view all)
router.get('/', getDepartments);

// 2. View specific department
router.get('/:id', getDepartmentById);

// 3. Create new department (Administrator only)
router.post('/', authorize('ADMINISTRATOR'), createDepartment);

// 4. Update department details or toggle active status (Administrator only)
router.patch('/:id', authorize('ADMINISTRATOR'), updateDepartment);

export default router;
