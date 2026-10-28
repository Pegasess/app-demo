/**
 * Client API Client for Bahire Hasab Web App
 * Communicates with Node.js/SQLite backend with robust LocalStorage/offline fallback.
 */

const Api = (function () {
  'use strict';

  const LS_USERS = 'bh_offline_users';
  const LS_CONTENTS = 'bh_offline_contents';
  const LS_MESSAGES = 'bh_offline_messages';
  const LS_LOGS = 'bh_offline_logs';

  function getStorage(key, defaultVal) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  }

  function setStorage(key, val) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {}
  }

  function logOfflineActivity(type, details, user = 'user') {
    const logs = getStorage(LS_LOGS, []);
    logs.unshift({
      id: logs.length + 1,
      event_type: type,
      details,
      user_identifier: user,
      created_at: new Date().toLocaleTimeString('en-US', { hour12: false })
    });
    setStorage(LS_LOGS, logs.slice(0, 50));
  }

  // Pre-seed offline users & contents if empty
  if (!localStorage.getItem(LS_USERS)) {
    setStorage(LS_USERS, [
      { id: 1, unique_id: '1234', name: 'john_den', phone: '+251911223344', email: 'john@ethiopia.org', avatar: 'assets/avatars/avatar-1.jpg', role: 'user', is_guest: 0, created_at: '2026-10-28' },
      { id: 2, unique_id: '1001', name: 'yared (አስተዳዳሪ)', phone: '+251966462684', email: 'bahirehasab27@gmail.com', avatar: 'assets/avatars/avatar-3.jpg', role: 'admin', is_guest: 0, created_at: '2026-10-28' },
      { id: 3, unique_id: 'G901', name: 'እንግዳ ተጠቃሚ', phone: 'N/A', email: '', avatar: 'assets/avatars/avatar-default.svg', role: 'guest', is_guest: 1, created_at: '2026-10-28' }
    ]);
  }

  if (!localStorage.getItem(LS_CONTENTS)) {
    setStorage(LS_CONTENTS, [
      {
        id: 1,
        category: 'history',
        title: 'የባሕረ ሐሳብ ታሪካዊ አመጣጥ እና የቅዱስ ድሜጥሮስ ድርሰት',
        author: 'አባ ድሜጥሮስ ሊቀ ጳጳሳት',
        summary: 'ባሕረ ሐሳብ ማለት የሐሳብ ባሕር ማለት ሲሆን፡ በ፲፪ኛው የእስክንድርያ ፓትርያርክ በአባ ድሜጥሮስ መንፈሳዊ ጥበብ የተዘጋጀ የዘመን እና የአጽዋማት ስሌት ነው።',
        body: `ባሕረ ሐሳብ ሁለት ቃላት ተጣምረው የተፈጠሩ ሲሆን «ባሕር» እና «ሐሳብ» ማለት ነው። ትርጉሙም የቁጥር፣ የስሌት ወይም የምርምር ባሕር እንደማለት ነው። 

ይህንን ድንቅ የቀመር ስሌት ያዘጋጀው በ፪ኛው መቶ ክፍለ ዘመን (189–232 ዓ.ም) የነበረው ፲፪ኛው የእስክንድርያ ሊቀ ጳጳሳት ቅዱስ ድሜጥሮስ ነው። ቅዱስ ድሜጥሮስ ከመሾሙ በፊት ያልተማረ ተራ ገበሬ የነበረ ቢሆንም፡ እግዚአብሔር በገለጸለት መንፈሳዊ ጥበብ የፀሐይን፣ የጨረቃንና የከዋክብትን ዑደት በማጥናት በዓለ ትንሣኤና አጽዋማት በየዓመቱ የሚውሉበትን ቀመር አዘጋጅቷል።

በ፫፻፳፭ (325) ዓ.ም በኒቂያ የተሰበሰቡት ፫፻፲፰ቱ (318ቱ) ሊቃውንት የቅዱስ ድሜጥሮስን ባሕረ ሐሳብ መርምረው በመቀበል በዓለም አብያተ ክርስቲያናት ሁሉ እንዲሠራበት አጽድቀውታል።`
      },
      {
        id: 2,
        category: 'theology',
        title: 'ዓመተ ዓለም እና ፭ ሺሕ ፭ መቶ ዘመን (5500 ዓመታት)',
        author: 'የሊቃውንት ጉባኤ',
        summary: 'ዓመተ ዓለም ማለት ከስነ ፍጥረት መጀመሪያ ከአዳም ጀምሮ እስከ ዛሬ ድረስ ያለው አጠቃላይ የዓመታት ድምር ነው።',
        body: `በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ትውፊት መሠረት፡ አዳም ከተፈጠረበት ጊዜ ጀምሮ ጌታችን መድኃኒታችን ኢየሱስ ክርስቶስ በድንግል ማርያም ማኅፀን እስከ ተፀነሰበት ዕለት ድረስ ያለው ጊዜ ፭ ሺሕ ፭ መቶ (5500) ዓመታት ነው።

ስለሆነም የዓመተ ዓለም ስሌት፡
ዓመተ ዓለም = 5500 + ዓመተ ምሕረት ይሆናል።
ለምሳሌ ለ 2017 ዓ.ም፦ 5500 + 2017 = 7517 ዓመተ ዓለም ይሆናል።`
      },
      {
        id: 3,
        category: 'calendar',
        title: 'የአራቱ ወንጌላውያን ዐውደ ዘመን (ማቴዎስ፣ ማርቆስ፣ ሉቃስ፣ ዮሐንስ)',
        author: 'የቀኖና መምሪያ',
        summary: 'በኢትዮጵያ ዘመን አቆጣጠር እያንዳንዱ ዓመት በአራቱ ወንጌላውያን ስም ይሰየማል፤ በየአራት ዓመቱ አንዴ ዘመነ ሉቃስ ሲመጣ ጳጉሜን ፮ ቀናት ትሆናለች።',
        body: `የኢትዮጵያ የቀን መቁጠሪያ በየ ፬ ዓመቱ በሚሽከረከር የወንጌላውያን ዑደት ይመራል።
የወንጌላውያኑ ቅደም ተከተል፦
፩. ዘመነ ማቴዎስ (1)
፪. ዘመነ ማርቆስ (2)
፫. ዘመነ ሉቃስ (3 - ዘመነ ሠግር / Leap Year)
፬. ዘመነ ዮሐንስ (4 ወይም 0)`
      }
    ]);
  }

  async function request(url, options = {}) {
    try {
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        },
        ...options
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Request failed (${res.status})`);
      }
      return data;
    } catch (err) {
      console.info('Server fetch offline, using client storage:', err.message);
      return null;
    }
  }

  function generateUniqueId(isGuest = false) {
    const prefix = isGuest ? 'G' : '';
    const num = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}${num}`;
  }

  return {
    async register(name, phone, email, avatar) {
      const netRes = await request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, phone, email, avatar })
      });
      if (netRes) return netRes;

      const users = getStorage(LS_USERS, []);
      let user = users.find(u => u.phone === phone);
      if (!user) {
        user = {
          id: users.length + 1,
          unique_id: generateUniqueId(false),
          name,
          phone,
          email: email || '',
          avatar: avatar || 'assets/avatars/avatar-1.jpg',
          role: 'user',
          is_guest: 0,
          created_at: new Date().toISOString()
        };
        users.push(user);
        setStorage(LS_USERS, users);
      }
      logOfflineActivity('user_register', `New user registered: ${name}`, user.unique_id);
      return { success: true, user, message: 'አካውንትዎ በተሳካ ሁኔታ ተፈጥሯል' };
    },

    async login(name, phone) {
      const netRes = await request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ name, phone })
      });
      if (netRes) return netRes;

      const users = getStorage(LS_USERS, []);
      let user = users.find(u => u.phone === phone || u.name.toLowerCase() === name.toLowerCase());
      if (!user) {
        user = {
          id: users.length + 1,
          unique_id: generateUniqueId(false),
          name,
          phone,
          email: '',
          avatar: 'assets/avatars/avatar-1.jpg',
          role: 'user',
          is_guest: 0,
          created_at: new Date().toISOString()
        };
        users.push(user);
        setStorage(LS_USERS, users);
      }
      logOfflineActivity('user_login', `User logged in: ${name}`, user.unique_id);
      return { success: true, user, message: 'እንኳን ደህና መጡ!' };
    },

    async loginGuest() {
      const netRes = await request('/api/auth/guest', { method: 'POST' });
      if (netRes) return netRes;

      const uniqueId = generateUniqueId(true);
      const guest = {
        id: Date.now(),
        unique_id: uniqueId,
        name: `እንግዳ_${uniqueId}`,
        phone: 'N/A',
        email: '',
        avatar: 'assets/avatars/avatar-default.svg',
        role: 'guest',
        is_guest: 1
      };
      const users = getStorage(LS_USERS, []);
      users.push(guest);
      setStorage(LS_USERS, users);
      logOfflineActivity('guest_login', `Guest entered: ${guest.name}`, uniqueId);
      return { success: true, user: guest, message: 'እንደ እንግዳ ሆነው ገብተዋል' };
    },

    // Admin Authentication with strict credentials: yared / yared2442
    async adminLogin(username, password) {
      const netRes = await request('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      if (netRes) return netRes;

      // Offline check
      if (username === 'yared' && password === 'yared2442') {
        logOfflineActivity('admin_login_success', 'Admin yared logged in', 'yared');
        return {
          success: true,
          user: {
            name: 'yared (አስተዳዳሪ)',
            username: 'yared',
            role: 'admin',
            email: 'bahirehasab27@gmail.com',
            phone: '+251966462684'
          },
          message: 'እንኳን ደህና መጡ አስተዳዳሪ ያሬድ!'
        };
      } else {
        logOfflineActivity('admin_login_failed', `Failed login attempt for ${username}`, username);
        throw new Error('የተሳሳተ የተጠቃሚ ስም ወይም የይለፍ ቃል! (Invalid username or password)');
      }
    },

    async updateProfile(profileData) {
      const netRes = await request('/api/user/profile', {
        method: 'POST',
        body: JSON.stringify(profileData)
      });
      if (netRes) return netRes;

      const users = getStorage(LS_USERS, []);
      const idx = users.findIndex(u => u.unique_id === profileData.unique_id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...profileData };
        setStorage(LS_USERS, users);
        return { success: true, user: users[idx] };
      }
      return { success: false, message: 'User not found' };
    },

    async getBahireHasab(year, userId) {
      const netRes = await request(`/api/bahire-hasab?year=${year}&userId=${userId || ''}`);
      if (netRes) return netRes;

      if (typeof BahireHasab !== 'undefined') {
        const data = BahireHasab.calculate(year);
        logOfflineActivity('calculation_query', `Calculated year ${year}`, userId || 'anonymous');
        return { success: true, data };
      }
      return { success: false, message: 'Bahire Hasab engine unavailable' };
    },

    async getCalendar(year, month) {
      const netRes = await request(`/api/calendar?year=${year}&month=${month}`);
      if (netRes) return netRes;

      if (typeof EthiopianCalendar !== 'undefined') {
        const today = EthiopianCalendar.getToday();
        const cal = EthiopianCalendar.getMonthCalendar(year, month);
        return { success: true, today, calendar: cal };
      }
      return { success: false, message: 'Calendar engine unavailable' };
    },

    async sendContact(contactData) {
      const netRes = await request('/api/contact', {
        method: 'POST',
        body: JSON.stringify(contactData)
      });
      if (netRes) return netRes;

      const messages = getStorage(LS_MESSAGES, []);
      messages.unshift({
        id: messages.length + 1,
        ...contactData,
        recipient_email: 'bahirehasab27@gmail.com',
        created_at: new Date().toISOString()
      });
      setStorage(LS_MESSAGES, messages);
      logOfflineActivity('contact_message', `Message sent to bahirehasab27@gmail.com from ${contactData.name}`, contactData.email || contactData.phone);
      
      const mailtoUrl = `mailto:bahirehasab27@gmail.com?subject=${encodeURIComponent(contactData.subject || 'መልእክት')}&body=${encodeURIComponent(`ስም፡ ${contactData.name}\nስልክ፡ ${contactData.phone}\nኢሜይል፡ ${contactData.email}\n\nመልእክት፡\n${contactData.message}`)}`;

      return {
        success: true,
        message: 'መልእክትዎ ወደ bahirehasab27@gmail.com ተልኳል፤ እናመሰግናለን!',
        recipient: 'bahirehasab27@gmail.com',
        mailtoUrl
      };
    },

    async getAdminStats() {
      const netRes = await request('/api/admin/stats');
      if (netRes) return netRes;

      const users = getStorage(LS_USERS, []);
      const contents = getStorage(LS_CONTENTS, []);
      const messages = getStorage(LS_MESSAGES, []);
      const logs = getStorage(LS_LOGS, []);

      return {
        success: true,
        stats: {
          totalUsers: users.filter(u => !u.is_guest).length,
          totalGuests: users.filter(u => u.is_guest).length,
          totalArticles: contents.length,
          totalMessages: messages.length,
          totalLogs: logs.length
        },
        recentLogs: logs.slice(0, 20)
      };
    },

    async getAdminUsers() {
      const netRes = await request('/api/admin/users');
      if (netRes) return netRes;
      return { success: true, users: getStorage(LS_USERS, []) };
    },

    async deleteUser(id) {
      const netRes = await request(`/api/admin/users?id=${id}`, { method: 'DELETE' });
      if (netRes) return netRes;
      let users = getStorage(LS_USERS, []);
      users = users.filter(u => u.id !== id);
      setStorage(LS_USERS, users);
      return { success: true };
    },

    async getAdminContents() {
      const netRes = await request('/api/admin/contents');
      if (netRes) return netRes;
      return { success: true, contents: getStorage(LS_CONTENTS, []) };
    },

    async createContent(contentData) {
      const netRes = await request('/api/admin/contents', {
        method: 'POST',
        body: JSON.stringify(contentData)
      });
      if (netRes) return netRes;
      const contents = getStorage(LS_CONTENTS, []);
      contents.unshift({ id: contents.length + 1, ...contentData, created_at: new Date().toISOString() });
      setStorage(LS_CONTENTS, contents);
      return { success: true };
    },

    async deleteContent(id) {
      const netRes = await request(`/api/admin/contents?id=${id}`, { method: 'DELETE' });
      if (netRes) return netRes;
      let contents = getStorage(LS_CONTENTS, []);
      contents = contents.filter(c => c.id !== id);
      setStorage(LS_CONTENTS, contents);
      return { success: true };
    },

    async getAdminMessages() {
      const netRes = await request('/api/admin/messages');
      if (netRes) return netRes;
      return { success: true, messages: getStorage(LS_MESSAGES, []) };
    },

    async deleteMessage(id) {
      const netRes = await request(`/api/admin/messages?id=${id}`, { method: 'DELETE' });
      if (netRes) return netRes;
      let msgs = getStorage(LS_MESSAGES, []);
      msgs = msgs.filter(m => m.id !== id);
      setStorage(LS_MESSAGES, msgs);
      return { success: true };
    }
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Api;
}
