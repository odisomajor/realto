// Jest setup file for Xillix Real Estate Platform
// Global test configuration and utilities

// Load environment variables for testing
require('dotenv').config({ path: '.env.test' });

// Global test utilities
global.testUtils = {
  // Mock user data
  mockUser: {
    id: 1,
    email: 'test@xillix.co.ke',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+254700000000',
    role: 'user',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Mock property data
  mockProperty: {
    id: 1,
    title: 'Beautiful 3-Bedroom House in Nairobi',
    description: 'A stunning modern house with all amenities',
    price: 15000000,
    currency: 'KES',
    type: 'house',
    subType: 'residential',
    bedrooms: 3,
    bathrooms: 2,
    area: 150,
    location: {
      county: 'Nairobi',
      town: 'Westlands',
      address: '123 Test Street'
    },
    coordinates: {
      lat: -1.2921,
      lng: 36.8219
    },
    images: ['image1.jpg', 'image2.jpg'],
    features: ['parking', 'garden', 'security'],
    status: 'active',
    publisherId: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Generate JWT token for testing
  generateTestToken: (payload = {}) => {
    const jwt = require('jsonwebtoken');
    return jwt.sign(
      { id: 1, email: 'test@xillix.co.ke', ...payload },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  },
  
  // Create test database connection
  createTestDb: async () => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL
        }
      }
    });
    return prisma;
  },
  
  // Clean test database
  cleanTestDb: async (prisma) => {
    const tablenames = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname='public'
    `;
    
    for (const { tablename } of tablenames) {
      if (tablename !== '_prisma_migrations') {
        try {
          await prisma.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`);
        } catch (error) {
          console.log({ error });
        }
      }
    }
  },
  
  // Wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Mock Redis client
  createMockRedis: () => {
    const data = new Map();
    return {
      get: jest.fn((key) => Promise.resolve(data.get(key) || null)),
      set: jest.fn((key, value, options) => {
        data.set(key, value);
        return Promise.resolve('OK');
      }),
      del: jest.fn((key) => {
        const existed = data.has(key);
        data.delete(key);
        return Promise.resolve(existed ? 1 : 0);
      }),
      exists: jest.fn((key) => Promise.resolve(data.has(key) ? 1 : 0)),
      expire: jest.fn(() => Promise.resolve(1)),
      flushall: jest.fn(() => {
        data.clear();
        return Promise.resolve('OK');
      }),
      quit: jest.fn(() => Promise.resolve('OK'))
    };
  }
};

// Global mocks
global.fetch = require('jest-fetch-mock');

// Mock console methods in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.SESSION_SECRET = 'test-session-secret';
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST || 'postgresql://test:test@localhost:5432/xillix_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';

// Global test hooks
beforeAll(async () => {
  // Global setup before all tests
});

afterAll(async () => {
  // Global cleanup after all tests
});

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks();
});

afterEach(() => {
  // Cleanup after each test
});

// Extend Jest matchers
expect.extend({
  toBeValidEmail(received) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false
      };
    }
  },
  
  toBeValidPhoneNumber(received) {
    const phoneRegex = /^\+254[0-9]{9}$/;
    const pass = phoneRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid Kenyan phone number`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid Kenyan phone number`,
        pass: false
      };
    }
  },
  
  toBeValidCoordinates(received) {
    const pass = received && 
                 typeof received.lat === 'number' && 
                 typeof received.lng === 'number' &&
                 received.lat >= -90 && received.lat <= 90 &&
                 received.lng >= -180 && received.lng <= 180;
    
    if (pass) {
      return {
        message: () => `expected ${JSON.stringify(received)} not to be valid coordinates`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${JSON.stringify(received)} to be valid coordinates`,
        pass: false
      };
    }
  }
});

// Suppress specific warnings in tests
const originalError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is deprecated')
  ) {
    return;
  }
  originalError.call(console, ...args);
};