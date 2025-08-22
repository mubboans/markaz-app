import { Audio } from 'expo-av';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

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

    // Load Azaan sound (you would replace this with actual Azaan audio file)
    try {
      // For demo purposes, we'll use a web audio approach or system sound
      // In production, you would load an actual Azaan MP3 file here
      if (Platform.OS !== 'web') {
        // Use a system sound as fallback for mobile platforms
        const { sound } = await Audio.Sound.createAsync(
          { uri: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav' },
          { shouldPlay: false }
        );
        this.sound = sound;
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
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: `${prayerName} Prayer Time`,
          body: `It's time for ${prayerName} prayer`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          date: scheduledTime,
        },
      });

      this.notificationId = notificationId;
      console.log(`Azaan scheduled for ${prayerName} at ${time}`);
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