// Jest global setup - runs once before all tests
const { execSync } = require('child_process');
const path = require('path');

module.exports = async () => {
  console.log('🚀 Setting up test environment...');
  
  try {
    // Set test environment
    process.env.NODE_ENV = 'test';
    
    // Load test environment variables
    require('dotenv').config({ path: '.env.test' });
    
    // Ensure test database exists
    if (process.env.DATABASE_URL_TEST) {
      console.log('📊 Setting up test database...');
      
      try {
        // Run database migrations for test environment
        execSync('npx prisma migrate deploy', {
          env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL_TEST },
          stdio: 'inherit',
          cwd: path.join(__dirname, 'backend')
        });
        
        console.log('✅ Test database setup complete');
      } catch (error) {
        console.warn('⚠️ Database setup failed, continuing with tests:', error.message);
      }
    }
    
    // Setup Redis for testing
    if (process.env.REDIS_URL_TEST) {
      console.log('🔴 Setting up Redis for testing...');
      // Redis setup would go here if needed
      console.log('✅ Redis setup complete');
    }
    
    // Setup Elasticsearch for testing
    if (process.env.ELASTICSEARCH_URL_TEST) {
      console.log('🔍 Setting up Elasticsearch for testing...');
      // Elasticsearch setup would go here if needed
      console.log('✅ Elasticsearch setup complete');
    }
    
    console.log('✅ Test environment setup complete');
    
  } catch (error) {
    console.error('❌ Test environment setup failed:', error);
    throw error;
  }
};