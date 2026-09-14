import { Router } from 'express';
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
} from '../controllers/categoryController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// All category routes require an authenticated user
router.use(authenticate);

// 1. List categories (Active for employees/technicians; all optionally for administrators)
router.get('/', getCategories);

// 2. View specific category
router.get('/:id', getCategoryById);

// 3. Create a new category (Administrator only)
router.post('/', authorize('ADMINISTRATOR'), createCategory);

// 4. Update category details or toggle active status (Administrator only)
router.patch('/:id', authorize('ADMINISTRATOR'), updateCategory);

export default router;
