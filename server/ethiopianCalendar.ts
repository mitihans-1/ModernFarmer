/**
 * Ethiopian Calendar (Ge'ez Calendar) Converter
 * Converts Gregorian dates to Ethiopian Calendar (E.C.) and provides
 * month names in Amharic, Afaan Oromo, Tigrinya, and English.
 */

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
  monthNameAm: string;
  monthNameOm: string;
  monthNameTi: string;
  monthNameEn: string;
  formattedAm: string;
  formattedOm: string;
  formattedTi: string;
  formattedEn: string;
}

const MONTHS = [
  { am: 'መስከረም', om: 'Fuulbana', ti: 'መስከረም', en: 'Meskerem' }, // 1
  { am: 'ጥቅምት', om: 'Onkololeessa', ti: 'ጥቅምቲ', en: 'Tikimt' },     // 2
  { am: 'ኅዳር', om: 'Sadaasa', ti: 'ሕዳር', en: 'Hidar' },         // 3
  { am: 'ታኅሣሥ', om: 'Muddee', ti: 'ታሕሳስ', en: 'Tahsas' },        // 4
  { am: 'ጥር', om: 'Amajjii', ti: 'ጥሪ', en: 'Tir' },             // 5
  { am: 'የካቲት', om: 'Guraandhala', ti: 'የካቲት', en: 'Yekatit' }, // 6
  { am: 'መጋቢት', om: 'Bitootessa', ti: 'መጋቢት', en: 'Megabit' },  // 7
  { am: 'ሚያዝያ', om: 'Ebla', ti: 'ሚያዝያ', en: 'Miazia' },        // 8
  { am: 'ግንቦት', om: 'Caamsaa', ti: 'ግንቦት', en: 'Ginbot' },      // 9
  { am: 'ሰኔ', om: 'Waxabajjii', ti: 'ሰነ', en: 'Sene' },          // 10
  { am: 'ሐምሌ', om: 'Adooleessa', ti: 'ሓምለ', en: 'Hamle' },       // 11
  { am: 'ነሐሴ', om: 'Hagayya', ti: 'ነሓሰ', en: 'Nehase' },        // 12
  { am: 'ጳጉሜ', om: 'Qaammee', ti: 'ጳጉሜን', en: 'Pagume' },        // 13
];

/**
 * Approximate conversion from Gregorian date to Ethiopian date.
 * Ethiopian New Year (Meskerem 1) falls on Sep 11 (or Sep 12 in leap year).
 */
export function gregorianToEthiopian(date: Date = new Date()): EthiopianDate {
  const gYear = date.getFullYear();
  const gMonth = date.getMonth() + 1; // 1-12
  const gDay = date.getDate();

  // Determine if Gregorian year is leap
  const isGregorianLeap = (gYear % 4 === 0 && gYear % 100 !== 0) || (gYear % 400 === 0);
  const newYearDay = isGregorianLeap ? 12 : 11;

  let ethYear: number;
  let ethMonth: number;
  let ethDay: number;

  // Before September new year
  if (gMonth < 9 || (gMonth === 9 && gDay < newYearDay)) {
    ethYear = gYear - 8;
  } else {
    ethYear = gYear - 7;
  }

  // Calculate day difference from Sep 11/12
  const newYearDate = new Date(gMonth < 9 || (gMonth === 9 && gDay < newYearDay) ? gYear - 1 : gYear, 8, newYearDay);
  const diffTime = date.getTime() - newYearDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays >= 0 && diffDays < 360) {
    ethMonth = Math.floor(diffDays / 30) + 1;
    ethDay = (diffDays % 30) + 1;
  } else if (diffDays >= 360) {
    ethMonth = 13;
    ethDay = diffDays - 359;
  } else {
    // Fallback safe calculation
    ethMonth = 1;
    ethDay = 1;
  }

  const mInfo = MONTHS[Math.min(Math.max(ethMonth - 1, 0), 12)];

  return {
    year: ethYear,
    month: ethMonth,
    day: ethDay,
    monthNameAm: mInfo.am,
    monthNameOm: mInfo.om,
    monthNameTi: mInfo.ti,
    monthNameEn: mInfo.en,
    formattedAm: `${mInfo.am} ${ethDay}፣ ${ethYear} ዓ.ም`,
    formattedOm: `${mInfo.om} ${ethDay}, ${ethYear} A.L.I`,
    formattedTi: `${mInfo.ti} ${ethDay}፣ ${ethYear} ዓ.ም`,
    formattedEn: `${mInfo.en} ${ethDay}, ${ethYear} E.C.`,
  };
}
