// Jest global teardown - runs once after all tests
module.exports = async () => {
  console.log('🧹 Cleaning up test environment...');
  
  try {
    // Clean up test database connections
    if (global.__PRISMA__) {
      await global.__PRISMA__.$disconnect();
      console.log('✅ Database connections closed');
    }
    
    // Clean up Redis connections
    if (global.__REDIS__) {
      await global.__REDIS__.quit();
      console.log('✅ Redis connections closed');
    }
    
    // Clean up Elasticsearch connections
    if (global.__ELASTICSEARCH__) {
      await global.__ELASTICSEARCH__.close();
      console.log('✅ Elasticsearch connections closed');
    }
    
    // Clean up any other global resources
    if (global.__TEST_SERVER__) {
      await global.__TEST_SERVER__.close();
      console.log('✅ Test server closed');
    }
    
    // Clean up temporary files
    const fs = require('fs');
    const path = require('path');
    const tmpDir = path.join(__dirname, 'tmp');
    
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
      console.log('✅ Temporary files cleaned');
    }
    
    console.log('✅ Test environment cleanup complete');
    
  } catch (error) {
    console.error('❌ Test environment cleanup failed:', error);
    // Don't throw error in teardown to avoid masking test failures
  }
};