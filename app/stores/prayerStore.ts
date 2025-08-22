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
}

const mockPrayerTimes: PrayerTime[] = [
  { name: 'Fajr', time: '05:30', arabic: 'الفجر' },
  { name: 'Sunrise', time: '06:45', arabic: 'الشروق' },
  { name: 'Dhuhr', time: '12:15', arabic: 'الظهر' },
  { name: 'Asr', time: '15:30', arabic: 'العصر' },
  { name: 'Maghrib', time: '18:45', arabic: 'المغرب' },
  { name: 'Isha', time: '20:00', arabic: 'العشاء' },
];

const getNextPrayer = (prayerTimes: PrayerTime[]): PrayerTime | null => {
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
  prayerTimes: mockPrayerTimes,
  nextPrayer: getNextPrayer(mockPrayerTimes),

  fetchPrayerTimes: async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ 
      prayerTimes: mockPrayerTimes,
      nextPrayer: getNextPrayer(mockPrayerTimes),
    });
  },

  updatePrayerTimes: async (times) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    set({ 
      prayerTimes: times,
      nextPrayer: getNextPrayer(times),
    });
  },
}));