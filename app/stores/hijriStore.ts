import { create } from '@/utils/store';

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

/**
 * Calculates the Hijri date for the specified Gregorian date and returns it as an object.
 * A manual offset is applied to align with local (Mumbai/India) observances.
 *
 * @param {Date} gregorianDate - The Gregorian date to convert.
 * @returns {HijriDateObj} The Hijri date in the format { day, month, year }.
 */
const getHijriDateObjectForMumbai = (gregorianDate: Date): HijriDateObj => {
    // A consistent offset can be manually configured here.
    // This value may need to be updated periodically from a reliable local source.
    const dateOffsetDays = -1; // Adjust this value as needed

    const adjustedDate = new Date(gregorianDate);
    adjustedDate.setDate(gregorianDate.getDate() + dateOffsetDays);

    // Fix 1: Use `as const` to enforce specific string literal types for `options`.
    const options = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        calendar: 'islamic-umalqura',
    } as const;

    const hijriParts = new Intl.DateTimeFormat('en-US', options).formatToParts(adjustedDate);

    // Fix 2: Add checks for potentially undefined values returned by `find`.
    const dayPart = hijriParts.find(part => part.type === 'day');
    const monthPart = hijriParts.find(part => part.type === 'month');
    const yearPart = hijriParts.find(part => part.type === 'year');

    if (!dayPart || !monthPart || !yearPart) {
        throw new Error("Could not format Hijri date parts.");
    }

    const hijriDay = parseInt(dayPart.value, 10);
    const hijriMonthNumber = parseInt(monthPart.value, 10);
    const hijriYear = parseInt(yearPart.value, 10);

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
