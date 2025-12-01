import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { azaanService } from './azaanService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { androidOptimizationService } from './androidOptimization';

// Task name for background notification handling
export const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationHandler {
  private isInitialized = false;
  private foregroundSubscription: Notifications.EventSubscription | null = null;
  private responseSubscription: Notifications.EventSubscription | null = null;

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permissions
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
          allowDisplayInCarPlay: true,
          allowCriticalAlerts: true,
        },
        android: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        }
      });

      if (status !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      // Setup notification channel for Android
      if (Platform.OS === 'android') {
        await this.setupAndroidNotificationChannel();
      }

      // Setup listeners
      await this.setupNotificationListeners();

      // Register background task
      await this.registerBackgroundTask();

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize notification handler:', error);
      return false;
    }
  }

  private async setupAndroidNotificationChannel() {
    try {
      // Primary prayer notification channel with native sound
      await Notifications.setNotificationChannelAsync('prayer', {
        name: 'Prayer Notifications',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'azaan.wav', // References android/app/src/main/res/raw/azaan.wav
        vibrationPattern: [0, 500, 300, 500],
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        showBadge: true,
        enableLights: true,
        lightColor: '#059669',
      });
      console.log('✅ Prayer notification channel created with native sound');

      // Create a high priority channel for critical prayer notifications
      await Notifications.setNotificationChannelAsync('prayer-critical', {
        name: 'Critical Prayer Alerts',
        importance: Notifications.AndroidImportance.MAX, // Changed from HIGH to MAX for better reliability
        sound: 'azaan.wav',
        vibrationPattern: [0, 1000, 500, 1000],
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
        showBadge: true,
        enableLights: true,
        lightColor: '#dc2626',
      });
      console.log('✅ Critical prayer notification channel created');
    } catch (error) {
      console.error('❌ Failed to setup Android notification channels:', error);
      throw error;
    }
  }

  private async setupNotificationListeners() {
    // Handle notifications received while app is in foreground
    this.foregroundSubscription = Notifications.addNotificationReceivedListener(
      async (notification) => {
        console.log('Foreground notification received:', notification);
        await this.handleNotificationData(notification.request.content.data);
      }
    );

    // Handle notification responses (when user taps notification)
    this.responseSubscription = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        console.log('Notification response received:', response);
        await this.handleNotificationData(response.notification.request.content.data);
      }
    );
  }

  private async registerBackgroundTask() {
    // Check if task is already registered
    const registeredTasks = await TaskManager.getRegisteredTasksAsync();
    const isRegistered = registeredTasks.some(task => task.taskName === BACKGROUND_NOTIFICATION_TASK);

    if (!isRegistered) {
      try {
        await Notifications.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK);
        console.log('Background notification task registered successfully');
      } catch (error) {
        console.error('Failed to register background notification task:', error);
      }
    }
  }

  async handleNotificationData(data: any) {
    if (!data) {
      console.log('⚠️ No notification data received');
      return;
    }

    try {
      console.log('📱 Processing notification data:', JSON.stringify(data, null, 2));

      // Log the notification event for debugging
      await androidOptimizationService.logNotificationEvent('notification_received', {
        type: data.type,
        prayer: data.prayer,
        time: data.time,
        appState: 'unknown' // Could be enhanced with AppState.currentState
      });

      // Store notification data for potential retry
      await AsyncStorage.setItem('lastNotificationData', JSON.stringify({
        data,
        timestamp: Date.now()
      }));

      // Handle prayer-related notifications
      console.log(`🔍 Checking notification type: type="${data.type}", prayer="${data.prayer}"`);

      if (data.type || data.prayer) {
        console.log('✅ Condition met - calling handlePrayerNotification');
        await this.handlePrayerNotification(data);
      } else {
        console.log('⚠️ Notification does not match prayer criteria - skipping Azaan playback');
      }

      // Handle other notification types here as needed
      // if (data.type === 'reminder') {
      //   await this.handleReminderNotification(data);
      // }


    } catch (error) {
      console.error('Error handling notification data:', error);

      // Log the error
      await androidOptimizationService.logNotificationEvent('notification_error', {
        error: error instanceof Error ? error.message : String(error),
        data
      });

      // Store error for potential debugging
      await AsyncStorage.setItem('notificationError', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        data,
        timestamp: Date.now()
      }));
    }
  }

  private async handlePrayerNotification(data: any) {
    try {
      console.log(`🕌 ===== STARTING PRAYER NOTIFICATION HANDLER =====`);
      console.log(`🕌 Prayer: ${data.prayer || 'Not specified'}`);
      console.log(`🕌 Time: ${data.time || 'Not specified'}`);
      console.log(`🕌 Type: ${data.type || 'Not specified'}`);

      // Initialize azaan service if needed
      try {
        console.log('🎵 Initializing Azaan service...');
        await azaanService.initialize();
        console.log('✅ Azaan service initialized successfully');
      } catch (initError) {
        console.warn('⚠️ Azaan service initialization failed, will retry:', initError);
        // Continue anyway, playAzaan has its own retry logic
      }

      // Play azaan with error handling
      try {
        console.log('🎵 Attempting to play Azaan...');
        await azaanService.playAzaan();
        console.log('✅ ===== AZAAN PLAYBACK STARTED SUCCESSFULLY =====');
      } catch (playError) {
        console.error('❌ Failed to play azaan:', playError);
        console.error('❌ Error details:', playError instanceof Error ? playError.message : String(playError));
        // Log the error but don't throw - native notification sound should still play
        await androidOptimizationService.logNotificationEvent('azaan_playback_failed', {
          error: playError instanceof Error ? playError.message : String(playError),
          prayer: data.prayer,
          time: data.time
        });
      }

      // Log successful handling
      await AsyncStorage.setItem('lastPrayerNotification', JSON.stringify({
        prayer: data.prayer,
        time: data.time,
        handledAt: new Date().toISOString(),
        success: true
      }));

      console.log(`✅ Prayer notification handled successfully`);

    } catch (error) {
      console.error('❌ ===== ERROR IN PRAYER NOTIFICATION HANDLER =====');
      console.error('❌ Error:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      // Don't throw - we want to log the error but not crash
      await AsyncStorage.setItem('lastPrayerNotificationError', JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
        prayer: data.prayer,
        time: data.time,
        timestamp: new Date().toISOString()
      }));
    }
  }

  async checkLastNotification() {
    try {
      // Check if app was opened from a notification (cold start)
      const lastNotificationResponse = await Notifications.getLastNotificationResponseAsync();
      if (lastNotificationResponse?.notification?.request?.content?.data) {
        console.log('App opened from notification (cold start)');
        await this.handleNotificationData(lastNotificationResponse.notification.request.content.data);
      }

      // Check for any stored notification that might need retry
      const storedData = await AsyncStorage.getItem('lastNotificationData');
      if (storedData) {
        const { data, timestamp } = JSON.parse(storedData);
        // Only retry if it's within last 5 minutes
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          console.log('Retrying stored notification data');
          await this.handleNotificationData(data);
        }
        // Clear old stored data
        await AsyncStorage.removeItem('lastNotificationData');
      }
    } catch (error) {
      console.error('Error checking last notification:', error);
    }
  }

  cleanup() {
    this.foregroundSubscription?.remove();
    this.responseSubscription?.remove();
    this.foregroundSubscription = null;
    this.responseSubscription = null;
    this.isInitialized = false;
  }
}

// Define the background task
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error }) => {
  console.log('Background notification task executed:', { data, error });

  if (error) {
    console.error('Background notification task error:', error);
    return;
  }

  try {
    if (data) {
      const handler = new NotificationHandler();
      await handler.handleNotificationData(data);
    }
  } catch (error) {
    console.error('Error in background notification task:', error);
  }
});

export const notificationHandler = new NotificationHandler();