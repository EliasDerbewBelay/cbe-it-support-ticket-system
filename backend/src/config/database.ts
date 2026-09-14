import { PrismaClient } from '@prisma/client';

const isProduction = process.env.NODE_ENV === 'production';

// Centralized Prisma Client instance
export const prisma = new PrismaClient({
  log: isProduction ? ['error', 'warn'] : ['query', 'info', 'warn', 'error'],
});

// Graceful disconnection utility for application termination
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
};
