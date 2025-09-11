import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { azaanService } from '@/services/azaanService';
export const BG_TASK = 'play_azaan';
export const BG_NOTIFICATION = 'bg_notification';
import { getPrayerTimes } from './prayerService';
import AsyncStorage from '@react-native-async-storage/async-storage';

TaskManager.defineTask(BG_TASK, async () => {
    console.log('------------------------------BG-------------------');
    try {
        const prayerTime = getPrayerTimes(new Date());
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        
        const nextPrayer = getNextPrayer(prayerTime, now);
        console.log(nextPrayer,'nextPrayer');
        console.log(currentMinutes,'currentMinutes');
        // ✅ check if we are within ±1 min of prayer time
        if (Math.abs(currentMinutes - nextPrayer.minutes) <= 1) {
            await azaanService.initialize();
            await azaanService.playAzaan();
        } 
        return BackgroundTask.BackgroundTaskResult.Success;
    //    return BackgroundTask.BackgroundTaskResult.Success
    } catch (e) {
        console.error('[BG] playAzaan failed:', e);
       return BackgroundTask.BackgroundTaskResult.Failed
        // return BackgroundTask.TaskExecutor.FAILED;  // ✅  new constant
    }
});
/* 2️⃣  helper: cancel old + schedule new */
export async function scheduleBgAzaan(when = new Date) {
     await BackgroundTask.registerTaskAsync(BG_TASK, {minimumInterval: 15});
}

function toMinutes(hhmm: string): number {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
}

function getNextPrayer(prayers: Record<string, string | number>, now = new Date()) {
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const upcoming = Object.entries(prayers)
        .map(([name, time]) => ({ name, minutes: toMinutes(time.toString()) }))
        .filter(({ minutes }) => minutes >= currentMinutes)
        .sort((a, b) => a.minutes - b.minutes);

    // If no prayers left today → fallback to tomorrow’s Fajr
    return upcoming[0] ?? { name: "fajr", minutes: toMinutes(prayers.fajr.toString()) + 24 * 60 };
}


export const NEW_DAY_TASK = 'new-day-hourly-check';
const PREV_DAY_KEY = 'prev-day-key';
const DAY_LOCK_KEY = 'prev-day-lock';

// stable “YYYY-MM-DD” in device local time (replace with a fixed timeZone if needed)
function getLocalDayKey(d = new Date()): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

async function onNewDay(prevKey: string, currKey: string) {
    try {
        await azaanService.cleanup();

        const today = getPrayerTimes(new Date());
        for (const [name, time] of Object.entries(today)) {
            if (!['sunrise', 'midnight'].includes(name)) {
                const formatted = name.charAt(0).toUpperCase() + name.slice(1);
                try {
                    await azaanService.scheduleAzaan(formatted, String(time));
                } catch (e) {
                    console.warn('Failed to schedule', formatted, e);
                }
            }
        }
    } catch (e) {
        console.warn('onNewDay error:', e);
        throw e;
    }
}

// ---- DEFINE TASK (top-level) ----
TaskManager.defineTask(NEW_DAY_TASK, async () => {
    try {
        const currKey = getLocalDayKey();
        const prevKey = (await AsyncStorage.getItem(PREV_DAY_KEY)) ?? currKey;

        // Optional: lock to avoid concurrent overlaps
        const lock = await AsyncStorage.getItem(DAY_LOCK_KEY);
        if (lock === currKey) {
            return BackgroundTask.BackgroundTaskResult.Success; // already running for this day
        }

        if (prevKey !== currKey) {
            await AsyncStorage.setItem(DAY_LOCK_KEY, currKey);
            await onNewDay(prevKey, currKey);
            await AsyncStorage.multiRemove([DAY_LOCK_KEY]);               // clear lock
            await AsyncStorage.setItem(PREV_DAY_KEY, currKey);            // commit success
        }

        return BackgroundTask.BackgroundTaskResult.Success;
    } catch (e) {
        console.warn('NEW_DAY_TASK exception:', e);
        return BackgroundTask.BackgroundTaskResult.Failed; // verify enum for your installed version
    }
});

// ---- REGISTER / UNREGISTER HELPERS ----
export async function registerNewDayTask() {
    const currKey = getLocalDayKey();
    const stored = await AsyncStorage.getItem(PREV_DAY_KEY);
    if (!stored) await AsyncStorage.setItem(PREV_DAY_KEY, currKey);

    await BackgroundTask.registerTaskAsync(NEW_DAY_TASK, {
        minimumInterval: 60,        // hourly hint
        // android-only options if supported by your version:
        // stopOnTerminate: false,
        // startOnBoot: true,
    });
}


