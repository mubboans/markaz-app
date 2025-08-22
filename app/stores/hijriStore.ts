import { create } from '@/utils/store';

export interface HijriDate {
  day: number;
  month: number;
  year: number;
}

interface HijriState {
  hijriDate: HijriDate;
  gregorianDate: Date;
  fetchHijriDate: () => Promise<void>;
  updateHijriDate: (newDate: HijriDate) => Promise<void>;
  adjustHijriDate: (adjustment: number) => Promise<void>;
}

// Helper function to calculate Hijri date (simplified approximation)
const calculateHijriDate = (gregorianDate: Date): HijriDate => {
  // This is a simplified calculation. In a real app, you'd use a proper Islamic calendar library
  const hijriEpoch = new Date('622-07-16'); // Approximate start of Hijri calendar
  const daysDiff = Math.floor((gregorianDate.getTime() - hijriEpoch.getTime()) / (1000 * 60 * 60 * 24));
  
  // Approximate conversion (Islamic year is about 354.37 days)
  const hijriYear = Math.floor(daysDiff / 354.37) + 1;
  const remainingDays = daysDiff % 354.37;
  
  // Approximate month calculation (Islamic months are about 29.53 days)
  const hijriMonth = Math.floor(remainingDays / 29.53) + 1;
  const hijriDay = Math.floor(remainingDays % 29.53) + 1;
  
  return {
    day: Math.max(1, Math.min(30, hijriDay)),
    month: Math.max(1, Math.min(12, hijriMonth)),
    year: Math.max(1, hijriYear),
  };
};

// Get current date or stored adjustment
const getCurrentHijriDate = (): { hijri: HijriDate; gregorian: Date } => {
  const today = new Date();
  const calculatedHijri = calculateHijriDate(today);
  
  // In a real app, you'd check for any admin adjustments from storage/database
  // For now, we'll use the calculated date
  return {
    hijri: calculatedHijri,
    gregorian: today,
  };
};

export const useHijriStore = create<HijriState>((set, get) => {
  const { hijri, gregorian } = getCurrentHijriDate();
  
  return {
    hijriDate: hijri,
    gregorianDate: gregorian,

    fetchHijriDate: async () => {
      await new Promise(resolve => setTimeout(resolve, 300));
      const { hijri, gregorian } = getCurrentHijriDate();
      set({ hijriDate: hijri, gregorianDate: gregorian });
    },

    updateHijriDate: async (newDate: HijriDate) => {
      await new Promise(resolve => setTimeout(resolve, 300));
      // In a real app, you'd save this adjustment to storage/database
      set({ hijriDate: newDate });
    },

    adjustHijriDate: async (adjustment: number) => {
      const currentDate = get().hijriDate;
      const newDay = currentDate.day + adjustment;
      
      let finalDay = newDay;
      let finalMonth = currentDate.month;
      let finalYear = currentDate.year;
      
      if (newDay > 30) {
        finalDay = newDay - 30;
        finalMonth += 1;
        if (finalMonth > 12) {
          finalMonth = 1;
          finalYear += 1;
        }
      } else if (newDay < 1) {
        finalDay = 30 + newDay;
        finalMonth -= 1;
        if (finalMonth < 1) {
          finalMonth = 12;
          finalYear -= 1;
        }
      }
      
      const adjustedDate: HijriDate = {
        day: finalDay,
        month: finalMonth,
        year: Math.max(1, finalYear),
      };
      
      await get().updateHijriDate(adjustedDate);
    },
  };
});