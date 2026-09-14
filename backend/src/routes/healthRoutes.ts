import { Router } from 'express';
import { getApiHealth, getDatabaseHealth } from '../controllers/healthController';

const router = Router();

// GET /api/health
router.get('/', getApiHealth);

// GET /api/health/database
router.get('/database', getDatabaseHealth);

export default router;
