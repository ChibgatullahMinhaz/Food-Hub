import { Server } from 'http';
import app from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

let server: Server;

async function bootstrap() {
  try {
    server = app.listen(env.PORT, async () => {
      console.log(`🚀 Server listening on port ${env.PORT}`);
      console.log('Checking database connection...');

      try {
        await prisma.$queryRaw`SELECT 1`;
        console.log('Database connection successful.');
      } catch (error) {
        console.error(
          'Database connection failed:',
          error instanceof Error ? error.message : error,
        );
        console.warn('Server is still running, but database-backed requests may fail.');
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Uncaught Exceptions (Synchronous Error Catching)
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception detected:', error);
  process.exit(1);
});

// Unhandled Rejections (Asynchronous Error Catching)
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection detected, shutting down server...');
  if (server) {
    server.close(() => {
      console.error(error);
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

bootstrap();