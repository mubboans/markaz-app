import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getPrayerTimes } from './prayerService';
import { schedulePrayerAlarms } from './schedulePrayers';
import { allowAlarms } from './allowScheduler';
// import { schedulePrayerAlarms } from '../notifications/schedulePrayers';
// import { getPrayerTimes } from '../api/getPrayerTimes'; // your function

const TASK_NAME = 'prayer-alarm-update';

TaskManager.defineTask(TASK_NAME, async () => {
    try {
        const times = getPrayerTimes(new Date()); // TODAY
        await schedulePrayerAlarms(times);
        return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (e) {
        return BackgroundFetch.BackgroundFetchResult.Failed;
    }
});

export async function registerBackgroundAlarmUpdate() {
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: 60 * 24, // 24 h
        stopOnTerminate: false, // <-- keeps running after kill
        startOnBoot: true, // <-- auto-restart after device reboot
    });
}

const TASK_NAMED = 'midnight-prayer-update';

TaskManager.defineTask(TASK_NAMED, async () => {
    const ok = await allowAlarms();
    if (!ok) return BackgroundFetch.BackgroundFetchResult.Failed;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const times = getPrayerTimes(tomorrow);
    await schedulePrayerAlarms(times);

    return BackgroundFetch.BackgroundFetchResult.NewData;
});

export async function registerMidnightTask() {
    await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: 60 * 24, // 24 h
        stopOnTerminate: false,
        startOnBoot: true,
    });
}



import * as Notifications from 'expo-notifications';
import { setPrayerAlarms } from './prayerAlarms';


export function installPrayerListener() {
    const sub = Notifications.addNotificationReceivedListener((event) => {
        if (event.request.content.data?._type === 'reschedule') {
            const fresh = getPrayerTimes(new Date());
            setPrayerAlarms(fresh); // today + 00:05 tomorrow
        }
    });
    return () => sub.remove();
}