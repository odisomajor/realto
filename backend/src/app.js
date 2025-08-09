const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Import routes
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
const inquiryRoutes = require('./routes/inquiries');
const favoriteRoutes = require('./routes/favorites');
const browsingSessionRoutes = require('./routes/browsingSession');
const userRoutes = require('./routes/users.js');
const geocodingRoutes = require('./routes/geocoding');

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/browsing-session', browsingSessionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/geocoding', geocodingRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Kenya Real Estate API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      properties: '/api/properties',
      inquiries: '/api/inquiries',
      favorites: '/api/favorites',
      browsingSession: '/api/browsing-session',
      users: '/api/users',
      geocoding: '/api/geocoding'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({ error: 'Duplicate entry' });
  }
  
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found' });
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
  
  // Default error
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API Base URL: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
});