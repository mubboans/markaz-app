import { getPrayerTimes } from '@/services/prayerService';
import { create } from '@/utils/store';

export interface PrayerTime {
  name: string;
  time: string;
  arabic: string;
}

interface PrayerState {
  prayerTimes: PrayerTime[];
  nextPrayer: PrayerTime | null;
  fetchPrayerTimes: () => Promise<void>;
  updatePrayerTimes: (times: PrayerTime[]) => Promise<void>;
  updateNextPrayer: () => void;
}

const mockPrayerTimes = (): PrayerTime[] => {
    const getTIme = getPrayerTimes();
    console.log(getTIme, 'getTIme');
    
    const arabicNames = {
        fajr: "الفجر",
        sunrise: "الشروق",
        dhuhr: "الظهر",
        asr: "العصر",
        maghrib: "المغرب",
        isha: "العشاء"
    };

    return Object.entries(getTIme)
        .filter(([key]) => key !== "midnight")
        .map(([key, time]) => ({
            name: key.charAt(0).toUpperCase() + key.slice(1),
            time: String(time), // 👈 ensure time is a string
            arabic: arabicNames[key as keyof typeof arabicNames]
        }));
};



const getNextPrayer = (prayerTimes: PrayerTime[]): PrayerTime | null => {
  if (!prayerTimes || prayerTimes.length === 0) return null;
  
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  for (const prayer of prayerTimes) {
    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerTime = hours * 60 + minutes;
    
    if (prayerTime > currentTime) {
      return prayer;
    }
  }

  // If no prayer is found for today, return Fajr of next day
  return prayerTimes[0];
};

export const usePrayerStore = create<PrayerState>((set, get) => ({

  prayerTimes: [...mockPrayerTimes()],
  nextPrayer: getNextPrayer(mockPrayerTimes()),

  fetchPrayerTimes: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const times = mockPrayerTimes();
    console.log(times, 'mockPrayerTimes test');
    set({ 
      prayerTimes: times,
      nextPrayer: getNextPrayer(times),
    });
  },

  updatePrayerTimes: async (times) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ 
      prayerTimes: times,
      nextPrayer: getNextPrayer(times),
    });
  },
  
  // Add a method to update the next prayer based on current time
  updateNextPrayer: () => {
    const { prayerTimes } = get();
    set({ nextPrayer: getNextPrayer(prayerTimes) });
  },
}));