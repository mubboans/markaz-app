import * as BackgroundTask from 'expo-background-task';
import { azaanService } from '@/services/azaanService';

export const BG_TASK = 'play_azaan';

/* 1️⃣  define the task once (global side-effect) */
BackgroundTask.defineTask(BG_TASK, async () => {
    console.log('[BG] task fired – playing azaan');
    try {
        await azaanService.playAzaan();
        return BackgroundTask.TaskExecutor.SUCCESS; // ✅  new constant
    } catch (e) {
        console.error('[BG] playAzaan failed:', e);
        return BackgroundTask.TaskExecutor.FAILED;  // ✅  new constant
    }
});

/* 2️⃣  helper: cancel old + schedule new */
export async function scheduleBgAzaan(when: Date) {
    await BackgroundTask.unregisterTaskAsync(BG_TASK).catch(() => { }); // ignore if not found
    await BackgroundTask.registerTaskAsync(BG_TASK, {
        // seconds from now (minimum 60)
        timeInterval: Math.max(60, Math.round((when.getTime() - Date.now()) / 1000)),
        repeat: false,
    });
    console.log(`[BG] scheduled for ${when.toLocaleString()}`);
}