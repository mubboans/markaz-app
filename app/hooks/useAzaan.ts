import { useEffect } from 'react';
import { Platform } from 'react-native';
import { azaanService } from '@/services/azaanService';
import { usePrayerStore } from '@/stores/prayerStore';

export function useAzaan() {
  const { prayerTimes } = usePrayerStore();

  useEffect(() => {
    const initializeAzaan = async () => {
      await azaanService.initialize();

      // Schedule Azaan for all prayer times
      prayerTimes.forEach(prayer => {
        if (prayer.name !== 'Sunrise') { // Don't schedule Azaan for sunrise
          azaanService.scheduleAzaan(prayer.name, prayer.time);
        }
      });
    };

    initializeAzaan();

    return () => {
      azaanService.cleanup();
    };
  }, [prayerTimes]);

  return {
    playAzaan: azaanService.playAzaan.bind(azaanService),
    scheduleAzaan: azaanService.scheduleAzaan.bind(azaanService),
  };
}