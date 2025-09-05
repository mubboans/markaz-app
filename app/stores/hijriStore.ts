import { create } from '@/utils/store';
import moment from 'moment-hijri';
export interface HijriDateObj {
    day: number;
    month: number;
    year: number;
}

interface HijriState {
    hijriDate: HijriDateObj;
    gregorianDate: Date;
    fetchHijriDate: () => Promise<void>;
    adjustHijriDate: (days: number) => void;
}

const getHijriDateObjectForMumbai = (gregorianDate: Date): HijriDateObj => {
    const adjustedDate = new Date(gregorianDate);
    adjustedDate.setDate(gregorianDate.getDate() - 1); // Adjust as needed
    const hijriDate = moment(adjustedDate).format('iD/iM/iYYYY');
    const [hijriDay, hijriMonthNumber, hijriYear] = hijriDate.split('/').map(Number);
    return {
        day: hijriDay,
        month: hijriMonthNumber,
        year: hijriYear,
    };
};

export const useHijriStore = create<HijriState>((set) => {
    const now = new Date();
    const hijriNow = getHijriDateObjectForMumbai(now);
    console.log(hijriNow, 'check h', hijriNow, 'h');

    return {
        hijriDate: hijriNow,
        gregorianDate: now,

        fetchHijriDate: async () => {
            const now = new Date();
            set({ hijriDate: getHijriDateObjectForMumbai(now), gregorianDate: now });
        },

        adjustHijriDate: (days: number) =>
            set((state) => {
                const newGregorianDate = new Date(state.gregorianDate);
                newGregorianDate.setDate(newGregorianDate.getDate() + days);
                return {
                    hijriDate: getHijriDateObjectForMumbai(newGregorianDate),
                    gregorianDate: newGregorianDate,
                };
            }),
    };
});
