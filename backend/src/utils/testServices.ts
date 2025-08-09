import { emailService } from '../services/emailService';
import { smsService } from '../services/smsService';
import { pushNotificationService } from '../services/pushNotificationService';
import { cacheService } from '../services/cacheService';

interface TestResult {
  service: string;
  status: 'success' | 'error' | 'not_configured';
  message: string;
  details?: any;
}

/**
 * Test email service configuration
 */
async function testEmailService(): Promise<TestResult> {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      return {
        service: 'Email',
        status: 'not_configured',
        message: 'SMTP configuration not found. Please configure SMTP_HOST, SMTP_USER, and SMTP_PASS in your .env file.'
      };
    }

    // Test email sending
    await emailService.sendEmail({
      to: process.env.SMTP_USER!, // Send test email to yourself
      subject: 'Xillix Real Estate - Email Service Test',
      template: 'notification-basic',
      templateData: {
        title: 'Email Service Test',
        message: 'This is a test email to verify your email configuration is working correctly.',
        timestamp: new Date().toISOString()
      }
    });

    return {
      service: 'Email',
      status: 'success',
      message: `Test email sent successfully to ${process.env.SMTP_USER}`,
      details: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER
      }
    };
  } catch (error) {
    return {
      service: 'Email',
      status: 'error',
      message: `Email service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    };
  }
}

/**
 * Test SMS service configuration
 */
async function testSMSService(): Promise<TestResult> {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return {
        service: 'SMS',
        status: 'not_configured',
        message: 'Twilio configuration not found. Please configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in your .env file.'
      };
    }

    // Note: We don't actually send SMS in test to avoid charges
    // Instead, we validate the configuration
    const isConfigured = smsService.isReady();
    
    if (isConfigured) {
      return {
        service: 'SMS',
        status: 'success',
        message: 'SMS service configuration is valid',
        details: {
          accountSid: process.env.TWILIO_ACCOUNT_SID?.substring(0, 10) + '...',
          phoneNumber: process.env.TWILIO_PHONE_NUMBER
        }
      };
    } else {
      return {
        service: 'SMS',
        status: 'error',
        message: 'SMS service configuration is invalid'
      };
    }
  } catch (error) {
    return {
      service: 'SMS',
      status: 'error',
      message: `SMS service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    };
  }
}

/**
 * Test push notification service configuration
 */
async function testPushService(): Promise<TestResult> {
  try {
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return {
        service: 'Push Notifications',
        status: 'not_configured',
        message: 'VAPID keys not found. Please run the VAPID key generator or configure VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your .env file.'
      };
    }

    // Test VAPID configuration
    const isConfigured = pushNotificationService.isReady();
    
    if (isConfigured) {
      return {
        service: 'Push Notifications',
        status: 'success',
        message: 'Push notification service configuration is valid',
        details: {
          publicKey: process.env.VAPID_PUBLIC_KEY?.substring(0, 20) + '...',
          subject: process.env.VAPID_SUBJECT
        }
      };
    } else {
      return {
        service: 'Push Notifications',
        status: 'error',
        message: 'Push notification service configuration is invalid'
      };
    }
  } catch (error) {
    return {
      service: 'Push Notifications',
      status: 'error',
      message: `Push notification service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    };
  }
}

/**
 * Test cache service configuration
 */
async function testCacheService(): Promise<TestResult> {
  try {
    if (!process.env.REDIS_URL || process.env.CACHE_ENABLED === 'false') {
      return {
        service: 'Cache (Redis)',
        status: 'not_configured',
        message: 'Redis cache is not configured or disabled. This is optional for development.'
      };
    }

    // Test cache operations
    const testKey = 'test:service:check';
    const testValue = { timestamp: Date.now(), test: true };
    
    await cacheService.set(testKey, testValue, { ttl: 60 });
    const retrieved = await cacheService.get(testKey);
    await cacheService.del(testKey);
    
    if (retrieved && retrieved.test === true) {
      return {
        service: 'Cache (Redis)',
        status: 'success',
        message: 'Cache service is working correctly',
        details: {
          url: process.env.REDIS_URL,
          testPassed: true
        }
      };
    } else {
      return {
        service: 'Cache (Redis)',
        status: 'error',
        message: 'Cache service test failed - could not retrieve test data'
      };
    }
  } catch (error) {
    return {
      service: 'Cache (Redis)',
      status: 'error',
      message: `Cache service test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    };
  }
}

/**
 * Run all service tests
 */
export async function testAllServices(): Promise<TestResult[]> {
  console.log('🧪 Testing all notification services...\n');
  
  const tests = [
    testEmailService(),
    testSMSService(),
    testPushService(),
    testCacheService()
  ];
  
  const results = await Promise.all(tests);
  
  // Display results
  console.log('📊 Service Test Results:');
  console.log('========================\n');
  
  results.forEach(result => {
    const statusIcon = result.status === 'success' ? '✅' : 
                      result.status === 'error' ? '❌' : '⚠️';
    
    console.log(`${statusIcon} ${result.service}: ${result.message}`);
    
    if (result.details && result.status === 'success') {
      console.log(`   Details:`, result.details);
    }
    console.log('');
  });
  
  // Summary
  const successCount = results.filter(r => r.status === 'success').length;
  const errorCount = results.filter(r => r.status === 'error').length;
  const notConfiguredCount = results.filter(r => r.status === 'not_configured').length;
  
  console.log('📈 Summary:');
  console.log(`   ✅ Working: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  console.log(`   ⚠️  Not Configured: ${notConfiguredCount}`);
  
  if (errorCount > 0) {
    console.log('\n🔧 To fix errors, check the configuration in your .env file');
  }
  
  if (notConfiguredCount > 0) {
    console.log('\n📝 To configure optional services:');
    console.log('   1. Email: Add SMTP_HOST, SMTP_USER, SMTP_PASS');
    console.log('   2. SMS: Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
    console.log('   3. Push: VAPID keys are already generated');
    console.log('   4. Cache: Install and configure Redis (optional)');
  }
  
  return results;
}

/**
 * CLI function to run service tests
 */
async function main() {
  try {
    await testAllServices();
    console.log('\n✅ Service testing completed!');
  } catch (error) {
    console.error('❌ Service testing failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}