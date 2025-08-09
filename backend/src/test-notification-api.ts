import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

interface NotificationData {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
}

class NotificationAPITester {
  private baseURL: string;

  constructor(baseURL: string = API_BASE) {
    this.baseURL = baseURL;
  }

  async testHealthCheck() {
    console.log('\n🔍 Testing Health Check...');
    try {
      const response = await axios.get(`${this.baseURL.replace('/api', '')}/health`);
      console.log('✅ Health Check:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Health Check failed:', error.message);
      throw error;
    }
  }

  async createNotification(data: NotificationData) {
    console.log('\n📝 Creating notification...');
    try {
      const response = await axios.post(`${this.baseURL}/notifications`, data);
      console.log('✅ Notification created:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Create notification failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getNotifications(params: any = {}) {
    console.log('\n📋 Fetching notifications...');
    try {
      const response = await axios.get(`${this.baseURL}/notifications`, { params });
      console.log('✅ Notifications fetched:', {
        count: response.data.data.notifications.length,
        pagination: response.data.data.pagination
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ Fetch notifications failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async markAsRead(notificationId: string) {
    console.log(`\n✅ Marking notification ${notificationId} as read...`);
    try {
      const response = await axios.patch(`${this.baseURL}/notifications/${notificationId}/read`);
      console.log('✅ Notification marked as read:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Mark as read failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async getStats(userId: string) {
    console.log(`\n📊 Fetching stats for user ${userId}...`);
    try {
      const response = await axios.get(`${this.baseURL}/notifications/stats/${userId}`);
      console.log('✅ Stats fetched:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ Fetch stats failed:', error.response?.data || error.message);
      throw error;
    }
  }

  async runFullTest() {
    console.log('🚀 Starting Notification API Test Suite...');
    
    try {
      // Test health check
      await this.testHealthCheck();

      // Test data
      const testUserId = 'user-1'; // Use existing user ID from setup
      const testNotifications: NotificationData[] = [
        {
          userId: testUserId,
          type: 'INQUIRY',
          title: 'New Property Inquiry',
          message: 'Someone is interested in your property listing.',
          data: { propertyId: 'prop-123', inquiryType: 'VIEWING' }
        },
        {
          userId: testUserId,
          type: 'APPOINTMENT',
          title: 'Appointment Scheduled',
          message: 'Your property viewing has been scheduled for tomorrow.',
          data: { appointmentId: 'apt-456', scheduledAt: new Date().toISOString() }
        },
        {
          userId: testUserId,
          type: 'PRICE_CHANGE',
          title: 'Price Alert',
          message: 'A property in your watchlist has changed price.',
          data: { propertyId: 'prop-789', oldPrice: 500000, newPrice: 480000 }
        }
      ];

      // Create test notifications
      const createdNotifications = [];
      for (const notification of testNotifications) {
        const created = await this.createNotification(notification);
        createdNotifications.push(created.data);
        await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
      }

      // Fetch all notifications
      await this.getNotifications({ userId: testUserId });

      // Fetch notifications by type
      await this.getNotifications({ userId: testUserId, type: 'INQUIRY' });

      // Fetch unread notifications
      await this.getNotifications({ userId: testUserId, read: 'false' });

      // Mark first notification as read
      if (createdNotifications.length > 0) {
        await this.markAsRead(createdNotifications[0].id);
      }

      // Fetch read notifications
      await this.getNotifications({ userId: testUserId, read: 'true' });

      // Get user stats
      await this.getStats(testUserId);

      console.log('\n🎉 All tests completed successfully!');
      
    } catch (error) {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    }
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  const tester = new NotificationAPITester();
  tester.runFullTest().then(() => {
    console.log('\n✨ Test suite finished!');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Test suite failed:', error);
    process.exit(1);
  });
}

export default NotificationAPITester;