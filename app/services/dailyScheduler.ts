import { allowAlarms } from './allowScheduler';
import { registerMidnightTask } from './prayerBackground';
import { getPrayerTimes } from './prayerService';
import { schedulePrayerAlarms } from './schedulePrayers';

export async function bootstrapPrayers() {
    const ok = await allowAlarms();
    if (!ok) return;

    let today = getPrayerTimes();
    console.log('today\'s prayer times', today);
    await schedulePrayerAlarms(today); // today immediately
    await registerMidnightTask(); // tomorrow onwards
}