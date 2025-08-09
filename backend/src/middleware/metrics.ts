import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

// Create a Registry to register the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'xillix-real-estate-backend'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

export const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  registers: [register]
});

export const activeUsers = new client.Gauge({
  name: 'active_users_total',
  help: 'Number of active users',
  registers: [register]
});

export const propertyViews = new client.Counter({
  name: 'property_views_total',
  help: 'Total number of property views',
  labelNames: ['property_id'],
  registers: [register]
});

export const databaseConnections = new client.Gauge({
  name: 'database_connections_active',
  help: 'Number of active database connections',
  registers: [register]
});

export const cacheHits = new client.Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_type'],
  registers: [register]
});

export const cacheMisses = new client.Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_type'],
  registers: [register]
});

export const notificationsSent = new client.Counter({
  name: 'notifications_sent_total',
  help: 'Total number of notifications sent',
  labelNames: ['type', 'status'],
  registers: [register]
});

export const fileUploads = new client.Counter({
  name: 'file_uploads_total',
  help: 'Total number of file uploads',
  labelNames: ['file_type', 'status'],
  registers: [register]
});

export const apiErrors = new client.Counter({
  name: 'api_errors_total',
  help: 'Total number of API errors',
  labelNames: ['endpoint', 'error_type'],
  registers: [register]
});

// Middleware to collect HTTP metrics
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    const method = req.method;
    const statusCode = res.statusCode.toString();
    
    httpRequestsTotal.inc({ method, route, status_code: statusCode });
    httpRequestDuration.observe({ method, route, status_code: statusCode }, duration);
  });
  
  next();
};

// Function to get metrics
export const getMetrics = async (): Promise<string> => {
  return register.metrics();
};

// Function to get metrics in JSON format
export const getMetricsJSON = async () => {
  const metrics = await register.getMetricsAsJSON();
  return metrics;
};

// Function to clear all metrics (useful for testing)
export const clearMetrics = () => {
  register.clear();
};

export { register };