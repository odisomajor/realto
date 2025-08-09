// Jest setup for backend testing
require('dotenv').config({ path: '../.env.test' });

// Global test utilities for backend
global.testUtils = {
  ...global.testUtils,
  
  // Create test Express app
  createTestApp: () => {
    const express = require('express');
    const app = express();
    app.use(express.json());
    return app;
  },
  
  // Mock Prisma client
  createMockPrisma: () => {
    return {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn()
      },
      property: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn()
      },
      $transaction: jest.fn(),
      $connect: jest.fn(),
      $disconnect: jest.fn()
    };
  },
  
  // Mock AWS S3
  createMockS3: () => {
    return {
      upload: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({
          Location: 'https://test-bucket.s3.amazonaws.com/test-file.jpg',
          Key: 'test-file.jpg',
          Bucket: 'test-bucket'
        })
      }),
      deleteObject: jest.fn().mockReturnValue({
        promise: jest.fn().mockResolvedValue({})
      }),
      getSignedUrl: jest.fn().mockReturnValue('https://signed-url.com')
    };
  },
  
  // Mock Twilio
  createMockTwilio: () => {
    return {
      messages: {
        create: jest.fn().mockResolvedValue({
          sid: 'test-message-sid',
          status: 'sent'
        })
      }
    };
  },
  
  // Mock Nodemailer
  createMockMailer: () => {
    return {
      sendMail: jest.fn().mockResolvedValue({
        messageId: 'test-message-id',
        response: '250 OK'
      })
    };
  }
};

// Mock external services
jest.mock('aws-sdk', () => ({
  S3: jest.fn(() => global.testUtils.createMockS3()),
  config: {
    update: jest.fn()
  }
}));

jest.mock('twilio', () => {
  return jest.fn(() => global.testUtils.createMockTwilio());
});

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => global.testUtils.createMockMailer())
}));

// Mock Redis
jest.mock('ioredis', () => {
  return jest.fn(() => global.testUtils.createMockRedis());
});

// Setup test database
beforeAll(async () => {
  // Database setup would go here
});

afterAll(async () => {
  // Database cleanup would go here
});

beforeEach(() => {
  jest.clearAllMocks();
});

// Suppress console logs in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};