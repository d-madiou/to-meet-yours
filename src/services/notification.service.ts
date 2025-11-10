import { apiService } from '@/src/services/api/api.service';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
// Assuming you import ENDPOINTS from 'src/config/api.config.ts' in a real setup
// For simplicity in this standalone file, I'll use the hardcoded corrected path
// import { ENDPOINTS } from '@/src/config/api.config'; 

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    
  }),
});

interface NotificationData {
  type: 'like' | 'match' | 'message';
  userId?: string;
  username?: string;
  matchId?: string;
  messageId?: string;
}

class NotificationService {
  private expoPushToken: string | null = null;

  /**
   * Initialize push notifications
   */
  async initialize(): Promise<void> {
    try {
      // Request permissions
      const token = await this.registerForPushNotifications();
      
      if (token) {
        this.expoPushToken = token;
        console.log('✅ Push token obtained:', token);
        
        // Send token to backend
        await this.sendTokenToBackend(token);
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('⚠️ Push notifications only work on physical devices');
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('❌ Permission not granted for push notifications');
        return null;
      }

      // Get push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                        Constants.easConfig?.projectId;

      if (!projectId) {
        console.error('❌ Project ID not found. Run: eas build:configure');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      console.log('📱 Expo Push Token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  /**
   * Send push token to backend
   */
  async sendTokenToBackend(token: string): Promise<void> {
    try {
      // 🚀 FINAL FIX: Corrected path to match backend router: 'users/device-tokens/register/'
      await apiService.post('/users/device-tokens/register/', { 
        token,
        platform: Platform.OS,
        device_type: Device.deviceName || 'Unknown',
      });
      console.log('✅ Token sent to backend');
    } catch (error) {
      console.error('Failed to send token to backend:', error);
    }
  }

  /**
   * Setup notification listeners
   */
  setupListeners(
    onNotificationReceived?: (notification: Notifications.Notification) => void,
    onNotificationTapped?: (response: Notifications.NotificationResponse) => void
  ) {
    // Listener for when notification is received while app is in foreground
    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('📬 Notification received:', notification);
        onNotificationReceived?.(notification);
      }
    );

    // Listener for when user taps on notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('👆 Notification tapped:', response);
        onNotificationTapped?.(response);
      }
    );

    // Return cleanup function
    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }

  /**
   * Schedule local notification (for testing)
   */
  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: NotificationData
  ): Promise<void> {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Show immediately
    });
  }

  /**
   * Cancel all notifications
   */
  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  /**
   * Get badge count
   */
  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }
}

export const notificationService = new NotificationService();