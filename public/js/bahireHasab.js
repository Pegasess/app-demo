/**
 * Bahire Hasab (ባሕረ ሐሳብ) - Ethiopian Computus & Calendar Computation Engine
 * Authoritative implementation following the Ethiopian Orthodox Tewahedo Church canon
 * Developed originally by Abba Demetrius (12th Pope of Alexandria, 189–232 AD)
 */

(function (global) {
  'use strict';

  // Ge'ez Numeral conversion tables
  const GEEZ_ONES = ['', '፩', '፪', '፫', '፬', '፭', '፮', '፯', '፰', '፱'];
  const GEEZ_TENS = ['', '፲', '፳', '፴', '፵', '፶', '፷', '፸', '፹', '፺'];

  /**
   * Converts an integer to Ge'ez numeral string (e.g. 2017 -> ፳፻፲፯)
   * @param {number} n
   * @returns {string}
   */
  function toGeez(n) {
    if (!n || n < 1) return String(n);
    let num = Math.floor(n);
    if (num === 0) return '0';

    let result = '';
    const myriads = Math.floor(num / 10000);
    if (myriads > 0) {
      result += (myriads === 1 ? '' : toGeez(myriads)) + '፼';
      num %= 10000;
    }

    const hundreds = Math.floor(num / 100);
    if (hundreds > 0) {
      if (hundreds === 1) {
        result += '፻';
      } else {
        const tens = Math.floor(hundreds / 10);
        const ones = hundreds % 10;
        result += (GEEZ_TENS[tens] || '') + (GEEZ_ONES[ones] || '') + '፻';
      }
      num %= 100;
    }

    if (num > 0) {
      const tens = Math.floor(num / 10);
      const ones = num % 10;
      result += (GEEZ_TENS[tens] || '') + (GEEZ_ONES[ones] || '');
    }

    return result || '፩';
  }

  const MONTH_NAMES = [
    '',
    'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
    'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
  ];

  const DAYS_OF_WEEK = ['ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ', 'እሑድ'];
  const DAYS_EN = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const WENGELAWIAN = [
    { name: 'ዮሐንስ', en: 'John', isLeap: false, desc: 'ዘመነ ዮሐንስ (ፍጻሜ ዐውደ ወንጌላውያን)' },
    { name: 'ማቴዎስ', en: 'Matthew', isLeap: false, desc: 'ዘመነ ማቴዎስ (መጀመሪያ ዐውደ ወንጌላውያን)' },
    { name: 'ማርቆስ', en: 'Mark', isLeap: false, desc: 'ዘመነ ማርቆስ' },
    { name: 'ሉቃስ', en: 'Luke', isLeap: true, desc: 'ዘመነ ሉቃስ - ዘመነ ሠግር (ጳጉሜን ፮ ቀናት)' }
  ];

  /**
   * Calculates complete Bahire Hasab data for a given Ethiopian Year (ዓመተ ምሕረት)
   * @param {number} ameteMihret e.g. 2017
   */
  function calculate(ameteMihret) {
    const year = parseInt(ameteMihret, 10);
    if (isNaN(year) || year < 1) {
      throw new Error('Invalid Ethiopian Year');
    }

    // 1. Amete Alem (ዓመተ ዓለም = 5500 + ዓመተ ምሕረት)
    const ameteAlem = year + 5500;

    // 2. Wengelawi (ወንጌላዊ)
    const wengelawiIdx = ameteAlem % 4;
    const wengelawiObj = WENGELAWIAN[wengelawiIdx];
    const isLeapYear = wengelawiIdx === 3; // Luke has 6 days of Pagume

    // 3. Metene Rabiet (መጠነ ራብዒት = floor(Amete Alem / 4))
    const meteneRabiet = Math.floor(ameteAlem / 4);

    // 4. Tinte Qemer (ጥንተ ቀመር) - Starting day of Meskerem 1
    // Day index: 0: ሰኞ, 1: ማክሰኞ, 2: ረቡዕ, 3: ሐሙስ, 4: ዓርብ, 5: ቅዳሜ, 6: እሑድ
    const rDay = (ameteAlem + meteneRabiet) % 7;
    const meskerem1Day = DAYS_OF_WEEK[rDay];
    const meskerem1DayEn = DAYS_EN[rDay];

    // 5. Medeb (መደብ = Amete Alem % 19)
    const rawMedeb = ameteAlem % 19;
    const medeb = rawMedeb === 0 ? 19 : rawMedeb;

    // 6. Wenber (ወንበር = Medeb - 1)
    const wenber = rawMedeb === 0 ? 18 : rawMedeb - 1;

    // 7. Abekti (አበቅቴ = (Wenber * 11) % 30)
    const abekti = (wenber * 11) % 30;

    // 8. Metqi (መጥቅዕ = (Wenber * 19) % 30)
    const metqi = (wenber * 19) % 30;

    // 9. Day of Metqi
    const metqiMonth = metqi > 14 ? 'መስከረም' : 'ጥቅምት';
    const metqiMonthNum = metqi > 14 ? 1 : 2;
    const metqiDayOffset = metqi > 14 ? (metqi - 1) : (30 + metqi - 1);
    const metqiDayOfWeekIdx = (rDay + metqiDayOffset) % 7;
    const metqiDayOfWeek = DAYS_OF_WEEK[metqiDayOfWeekIdx];

    // 10. Day Tewsak
    // Saturday(5): 8, Sunday(6): 7, Monday(0): 6, Tuesday(1): 5, Wednesday(2): 4, Thursday(3): 3, Friday(4): 2
    const dayTewsakTable = [6, 5, 4, 3, 2, 8, 7];
    const tewsak = dayTewsakTable[metqiDayOfWeekIdx];

    // 11. Nineveh (ጾመ ነነዌ)
    const neneweSum = metqi + tewsak;
    let neneweMonth = '';
    let neneweMonthNum = 0;
    let neneweDay = 0;

    if (metqi > 14) {
      if (neneweSum > 30) {
        neneweMonth = 'የካቲት';
        neneweMonthNum = 6;
        neneweDay = neneweSum - 30;
      } else {
        neneweMonth = 'ጥር';
        neneweMonthNum = 5;
        neneweDay = neneweSum;
      }
    } else {
      neneweMonth = 'የካቲት';
      neneweMonthNum = 6;
      neneweDay = neneweSum;
    }

    // Helper to calculate feast by day offset from Nineveh
    function addDaysToNenewe(offset) {
      let m = neneweMonthNum;
      let totalDays = neneweDay + offset;
      while (totalDays > 30) {
        totalDays -= 30;
        m++;
      }
      // Calculate day of the week for this date
      // Day offset from Meskerem 1
      const daysFromNewYear = (m - 1) * 30 + (totalDays - 1);
      const dayIdx = (rDay + daysFromNewYear) % 7;

      return {
        month: MONTH_NAMES[m],
        monthNum: m,
        day: totalDays,
        dayGeez: toGeez(totalDays),
        dayOfWeek: DAYS_OF_WEEK[dayIdx],
        dayOfWeekEn: DAYS_EN[dayIdx]
      };
    }

    // Calculate Nenewe day of week
    const neneweDaysFromNewYear = (neneweMonthNum - 1) * 30 + (neneweDay - 1);
    const neneweDayOfWeekIdx = (rDay + neneweDaysFromNewYear) % 7;

    const moveableFeasts = [
      {
        id: 'nenewe',
        name: 'ጾመ ነነዌ',
        nameEn: 'Fast of Nineveh',
        meaning: 'የነነዌ ሰዎች ንስሐ የገቡበት የ፫ ቀን ጾም',
        duration: '3 ቀናት',
        tewsakOffset: 0,
        month: neneweMonth,
        monthNum: neneweMonthNum,
        day: neneweDay,
        dayGeez: toGeez(neneweDay),
        dayOfWeek: DAYS_OF_WEEK[neneweDayOfWeekIdx],
        dayOfWeekEn: DAYS_EN[neneweDayOfWeekIdx],
        type: 'ጾም'
      },
      {
        id: 'abiy_tsom',
        name: 'ዐቢይ ጾም',
        nameEn: 'Great Lent (Hudade)',
        meaning: 'ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ የጾመው ፶፭ የጾም ቀናት',
        duration: '55 ቀናት',
        tewsakOffset: 14,
        type: 'ጾም',
        ...addDaysToNenewe(14)
      },
      {
        id: 'debre_zeit',
        name: 'ደብረ ዘይት',
        nameEn: 'Debre Zeit (Mount of Olives)',
        meaning: 'የዐቢይ ጾም እኩሌታ፤ የጌታችን ዳግም ምጽአት የሚታሰብበት',
        duration: '1 ቀን',
        tewsakOffset: 41,
        type: 'በዓል',
        ...addDaysToNenewe(41)
      },
      {
        id: 'hosanna',
        name: 'ሆሣዕና',
        nameEn: 'Palm Sunday (Hosanna)',
        meaning: 'ጌታችን በአህያ ውርንጭላ ተቀምጦ ወደ ኢየሩሳሌም የገባበት',
        duration: '1 ቀን',
        tewsakOffset: 62,
        type: 'በዓል',
        ...addDaysToNenewe(62)
      },
      {
        id: 'siqlet',
        name: 'ስቅለት',
        nameEn: 'Good Friday (Siqlet)',
        meaning: 'ጌታችን በመስቀል ላይ ተሰቅሎ የዓለምን ኃጢአት ያስተሰረየበት ዕለት',
        duration: '1 ቀን',
        tewsakOffset: 67,
        type: 'ጾም',
        ...addDaysToNenewe(67)
      },
      {
        id: 'fasika',
        name: 'ትንሣኤ / ፋሲካ',
        nameEn: 'Easter (Tensae / Fasika)',
        meaning: 'ጌታችን ሞትን ድል አድርጎ የተነሣበት ታላቁ የድል በዓል',
        duration: '1 ቀን',
        tewsakOffset: 69,
        type: 'በዓል',
        ...addDaysToNenewe(69)
      },
      {
        id: 'rikbe_kahnat',
        name: 'ርክበ ካህናት',
        nameEn: 'Rikbe Kahnat',
        meaning: 'የካህናት ጉባኤና ስብሰባ የሚካሄድበት ዕለት',
        duration: '1 ቀን',
        tewsakOffset: 93,
        type: 'በዓል',
        ...addDaysToNenewe(93)
      },
      {
        id: 'erget',
        name: 'ዕርገት',
        nameEn: 'Ascension of our Lord (Erget)',
        meaning: 'ጌታችን ከትንሣኤው በ፵ኛው ቀን ወደ ሰማይ ያረገበት',
        duration: '1 ቀን',
        tewsakOffset: 108,
        type: 'በዓል',
        ...addDaysToNenewe(108)
      },
      {
        id: 'peraqlitos',
        name: 'ጰራቅሊጦስ',
        nameEn: 'Pentecost (Peraqlitos)',
        meaning: 'መንፈስ ቅዱስ በሐዋርያት ላይ የወረደበት የ፶ኛው ቀን በዓል',
        duration: '1 ቀን',
        tewsakOffset: 118,
        type: 'በዓል',
        ...addDaysToNenewe(118)
      },
      {
        id: 'tsome_hawaryat',
        name: 'ጾመ ሐዋርያት',
        nameEn: 'Fast of the Apostles',
        meaning: 'መንፈስ ቅዱስን ከተቀበሉ በኋላ ሐዋርያት የጾሙት ጾም',
        duration: 'እስከ ሐምሌ ፭',
        tewsakOffset: 119,
        type: 'ጾም',
        ...addDaysToNenewe(119)
      },
      {
        id: 'tsome_dihnet',
        name: 'ጾመ ድኅነት',
        nameEn: 'Fast of Salvation (Dihnet)',
        meaning: 'የዕለተ ረቡዕ እና ዓርብ ጾም ፍቺ በኋላ የሚጀመርበት',
        duration: 'ቀጣይ ረቡዕ',
        tewsakOffset: 121,
        type: 'ጾም',
        ...addDaysToNenewe(121)
      }
    ];

    // Fixed Feasts and Fasts
    const fixedFeasts = [
      {
        name: 'ርእሰ ዐውደ ዓመት (እንቁጣጣሽ)',
        nameEn: 'Enkutatash (Ethiopian New Year)',
        month: 'መስከረም',
        day: 1,
        dayGeez: '፩',
        type: 'በዓል',
        desc: 'የአዲሱ ዓመት መጀመሪያ'
      },
      {
        name: 'በዓለ መስቀል',
        nameEn: 'Finding of the True Cross (Meskel)',
        month: 'መስከረም',
        day: 17,
        dayGeez: '፲፯',
        type: 'በዓል',
        desc: 'ንግሥት ዕሌኒ እውነተኛውን መስቀል ያገኘችበት'
      },
      {
        name: 'ጾመ ነቢያት (የገና ጾም)',
        nameEn: 'Fast of the Prophets',
        month: 'ኅዳር',
        day: 16,
        dayGeez: '፲፮',
        type: 'ጾም',
        desc: 'እስከ ታኅሣሥ ፳፰ ቀን የሚቆይ የ፵፫ ቀናት ጾም'
      },
      {
        name: 'በዓለ ልደት (ገና)',
        nameEn: 'Christmas (Genna)',
        month: 'ታኅሣሥ',
        day: isLeapYear ? 28 : 29,
        dayGeez: isLeapYear ? '፳፰' : '፳፱',
        type: 'በዓል',
        desc: 'የጌታችን የመድኃኒታችን የኢየሱስ ክርስቶስ የልደት በዓል'
      },
      {
        name: 'በዓለ ጥምቀት',
        nameEn: 'Epiphany (Timket)',
        month: 'ጥር',
        day: 11,
        dayGeez: '፲፩',
        type: 'በዓል',
        desc: 'ጌታችን በዮርዳኖስ ወንዝ በዮሐንስ እጅ የተጠመቀበት'
      },
      {
        name: 'ቃና ዘገሊላ',
        nameEn: 'Kana ZeGelila',
        month: 'ጥር',
        day: 12,
        dayGeez: '፲፪',
        type: 'በዓል',
        desc: 'ጌታችን ውኃውን ወደ ወይን የለወጠበት ተአምር'
      },
      {
        name: 'ጾመ ፍልሰታ',
        nameEn: 'Fast of Filseta (Assumption)',
        month: 'ነሐሴ',
        day: 1,
        dayGeez: '፩',
        type: 'ጾም',
        desc: 'የእመቤታችን የቅድስት ድንግል ማርያም የፍልሰታ ጾም (፲፮ ቀናት)'
      },
      {
        name: 'ደብረ ታቦር (ቡሄ)',
        nameEn: 'Transfiguration (Debre Tabor / Buhe)',
        month: 'ነሐሴ',
        day: 13,
        dayGeez: '፲፫',
        type: 'በዓል',
        desc: 'ጌታችን በደብረ ታቦር ተራራ ክብሩን የገለጠበት'
      }
    ];

    return {
      year,
      yearGeez: toGeez(year),
      ameteAlem,
      ameteAlemGeez: toGeez(ameteAlem),
      wengelawi: wengelawiObj.name,
      wengelawiEn: wengelawiObj.en,
      wengelawiDesc: wengelawiObj.desc,
      isLeapYear,
      meteneRabiet,
      meteneRabietGeez: toGeez(meteneRabiet),
      meskerem1Day,
      meskerem1DayEn,
      medeb,
      medebGeez: toGeez(medeb),
      wenber,
      wenberGeez: toGeez(wenber),
      abekti,
      abektiGeez: toGeez(abekti),
      metqi,
      metqiGeez: toGeez(metqi),
      metqiMonth,
      metqiDayOfWeek,
      tewsak,
      nenewe: {
        month: neneweMonth,
        day: neneweDay,
        dayGeez: toGeez(neneweDay),
        dayOfWeek: DAYS_OF_WEEK[neneweDayOfWeekIdx]
      },
      moveableFeasts,
      fixedFeasts
    };
  }

  // Export
  const BahireHasab = {
    toGeez,
    calculate,
    MONTH_NAMES,
    DAYS_OF_WEEK,
    DAYS_EN
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = BahireHasab;
  } else {
    global.BahireHasab = BahireHasab;
  }
})(typeof window !== 'undefined' ? window : globalThis);
