const audioSource = require('../assets/audio/azaan.wav');
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { Audio } from 'expo-av';
import Constants from "expo-constants";


class AzaanService {
    private notificationId: string | null | any = null;
    private player = createAudioPlayer(audioSource);
    private sound: Audio.Sound | null = null;
    private apiUrl = 'api/expotoken';
    async allowAlarms() {
        console.log(this.apiUrl,'apiUrl check')
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') return false;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('prayer', {
                name: 'Prayer Alerts',
                importance: Notifications.AndroidImportance.MAX, // Use MAX importance for critical notifications
                sound: 'azaan.mp3', // This should match the filename in android/app/src/main/res/raw/
                vibrationPattern: [0, 500, 200, 500],
                enableVibrate: true,
                lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, // Show on lock screen
                bypassDnd: true, 
            });
        }
        return true;
    }

    async initialize() {

        try {
            // await setAudioModeAsync({
            //     shouldPlayInBackground: true,   // iOS bg playback (requires UIBackgroundModes)
            //     playsInSilentMode: true,        // iOS mute switch
            //     interruptionMode: 'duckOthers', // 'duckOthers' | 'mixWithOthers' | 'doNotMix'
            //     shouldRouteThroughEarpiece: false, // Android -> speaker, not earpiece
            // }).catch((e) => console.warn('Audio mode error', e));
                if (Platform.OS !== 'web') {
                    // Load the appropriate Azaan sound file based on platform
                    const { sound } = await Audio.Sound.createAsync(
                        audioSource,
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
            return;
            scheduledTime.setDate(scheduledTime.getDate() + 1);
        }

        try {
            const notificationId =
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `${prayerName} Prayer Time`,
                        body: `Haiya Al Salah!`,
                        sound: 'azaan.wav',
                        priority: Notifications.AndroidNotificationPriority.MAX,
                        autoDismiss: false, // Prevent auto-dismissal on iOS
                        sticky: true, // Make notification persistent on Android
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
            //   this.playAzaan();
            // await scheduleBgAzaan(scheduledTime);
            console.log(`Azaan scheduled for ${prayerName} at ${time} (ID: ${notificationId}) at ${scheduledTime}`);
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
            console.log('playing azaan now');
            
            // await this.player.seekTo(0);
            // await this.player.play();
            this.sound?.replayAsync();
        } catch (error) {
            console.error('Error playing Azaan:', error);
        }
    }

    async cancelScheduledAzaan() {
        if (this.notificationId) {
            await Notifications.cancelAllScheduledNotificationsAsync();
            this.notificationId = null;
        }
    }

    async cleanup() {
        await this.player.pause();
        await this.player.seekTo(0);
        await this.cancelScheduledAzaan();
    }
}

export const azaanService = new AzaanService();