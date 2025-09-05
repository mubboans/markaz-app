import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

const RESCHEDULE = 'daily-reschedule';

export async function allowAlarms() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('prayer', {
            name: 'Prayer Alerts',
            importance: Notifications.AndroidImportance.HIGH,
            sound: 'azaan-android.mp3',
            vibrationPattern: [0, 500, 200, 500],
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
                title: `⏰ ${name.charAt(0).toUpperCase() + name.slice(1)}`,
                body: 'Time to pray!',
                sound: 'azaan-android.mp3',
                vibrate: [0, 500, 200, 500],
                data: { prayer: name },
            },
            trigger: 
            // null
            {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: customDate,
                // seconds: 5,
            },
        });
    }

    /* silent 00:05 alarm that re-runs this function tomorrow */
    // const next = new Date(now);
    // next.setDate(next.getDate() + 1);
    // next.setHours(0, 5, 0, 0);

    // await Notifications.scheduleNotificationAsync({
    //     identifier: RESCHEDULE,
    //     content: {
    //         title: '',
    //         body: '',
    //         data: { _type: 'reschedule' },
    //         sound: '',
    //         vibrate: [],
    //         priority: Notifications.AndroidNotificationPriority.MIN,
    //     },
    //     trigger: {
    //         type: Notifications.SchedulableTriggerInputTypes.DATE,
    //         date: next,
    //     },
    // });
}