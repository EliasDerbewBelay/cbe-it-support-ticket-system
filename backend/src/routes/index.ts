import { Router } from 'express';
import healthRoutes from './healthRoutes';

const apiRouter = Router();

// Mount health routes under /api/health
apiRouter.use('/health', healthRoutes);

export default apiRouter;
