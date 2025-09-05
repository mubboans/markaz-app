import * as Notifications from 'expo-notifications';
import { allowAlarms } from './allowScheduler';
import { getPrayerTimes } from './prayerService';
import { schedulePrayerAlarms } from './schedulePrayers';

const RESCHEDULE = 'self-reschedule';

export async function setSelfReschedulingAlarm() {
    const ok = await allowAlarms();
    if (!ok) return;

    /* cancel old reschedule alarm */
    await Notifications.cancelScheduledNotificationAsync(RESCHEDULE);

    const t = new Date();
    t.setDate(t.getDate() + 1);
    t.setHours(0, 5, 0, 0); // 00:05 tomorrow

    await Notifications.scheduleNotificationAsync({
        identifier: RESCHEDULE,
        content: {
            title: '',
            body: '', // silent
            data: { _type: 'reschedule' }, // flag
            sound: '',
            vibrate: [],
            priority: Notifications.AndroidNotificationPriority.MIN,
        },
        trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: t,
        },
    });
}