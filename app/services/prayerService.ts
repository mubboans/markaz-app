import PrayTime from '../utils/praytime';   // your v3.2 file in the same folder

// ------------- CONFIGURATION -------------
const PRESET = {
    lat: 19.0760,   // Mumbai (Mumbai/Thane both inside IST)
    lng: 72.8777,
    tz: 'Asia/Kolkata',
    method: 'MWL', // or 'ISNA', 'MWL', …
};

// ------------- HELPER -------------
/**
 * Returns a Promise that resolves to:
 * {
 *   fajr, sunrise, dhuhr, asr, maghrib, isha, midnight
 * }
 * Throws if anything goes wrong (network, permission, etc.)
 */
export function getPrayerTimes(date = new Date()) {
    // 1. Calculation engine
    const calc = new PrayTime(PRESET.method);
    calc.location([PRESET.lat, PRESET.lng]);
    calc.timezone(PRESET.tz);           // Asia/Kolkata → UTC+5:30
    calc.format('24h');               // 12h, 24h, 12hNS
    // 2. Compute times for the given date
    const raw = calc.getTimes(date);    // returns full object

    // 3. Keep only the keys we need
    return {
        fajr: raw.fajr,
        sunrise: raw.sunrise,
        dhuhr: raw.dhuhr,
        asr: raw.asr,
        maghrib: raw.maghrib,
        isha: raw.isha,
        midnight: raw.midnight,
    };
}