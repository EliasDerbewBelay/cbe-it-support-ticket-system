import dotenv from 'dotenv';

// Load environment variables before initializing dependencies
dotenv.config();

import app from './app';
import { disconnectDatabase } from './config/database';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

const server = app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`CBE IT Support Backend Service`);
  console.log(`Status: Running`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Port: ${PORT}`);
  console.log(`Base URL: http://localhost:${PORT}/api`);
  console.log(`=========================================`);
});

// Graceful shutdown handling
const gracefulShutdown = async (signal: string) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    try {
      await disconnectDatabase();
      console.log('Database connection closed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnection:', err);
      process.exit(1);
    }
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
