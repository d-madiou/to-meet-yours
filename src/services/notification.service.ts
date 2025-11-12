import { apiService } from '@/src/services/api/api.service';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// A simple logger utility for consistent logging
const Logger = {
  log: (message: string, ...args: unknown[]) => console.log(`[NotificationService] ${message}`, ...args),
  warn: (message: string, ...args: unknown[]) => console.warn(`[NotificationService] ⚠️ ${message}`, ...args),
  error: (message: string, ...args: unknown[]) => console.error(`[NotificationService] ❌ ${message}`, ...args),
};

// Using a mock for demonstration. In a real app, this would be in a separate config file.
const ENDPOINTS = {
  USERS: {
    REGISTER_DEVICE_TOKEN: '/users/device-tokens/register/',
  },
};

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowAlert: true,
  }),
});

export enum NotificationType {
  Like = 'like',
  Match = 'match',
  Message = 'message',
}

export interface NotificationData {
  type: NotificationType;
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
        Logger.log('Push token obtained:', token);
        
        // Send token to backend
        await this.sendTokenToBackend(token);
      }
    } catch (error) {
      Logger.error('Failed to initialize notifications:', error);
    }
  }

  /**
   * Register for push notifications
   */
  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      Logger.warn('Push notifications only work on physical devices. Skipping registration.');
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
        Logger.warn('Permission not granted for push notifications.');
        return null;
      }

      // Get push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                        Constants.easConfig?.projectId;

      if (!projectId) {
        Logger.error('Project ID not found in app config. Run `eas build:configure` to set it.');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      Logger.log('Expo Push Token obtained:', token.data);
      return token.data;
    } catch (error) {
      Logger.error('Failed to get push token:', error);
      return null;
    }
  }

  /**
   * Send push token to backend
   */
  async sendTokenToBackend(token: string): Promise<void> {
    try {
      await apiService.post(ENDPOINTS.USERS.REGISTER_DEVICE_TOKEN, { 
        token,
        platform: Platform.OS,
        deviceName: Device.deviceName || 'Unknown',
      });
      Logger.log('Token sent to backend successfully.');
    } catch (error) {
      Logger.error('Failed to send token to backend:', error);
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
        Logger.log('Notification received:', notification);
        onNotificationReceived?.(notification);
      }
    );

    // Listener for when user taps on notification
    const responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        Logger.log('Notification tapped:', response);
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
        sound: 'default',
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