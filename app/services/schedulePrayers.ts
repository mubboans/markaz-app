import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function schedulePrayerAlarms(times: Record<string, string | number>) {
    await Notifications.cancelAllScheduledNotificationsAsync();

    const prayers = Object.entries(times).filter(
        ([k]) => !['sunrise', 'midnight'].includes(k)
    );

    for (const [name, time] of prayers) {
        const [h, m] = time.toString().split(':').map(Number);

        /*  ➜  NEW date every iteration  */
        const trigger = new Date();
        trigger.setHours(h, m, 0, 0);

        /* if time already passed today → schedule tomorrow */
        if (trigger < new Date()) trigger.setDate(trigger.getDate() + 1);

        console.log(`scheduling ${name} at`, trigger);
        await Notifications.scheduleNotificationAsync({
            identifier: name,
            content: {
                title: `⏰ ${name.charAt(0).toUpperCase() + name.slice(1)}`,
                body: 'Time to pray!',
                sound: 'azaan-android.mp3',
                vibrate: [0, 500, 200, 500],
                priority: Notifications.AndroidNotificationPriority.HIGH,
                data: { prayer: name },
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: trigger,
            },
        });
    }
}