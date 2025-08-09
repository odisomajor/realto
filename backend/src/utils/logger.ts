import winston from 'winston';
import path from 'path';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define log format
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define which transports the logger must use
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), '../logs/backend/error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), '../logs/backend/combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    maxsize: 5242880, // 5MB
    maxFiles: 5
  })
];

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format,
  transports,
  exitOnError: false
});

// If we're not in production, log to the console with a simple format
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

// Create a stream object for Morgan HTTP logging
const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  }
};

// Helper functions for structured logging
const logWithContext = (level: string, message: string, context?: any) => {
  const logData = {
    message,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    service: 'xillix-backend',
    ...(context && { context })
  };
  
  logger.log(level, JSON.stringify(logData));
};

// Enhanced logging methods
const enhancedLogger = {
  error: (message: string, error?: Error | any, context?: any) => {
    const errorData = {
      message,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          ...(error.code && { code: error.code }),
          ...(error.status && { status: error.status })
        }
      }),
      ...(context && { context })
    };
    logWithContext('error', message, errorData);
  },
  
  warn: (message: string, context?: any) => {
    logWithContext('warn', message, context);
  },
  
  info: (message: string, context?: any) => {
    logWithContext('info', message, context);
  },
  
  http: (message: string, context?: any) => {
    logWithContext('http', message, context);
  },
  
  debug: (message: string, context?: any) => {
    logWithContext('debug', message, context);
  },
  
  // API request logging
  apiRequest: (req: any, res: any, responseTime?: number) => {
    const logData = {
      method: req.method,
      url: req.url,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      statusCode: res.statusCode,
      ...(responseTime && { responseTime: `${responseTime}ms` }),
      ...(req.user && { userId: req.user.id })
    };
    
    logWithContext('http', `${req.method} ${req.url} ${res.statusCode}`, logData);
  },
  
  // Database operation logging
  dbOperation: (operation: string, table: string, duration?: number, context?: any) => {
    const logData = {
      operation,
      table,
      ...(duration && { duration: `${duration}ms` }),
      ...(context && { context })
    };
    
    logWithContext('debug', `DB ${operation} on ${table}`, logData);
  },
  
  // Authentication logging
  auth: (event: string, userId?: string, context?: any) => {
    const logData = {
      event,
      ...(userId && { userId }),
      ...(context && { context })
    };
    
    logWithContext('info', `Auth: ${event}`, logData);
  },
  
  // Security event logging
  security: (event: string, severity: 'low' | 'medium' | 'high' | 'critical', context?: any) => {
    const logData = {
      event,
      severity,
      timestamp: new Date().toISOString(),
      ...(context && { context })
    };
    
    const level = severity === 'critical' || severity === 'high' ? 'error' : 'warn';
    logWithContext(level, `Security: ${event}`, logData);
  },
  
  // Performance logging
  performance: (operation: string, duration: number, context?: any) => {
    const logData = {
      operation,
      duration: `${duration}ms`,
      ...(context && { context })
    };
    
    const level = duration > 1000 ? 'warn' : 'info';
    logWithContext(level, `Performance: ${operation}`, logData);
  }
};

// Export both the original logger and enhanced logger
export { logger, enhancedLogger as log, stream };

// Default export is the enhanced logger
export default enhancedLogger;