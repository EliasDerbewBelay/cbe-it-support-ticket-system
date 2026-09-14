import { Router } from 'express';
import {
  listUsers,
  createUser,
  getUserById,
  updateUser,
  getActiveTechnicians,
} from '../controllers/userController';
import { authenticate, authorize } from '../middleware/authMiddleware';

const router = Router();

// All user administration endpoints require authentication and ADMINISTRATOR role
router.use(authenticate);
router.use(authorize('ADMINISTRATOR'));

// 1. List users with administrative filters (role, department, active status, search, pagination)
router.get('/', listUsers);

// 2. Create new user account
router.post('/', createUser);

// 3. Get active technicians with workload metrics for assignment dropdown
// Must precede /:id to prevent routing conflict
router.get('/technicians/active', getActiveTechnicians);

// 4. Get detailed profile of a single user
router.get('/:id', getUserById);

// 5. Update user metadata, department, or active status
router.patch('/:id', updateUser);

export default router;
