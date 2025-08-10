import { Server } from 'http';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

interface ShutdownOptions {
  timeout?: number;
  logger?: {
    info: (message: string) => void;
    error: (message: string, error?: any) => void;
  };
}

class GracefulShutdown {
  private server: Server | null = null;
  private prisma: PrismaClient | null = null;
  private redis: Redis | null = null;
  private isShuttingDown = false;
  private timeout: number;
  private logger: ShutdownOptions['logger'];
  private cleanupTasks: Array<() => Promise<void>> = [];

  constructor(options: ShutdownOptions = {}) {
    this.timeout = options.timeout || 30000; // 30 seconds default
    this.logger = options.logger || {
      info: (message: string) => console.log(`[GracefulShutdown] ${message}`),
      error: (message: string, error?: any) => console.error(`[GracefulShutdown] ${message}`, error)
    };
  }

  // Register the HTTP server
  setServer(server: Server): void {
    this.server = server;
  }

  // Register Prisma client
  setPrisma(prisma: PrismaClient): void {
    this.prisma = prisma;
  }

  // Register Redis client
  setRedis(redis: Redis): void {
    this.redis = redis;
  }

  // Add custom cleanup task
  addCleanupTask(task: () => Promise<void>): void {
    this.cleanupTasks.push(task);
  }

  // Initialize graceful shutdown handlers
  init(): void {
    // Handle different shutdown signals
    process.on('SIGTERM', () => this.shutdown('SIGTERM'));
    process.on('SIGINT', () => this.shutdown('SIGINT'));
    process.on('SIGUSR2', () => this.shutdown('SIGUSR2')); // Nodemon restart
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      this.logger?.error('Uncaught Exception:', error);
      this.shutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      this.logger?.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
      this.shutdown('unhandledRejection');
    });

    this.logger?.info('Graceful shutdown handlers initialized');
  }

  // Main shutdown function
  private async shutdown(signal: string): Promise<void> {
    if (this.isShuttingDown) {
      this.logger?.info('Shutdown already in progress...');
      return;
    }

    this.isShuttingDown = true;
    this.logger?.info(`Received ${signal}. Starting graceful shutdown...`);

    // Set a timeout to force exit if graceful shutdown takes too long
    const forceExitTimeout = setTimeout(() => {
      this.logger?.error(`Graceful shutdown timed out after ${this.timeout}ms. Forcing exit.`);
      process.exit(1);
    }, this.timeout);

    try {
      // Step 1: Stop accepting new connections
      if (this.server) {
        this.logger?.info('Closing HTTP server...');
        await this.closeServer();
      }

      // Step 2: Execute custom cleanup tasks
      if (this.cleanupTasks.length > 0) {
        this.logger?.info(`Executing ${this.cleanupTasks.length} cleanup tasks...`);
        await Promise.all(this.cleanupTasks.map(task => this.executeCleanupTask(task)));
      }

      // Step 3: Close database connections
      if (this.prisma) {
        this.logger?.info('Disconnecting from database...');
        await this.prisma.$disconnect();
      }

      // Step 4: Close Redis connection
      if (this.redis) {
        this.logger?.info('Disconnecting from Redis...');
        await this.redis.quit();
      }

      // Clear the force exit timeout
      clearTimeout(forceExitTimeout);

      this.logger?.info('Graceful shutdown completed successfully');
      process.exit(0);
    } catch (error) {
      this.logger?.error('Error during graceful shutdown:', error);
      clearTimeout(forceExitTimeout);
      process.exit(1);
    }
  }

  // Close HTTP server gracefully
  private closeServer(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) {
        resolve();
        return;
      }

      // Stop accepting new connections
      this.server.close((error) => {
        if (error) {
          reject(error);
        } else {
          this.logger?.info('HTTP server closed');
          resolve();
        }
      });

      // Close existing connections after a grace period
      setTimeout(() => {
        if (this.server) {
          // Force close remaining connections
          this.server.closeAllConnections?.();
        }
      }, 5000); // 5 second grace period
    });
  }

  // Execute a cleanup task with error handling
  private async executeCleanupTask(task: () => Promise<void>): Promise<void> {
    try {
      await task();
    } catch (error) {
      this.logger?.error('Error executing cleanup task:', error);
      // Don't throw - we want to continue with other cleanup tasks
    }
  }

  // Check if shutdown is in progress
  isShutdownInProgress(): boolean {
    return this.isShuttingDown;
  }

  // Middleware to reject requests during shutdown
  shutdownMiddleware() {
    return (req: any, res: any, next: any) => {
      if (this.isShuttingDown) {
        res.status(503).json({
          error: 'Server is shutting down',
          message: 'Please try again later'
        });
        return;
      }
      next();
    };
  }
}

// Export singleton instance
export const gracefulShutdown = new GracefulShutdown();

// Export class for custom instances
export { GracefulShutdown };

// Utility function to create and initialize graceful shutdown
export function createGracefulShutdown(options?: ShutdownOptions): GracefulShutdown {
  const shutdown = new GracefulShutdown(options);
  shutdown.init();
  return shutdown;
}