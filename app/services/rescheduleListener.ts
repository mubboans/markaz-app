import * as Notifications from 'expo-notifications';
import { schedulePrayerAlarms } from '@/services/schedulePrayers';
import { getPrayerTimes } from '@/services/prayerService';
import { setSelfReschedulingAlarm } from './reshedulerService';

export function installRescheduleListener() {
    const sub = Notifications.addNotificationReceivedListener((event) => {
        if (event.request.content.data?._type === 'reschedule') {
            // today’s times
            const times = getPrayerTimes(new Date());
            schedulePrayerAlarms(times); // schedule today
            setSelfReschedulingAlarm();  // schedule tomorrow 00:05
        }
    });
    return () => sub.remove();
}