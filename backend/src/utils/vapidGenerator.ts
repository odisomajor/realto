import webpush from 'web-push';
import { promises as fs } from 'fs';
import path from 'path';

/**
 * Generate VAPID keys for web push notifications
 */
export function generateVapidKeys() {
  const vapidKeys = webpush.generateVAPIDKeys();
  
  console.log('🔑 VAPID Keys Generated:');
  console.log('========================');
  console.log('Public Key:', vapidKeys.publicKey);
  console.log('Private Key:', vapidKeys.privateKey);
  console.log('========================');
  
  return vapidKeys;
}

/**
 * Save VAPID keys to environment file
 */
export async function saveVapidKeysToEnv(envFilePath: string = '.env.local') {
  try {
    const vapidKeys = generateVapidKeys();
    const envPath = path.resolve(envFilePath);
    
    // Read existing env file
    let envContent = '';
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch (error) {
      console.log('Creating new environment file...');
    }
    
    // Update VAPID keys in env content
    const updatedContent = envContent
      .replace(/VAPID_PUBLIC_KEY=".*"/, `VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"`)
      .replace(/VAPID_PRIVATE_KEY=".*"/, `VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"`);
    
    // If keys weren't found in existing content, append them
    if (!updatedContent.includes('VAPID_PUBLIC_KEY=')) {
      const newKeys = `
# Push Notification VAPID Keys (Generated)
VAPID_PUBLIC_KEY="${vapidKeys.publicKey}"
VAPID_PRIVATE_KEY="${vapidKeys.privateKey}"
VAPID_SUBJECT="mailto:admin@xillix.co.ke"
`;
      await fs.writeFile(envPath, updatedContent + newKeys);
    } else {
      await fs.writeFile(envPath, updatedContent);
    }
    
    console.log(`✅ VAPID keys saved to ${envPath}`);
    console.log('📝 Please update VAPID_SUBJECT with your actual email address');
    
    return vapidKeys;
  } catch (error) {
    console.error('❌ Error saving VAPID keys:', error);
    throw error;
  }
}

/**
 * CLI function to generate and save VAPID keys
 */
async function main() {
  const args = process.argv.slice(2);
  const envFile = args[0] || '.env.local';
  
  console.log('🚀 Generating VAPID keys for push notifications...');
  
  try {
    await saveVapidKeysToEnv(envFile);
    console.log('✅ VAPID keys generation completed!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Update VAPID_SUBJECT in your .env file with your email');
    console.log('2. Configure your email SMTP settings');
    console.log('3. Test push notifications using the API endpoints');
  } catch (error) {
    console.error('❌ Failed to generate VAPID keys:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}