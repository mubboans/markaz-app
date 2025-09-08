import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notifications to handle background and foreground notifications
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldShowAlert: true, // Ensure alerts show in all states
    }),
});

const RESCHEDULE = 'daily-reschedule';

export async function allowAlarms() {
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
            bypassDnd: true, // Bypass Do Not Disturb mode
            showBadge: true, // Show badge on app icon
        });
    }
    return true;
}

export async function setPrayerAlarms(times: Record<string, string | number>) {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const prayers = Object.entries(times).filter(
        ([k]) => !['sunrise', 'midnight'].includes(k)
    );

    const now = new Date();
    for (const [name, time] of prayers) {
        console.log(prayers, 'prayers',now);
        
        const [h, m] = time.toString().split(':').map(Number);

        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');

        const customDate = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            h,
            m,
            0 // seconds
        );

        const t = new Date(now);
        t.setHours(h, m, 0, 0);
        if (t < now) t.setDate(t.getDate() + 1);
        console.log(`scheduling ${name} at `, customDate);
        
        await Notifications.scheduleNotificationAsync({
            identifier: name,
            content: {
                title: `⏰ ${name.charAt(0).toUpperCase() + name.slice(1)} Time`,
                body: "Haiya Al Salah!",
                sound: Platform.OS === 'android' ? 'azaan.mp3' : 'azaan.mp3',
                vibrate: [0, 500, 200, 500],
                priority: Notifications.AndroidNotificationPriority.HIGH,
                autoDismiss: false, // Prevent auto-dismissal on iOS
                sticky: true, // Make notification persistent on Android
                data: { 
                    prayer: name,
                    timestamp: new Date().getTime(),
                    requiresPlayback: true,
                    _displayInForeground: true // Force display even in foreground
                },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: customDate,
            },
        });
        
        console.log(`Prayer alarm scheduled for ${name} at ${time} with sound`);
    }
}