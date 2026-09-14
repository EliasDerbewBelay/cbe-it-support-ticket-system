import { Request, Response } from 'express';
import { prisma } from '../config/database';

/**
 * Basic API health check
 * Endpoint: GET /api/health
 */
export const getApiHealth = (req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: 'CBE IT Support API is running',
    timestamp: new Date().toISOString(),
  });
};

/**
 * Database connectivity health check via Prisma
 * Endpoint: GET /api/health/database
 */
export const getDatabaseHealth = async (req: Request, res: Response): Promise<void> => {
  try {
    // Lightweight database connectivity verification (SELECT 1)
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      success: true,
      message: 'Database connection is healthy',
    });
  } catch (error) {
    // Log details internally on the server without exposing secrets to client
    console.error('[Database Health Check Failed]:', (error as Error).message);

    res.status(503).json({
      success: false,
      message: 'Database connection failed',
    });
  }
};
