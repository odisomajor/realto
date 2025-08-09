import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface TestUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface TestNotification {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read?: boolean;
}

const testUsers: TestUser[] = [
  {
    id: 'user-1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'USER'
  },
  {
    id: 'user-2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'AGENT'
  },
  {
    id: 'user-3',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'ADMIN'
  }
];

const testNotifications: TestNotification[] = [
  {
    userId: 'user-1',
    type: 'INQUIRY',
    title: 'New Property Inquiry',
    message: 'Someone is interested in your property listing on Main Street.',
    data: { propertyId: 'prop-123', inquiryType: 'VIEWING' },
    read: false
  },
  {
    userId: 'user-1',
    type: 'APPOINTMENT',
    title: 'Appointment Scheduled',
    message: 'Your property viewing has been scheduled for tomorrow at 2 PM.',
    data: { appointmentId: 'apt-456', scheduledAt: new Date().toISOString() },
    read: false
  },
  {
    userId: 'user-1',
    type: 'PRICE_CHANGE',
    title: 'Price Alert',
    message: 'A property in your watchlist has reduced its price by $20,000.',
    data: { propertyId: 'prop-789', oldPrice: 500000, newPrice: 480000 },
    read: true
  },
  {
    userId: 'user-2',
    type: 'NEW_LISTING',
    title: 'New Listing Match',
    message: 'A new property matching your criteria has been listed.',
    data: { propertyId: 'prop-101', location: 'Downtown', price: 350000 },
    read: false
  },
  {
    userId: 'user-2',
    type: 'REVIEW',
    title: 'New Review Received',
    message: 'You have received a 5-star review from a recent client.',
    data: { reviewId: 'rev-202', rating: 5, propertyId: 'prop-555' },
    read: false
  },
  {
    userId: 'user-3',
    type: 'SYSTEM',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight from 2-4 AM.',
    data: { maintenanceWindow: '2024-01-15T02:00:00Z' },
    read: true
  }
];

async function setupDatabase() {
  console.log('🔧 Setting up local database with test data...');

  try {
    // Check if we can connect to the database
    await prisma.$connect();
    console.log('✅ Database connection established');

    // Create test users
    console.log('👥 Creating test users...');
    for (const user of testUsers) {
      try {
        await prisma.user.upsert({
          where: { id: user.id },
          update: {},
          create: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role as any,
            password: 'hashed-password-placeholder', // In real app, this would be properly hashed
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        console.log(`  ✅ User created: ${user.firstName} ${user.lastName} (${user.email})`);
      } catch (error: any) {
        console.log(`  ⚠️  User might already exist: ${user.email}`);
      }
    }

    // Create test notifications
    console.log('📧 Creating test notifications...');
    for (const notification of testNotifications) {
      try {
        const created = await prisma.notification.create({
          data: {
            userId: notification.userId,
            type: notification.type as any,
            title: notification.title,
            message: notification.message,
            data: notification.data ? JSON.stringify(notification.data) : null, // Convert to JSON string for SQLite
            read: notification.read || false,
            sent: true,
            sentAt: new Date(),
            createdAt: new Date()
          }
        });
        console.log(`  ✅ Notification created: ${created.title} for user ${notification.userId}`);
      } catch (error: any) {
        console.log(`  ❌ Failed to create notification: ${error.message}`);
      }
    }

    // Display summary
    const userCount = await prisma.user.count();
    const notificationCount = await prisma.notification.count();
    const unreadCount = await prisma.notification.count({ where: { read: false } });

    console.log('\n📊 Database Setup Summary:');
    console.log(`  👥 Users: ${userCount}`);
    console.log(`  📧 Total Notifications: ${notificationCount}`);
    console.log(`  📬 Unread Notifications: ${unreadCount}`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n🚀 You can now test the notification API with:');
    console.log('   npx ts-node src/test-notification-api.ts');

  } catch (error: any) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.message.includes('connect')) {
      console.log('\n💡 Database connection tips:');
      console.log('  1. Make sure PostgreSQL is running');
      console.log('  2. Check your DATABASE_URL in .env file');
      console.log('  3. Try running: npx prisma migrate dev --name init');
      console.log('  4. Or use SQLite for local testing by updating schema.prisma');
    }
    
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('✨ Setup script finished!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup script failed:', error);
      process.exit(1);
    });
}

export default setupDatabase;