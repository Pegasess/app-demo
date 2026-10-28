/**
 * Ethiopian Calendar (የኢትዮጵያ የቀን መቁጠሪያ)
 * Highly accurate Ethiopian <-> Gregorian converter, monthly calendar builder,
 * and daily Orthodox commemorative saint days (የዕለቱ ጽላት / ታቦት).
 */

(function (global) {
  'use strict';

  // Ethiopian months
  const MONTHS_ETH = [
    '',
    'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
    'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
  ];

  const MONTHS_ETH_EN = [
    '',
    'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
    'Megabit', 'Miyazya', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume'
  ];

  const DAYS_ETH = ['ሰኞ', 'ማክሰኞ', 'ረቡዕ', 'ሐሙስ', 'ዓርብ', 'ቅዳሜ', 'እሑድ'];
  const DAYS_ETH_EN = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Orthodox commemorative saint/holy day for each day of the Ethiopian month (1 - 30)
  const DAILY_COMMEMORATIONS = {
    1: { name: 'ልደታ ለማርያም', en: 'Nativity of the Virgin Mary', tag: 'ቅድስት ድንግል ማርያም' },
    2: { name: 'ታዴዎስ ሐዋርያ', en: 'Apostle Thaddaeus', tag: 'ሐዋርያ' },
    3: { name: 'በዓታ ለማርያም', en: 'Entrance of Mary into the Temple', tag: 'የእመቤታችን በዓል' },
    4: { name: 'ዮሐንስ ወልደ ነጐድጓድ', en: 'John the Apostle', tag: 'ሐዋርያ' },
    5: { name: 'ጴጥሮስ ወጳውሎስ / አቡነ ገብረ መንፈስ ቅዱስ', en: 'Peter, Paul & Gebre Menfes Qidus', tag: 'ጻድቅ' },
    6: { name: 'ኢየሱስ ክርስቶስ (ቁስቋም)', en: 'Jesus Christ / Qusqwam', tag: 'በዓለ እግዚእ' },
    7: { name: 'ቅድስት ሥላሴ', en: 'Holy Trinity (Selassie)', tag: 'ሥላሴ' },
    8: { name: 'አባ ኪሮስ / ዮልያኖስ', en: 'Abba Kiros / Julian', tag: 'ጻድቅ' },
    9: { name: 'ቶማስ ሐዋርያ', en: 'Apostle Thomas', tag: 'ሐዋርያ' },
    10: { name: 'መስቀለ ክርስቶስ', en: 'The Holy Cross', tag: 'መስቀል' },
    11: { name: 'ሐና ወኢያቄም', en: 'Joachim and Anne', tag: 'ጻድቃን' },
    12: { name: 'ቅዱስ ሚካኤል ሊቀ መላእክት', en: 'St. Michael the Archangel', tag: 'ሊቀ መላእክት' },
    13: { name: 'ቅዱስ ሩፋኤል / እግዚአብሔር አብ', en: 'St. Rufael / God the Father', tag: 'መላእክት' },
    14: { name: 'አባ አረጋዊ / ድሜጥሮስ', en: 'Abba Aregawi / Demetrius', tag: 'ተስዓቱ ቅዱሳን' },
    15: { name: 'ቅዱስ ቂርቆስና ኢየሉጣ', en: 'St. Qirqos & Julitta', tag: 'ሰማዕት' },
    16: { name: 'ኪዳነ ምሕረት', en: 'Covenant of Mercy (Kidane Mihret)', tag: 'የእመቤታችን በዓል' },
    17: { name: 'ቅዱስ እስጢፋኖስ / አባ ገሪማ', en: 'St. Stephen / Abba Gerima', tag: 'ቀዳሜ ሰማዕት' },
    18: { name: 'ፊልጶስ ሐዋርያ / ኤዎስጣቴዎስ', en: 'Philip the Apostle / Ewostatewos', tag: 'ጻድቅ' },
    19: { name: 'ቅዱስ ገብርኤል ሊቀ መላእክት', en: 'St. Gabriel the Archangel', tag: 'ሊቀ መላእክት' },
    20: { name: 'ሕንፀተ ቤተክርስቲያን', en: 'Dedication of the Church', tag: 'በዓለ ቤተክርስቲያን' },
    21: { name: 'ቅድስት ድንግል ማርያም', en: 'Holy Virgin Mary', tag: 'የእመቤታችን በዓል' },
    22: { name: 'ቅዱስ ዑራኤል / ደቅስዮስ', en: 'St. Uriel the Archangel / Deqsios', tag: 'መላእክት' },
    23: { name: 'ቅዱስ ጊዮርጊስ ሰማዕት', en: 'St. George the Martyr', tag: 'ሰማዕት' },
    24: { name: 'አቡነ ተክለ ሃይማኖት', en: 'Abuna Tekle Haymanot', tag: 'ጻድቅ' },
    25: { name: 'ቅዱስ መርቆሬዎስ ሰማዕት', en: 'St. Mercurius the Martyr', tag: 'ሰማዕት' },
    26: { name: 'አቡነ ሐብተ ማርያም / ቶማስ', en: 'Abuna Habte Maryam', tag: 'ጻድቅ' },
    27: { name: 'መድኃኔዓለም ክርስቶስ', en: 'Savior of the World (Medhane Alem)', tag: 'በዓለ እግዚእ' },
    28: { name: 'አማኑኤል / አብርሃም ይስሐቅ ያዕቆብ', en: 'Emmanuel', tag: 'በዓለ እግዚእ' },
    29: { name: 'በዓለ ወልድ / ቅዱስ ጴጥሮስ', en: 'Ba\'ale Wold (The Incarnation)', tag: 'በዓለ እግዚእ' },
    30: { name: 'ቅዱስ ማርቆስ ወንጌላዊ', en: 'St. Mark the Evangelist', tag: 'ወንጌላዊ' }
  };

  const JD_EPOCH_OFFSET = 1724221;

  /**
   * Converts Gregorian date to Julian Day Number (JDN)
   */
  function gregorianToJdn(year, month, day) {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return (
      day +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045
    );
  }

  /**
   * Converts JDN to Gregorian date { year, month, day }
   */
  function jdnToGregorian(jdn) {
    let a = jdn + 32044;
    let b = Math.floor((4 * a + 3) / 146097);
    let c = a - Math.floor((146097 * b) / 4);
    let d = Math.floor((4 * c + 3) / 1461);
    let e = c - Math.floor((1461 * d) / 4);
    let m = Math.floor((5 * e + 2) / 153);
    let day = e - Math.floor((153 * m + 2) / 5) + 1;
    let month = m + 3 - 12 * Math.floor(m / 10);
    let year = 100 * b + d - 4800 + Math.floor(m / 10);
    return { year, month, day };
  }

  /**
   * Converts Ethiopian date to JDN
   */
  function ethiopianToJdn(year, month, day) {
    return (
      JD_EPOCH_OFFSET +
      365 * (year - 1) +
      Math.floor(year / 4) +
      30 * (month - 1) +
      day -
      1
    );
  }

  /**
   * Converts JDN to Ethiopian date { year, month, day }
   */
  function jdnToEthiopian(jdn) {
    const r = (jdn - JD_EPOCH_OFFSET) % 1461;
    const n = (r % 365) + 365 * Math.floor(r / 1460);
    const year = 4 * Math.floor((jdn - JD_EPOCH_OFFSET) / 1461) + Math.floor(r / 365) - Math.floor(r / 1460) + 1;
    const month = Math.floor(n / 30) + 1;
    const day = (n % 30) + 1;
    return { year, month, day };
  }

  /**
   * Converts Gregorian date to Ethiopian date
   */
  function toEthiopian(gregYear, gregMonth, gregDay) {
    const jdn = gregorianToJdn(gregYear, gregMonth, gregDay);
    return jdnToEthiopian(jdn);
  }

  /**
   * Converts Ethiopian date to Gregorian date
   */
  function toGregorian(ethYear, ethMonth, ethDay) {
    const jdn = ethiopianToJdn(ethYear, ethMonth, ethDay);
    return jdnToGregorian(jdn);
  }

  /**
   * Returns today's date in both Ethiopian and Gregorian calendars
   */
  function getToday() {
    const now = new Date();
    const gYear = now.getFullYear();
    const gMonth = now.getMonth() + 1;
    const gDay = now.getDate();

    const eth = toEthiopian(gYear, gMonth, gDay);
    const jdn = gregorianToJdn(gYear, gMonth, gDay);
    // Day of week (0 = Monday, 6 = Sunday)
    const dayOfWeek = (jdn % 7); // JDN % 7: 0 is Monday

    return {
      ethiopian: {
        year: eth.year,
        month: eth.month,
        monthName: MONTHS_ETH[eth.month],
        monthNameEn: MONTHS_ETH_EN[eth.month],
        day: eth.day,
        dayOfWeek: DAYS_ETH[dayOfWeek],
        dayOfWeekEn: DAYS_ETH_EN[dayOfWeek],
        commemoration: DAILY_COMMEMORATIONS[eth.day] || null
      },
      gregorian: {
        year: gYear,
        month: gMonth,
        day: gDay,
        formatted: `${gYear}-${String(gMonth).padStart(2, '0')}-${String(gDay).padStart(2, '0')}`
      }
    };
  }

  /**
   * Generates calendar grid for a specific Ethiopian month and year
   * @param {number} ethYear e.g. 2017
   * @param {number} ethMonth 1 to 13
   */
  function getMonthCalendar(ethYear, ethMonth) {
    const isLeap = (ethYear % 4 === 3); // Luke year has 6 Pagume days
    const daysInMonth = (ethMonth === 13) ? (isLeap ? 6 : 5) : 30;

    // Day of week for 1st of this month
    const firstJdn = ethiopianToJdn(ethYear, ethMonth, 1);
    const startDayOfWeek = (firstJdn % 7); // 0 = Mon, 6 = Sun

    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const jdn = ethiopianToJdn(ethYear, ethMonth, d);
      const greg = jdnToGregorian(jdn);
      const dow = (jdn % 7);
      const isFastDay = (dow === 2 || dow === 4); // Wednesday or Friday

      days.push({
        day: d,
        dayOfWeek: dow,
        dayOfWeekEth: DAYS_ETH[dow],
        gregorian: greg,
        gregorianFormatted: `${greg.month}/${greg.day}`,
        commemoration: DAILY_COMMEMORATIONS[d] || null,
        isFastDay
      });
    }

    return {
      year: ethYear,
      month: ethMonth,
      monthName: MONTHS_ETH[ethMonth],
      monthNameEn: MONTHS_ETH_EN[ethMonth],
      isLeap,
      daysInMonth,
      startDayOfWeek,
      days
    };
  }

  const EthiopianCalendar = {
    MONTHS_ETH,
    MONTHS_ETH_EN,
    DAYS_ETH,
    DAYS_ETH_EN,
    DAILY_COMMEMORATIONS,
    toEthiopian,
    toGregorian,
    getToday,
    getMonthCalendar
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = EthiopianCalendar;
  } else {
    global.EthiopianCalendar = EthiopianCalendar;
  }
})(typeof window !== 'undefined' ? window : globalThis);
