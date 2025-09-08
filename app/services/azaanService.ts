import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { Platform } from 'react-native';

// Configure notifications to handle background and foreground notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldShowAlert: true,
    }),
});

// Define a constant for our background task name
const BACKGROUND_NOTIFICATION_TASK = 'BACKGROUND-NOTIFICATION-TASK';

// Set up background notification handler
TaskManager.defineTask(BACKGROUND_NOTIFICATION_TASK, async ({ data, error, executionInfo }) => {
  console.log('Received a notification in the background!');
  // You can do something with the notification data here
  // This ensures the app can respond to notifications even when closed
  if (data && typeof data === 'object' && 'prayer' in data) {
    // We can't directly play sound here, but we can schedule a task
    // The notification sound will play automatically based on the notification config
    console.log('Background prayer notification received:', data.prayer);
  }
  
  // Must return one of the BackgroundFetch results
  return BackgroundFetch.BackgroundFetchResult.NewData;
});

// Register the background notification task
try {
  // Register the task for background execution
  TaskManager.isTaskRegisteredAsync(BACKGROUND_NOTIFICATION_TASK).then(isRegistered => {
    if (!isRegistered) {
      BackgroundFetch.registerTaskAsync(BACKGROUND_NOTIFICATION_TASK, {
        minimumInterval: 60 * 15, // 15 minutes
        stopOnTerminate: false,
        startOnBoot: true,
      }).then(() => {
        console.log('Background notification task registered successfully');
      }).catch(error => {
        console.error('Failed to register background notification task:', error);
      });
    } else {
      console.log('Background notification task already registered');
    }
  });
} catch (error) {
  console.error('Error checking task registration:', error);
}

class AzaanService {
  private sound: Audio.Sound | null = null;
  private notificationId: string | null = null;

  async initialize() {
    // Request notification permissions
    if (Platform.OS !== 'web') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permission not granted');
      }
    }

    // Load Azaan sound from assets
    try {
      if (Platform.OS !== 'web') {
        // Load the appropriate Azaan sound file based on platform
        const soundSource = Platform.OS === 'android' 
          ? require('../assets/audio/azaan_android.mp3')
          : require('../assets/audio/azaan.mp3');
          
        const { sound } = await Audio.Sound.createAsync(
          soundSource,
          { shouldPlay: false }
        );
        this.sound = sound;
        console.log('Azaan sound loaded successfully');
      }
    } catch (error) {
      console.warn('Could not load Azaan sound:', error);
    }
  }

  async scheduleAzaan(prayerName: string, time: string) {
    if (Platform.OS === 'web') {
      // Web fallback - use browser notification
      this.scheduleWebNotification(prayerName, time);
      return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    try {
      // For Android, we need to specify the sound file in the notification channel
      // For iOS, we can specify it directly in the notification content
      const soundName = Platform.OS === 'android' ? 'azaan.mp3' : 'azaan.mp3';
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayerName} Prayer Time`,
          body: `It's time for ${prayerName} prayer`,
          sound: soundName,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          // Add additional properties to ensure notification works in all states
          autoDismiss: false, // Prevent auto-dismissal on iOS
          sticky: true, // Make notification persistent on Android
          vibrate: [0, 250, 250, 250], // Custom vibration pattern
          // Include data for background handling
          data: { 
            prayer: prayerName.toLowerCase(),
            timestamp: new Date().getTime(),
            requiresPlayback: true,
            _displayInForeground: true // Force display even in foreground
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: scheduledTime,
        },
      });

      this.notificationId = notificationId;
      console.log(`Azaan scheduled for ${prayerName} at ${time} (ID: ${notificationId})`);
    } catch (error) {
      console.error('Error scheduling Azaan:', error);
    }
  }

  private scheduleWebNotification(prayerName: string, time: string) {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeUntilPrayer = scheduledTime.getTime() - now.getTime();

    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification(`${prayerName} Prayer Time`, {
          body: `It's time for ${prayerName} prayer`,
          icon: '/icon.png',
        });
      }
      this.playAzaan();
    }, timeUntilPrayer);
  }

  async playAzaan() {
    try {
      if (this.sound) {
        await this.sound.replayAsync();
      } else {
        // Fallback for web or when sound couldn't be loaded
        console.log('Playing Azaan sound (fallback)');
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          // Use a simple beep sound for web demo
          const audioContext = new (window as any).AudioContext();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 1);
        }
      }
    } catch (error) {
      console.error('Error playing Azaan:', error);
    }
  }

  async cancelScheduledAzaan() {
    if (this.notificationId) {
      await Notifications.cancelScheduledNotificationAsync(this.notificationId);
      this.notificationId = null;
    }
  }

  async cleanup() {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
    await this.cancelScheduledAzaan();
  }
}

export const azaanService = new AzaanService();