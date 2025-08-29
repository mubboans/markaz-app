console.log('hijri compiled');
const hijriSafe = require('hijri-date/lib/safe');
export const HijriDate = hijriSafe.default;
export const toHijri = hijriSafe.toHijri;

// const HDate = new HijriDate();
// console.log(HDate,'HDate');
// export default HDate;
