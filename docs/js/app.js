/**
 * Bahire Hasab Web App - Main Application Logic
 * Integrates BahireHasab computations, Ethiopian Calendar,
 * SQLite API backend, responsive UI, celestial animations, and Admin Portal.
 */

(function () {
  'use strict';

  // Application State
  const state = {
    user: null,                  // { id, unique_id, name, phone, email, avatar, role, is_guest }
    isAdminAuthenticated: false,  // Track admin session (yared / yared2442)
    adminUser: null,
    currentYear: 2017,           // Default Ethiopian Year
    calYear: 2017,
    calMonth: 1,
    activePage: 'home',
    bahireHasabData: null,
    calendarData: null,
    adminStats: null,
    selectedAvatar: '/assets/avatars/avatar-1.jpg'
  };

  // Toast notification helper
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // --------------------------------------------------------------------------
  // 1. INITIALIZATION & CELESTIAL SPLASH SCREEN ANIMATION
  // --------------------------------------------------------------------------
  function initApp() {
    // 1. Determine Current Ethiopian Year
    try {
      const today = EthiopianCalendar.getToday();
      state.currentYear = today.ethiopian.year || 2017;
      state.calYear = today.ethiopian.year || 2017;
      state.calMonth = today.ethiopian.month || 2;

      const todayEl = document.getElementById('today-display');
      if (todayEl) {
        todayEl.textContent = `${today.ethiopian.monthName} ${today.ethiopian.day} ቀን ${state.currentYear} ዓ.ም (${today.ethiopian.dayOfWeek})`;
      }
    } catch (e) {
      state.currentYear = 2017;
    }

    // Set input default year
    const yearInput = document.getElementById('input-year');
    if (yearInput) {
      yearInput.value = state.currentYear;
    }

    // 2. Check saved user in localStorage
    const savedUser = localStorage.getItem('bahire_hasab_user');
    if (savedUser) {
      try {
        state.user = JSON.parse(savedUser);
      } catch (e) {
        state.user = null;
      }
    }

    const savedAdmin = sessionStorage.getItem('bahire_hasab_admin');
    if (savedAdmin) {
      try {
        state.adminUser = JSON.parse(savedAdmin);
        state.isAdminAuthenticated = true;
      } catch (e) {}
    }

    // 3. Dynamic Celestial Progress Animation
    const percentEl = document.getElementById('splash-percent-count');
    const geezCountEl = document.getElementById('splash-geez-count');
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 3;
      if (progress > 100) progress = 100;
      if (percentEl) percentEl.textContent = `${progress}%`;
      if (geezCountEl) {
        const gz = (typeof BahireHasab !== 'undefined') ? BahireHasab.toGeez(progress) : progress;
        geezCountEl.textContent = `ቀመር በመዘጋጀት ላይ... ${gz}%`;
      }
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, 85);

    // Splash Screen transition timer (3.2 seconds)
    const splashScreen = document.getElementById('screen-splash');
    const splashTimer = setTimeout(() => {
      proceedFromSplash();
    }, 3400);

    const splashBtn = document.getElementById('splash-proceed-btn');
    if (splashBtn) {
      splashBtn.addEventListener('click', () => {
        clearTimeout(splashTimer);
        clearInterval(progressInterval);
        proceedFromSplash();
      });
    }

    function proceedFromSplash() {
      if (!splashScreen) return;
      splashScreen.classList.add('hide');

      setTimeout(() => {
        splashScreen.style.display = 'none';
        if (!state.user) {
          showAuthScreen('login');
        } else {
          updateUserUI();
          loadBahireHasab(state.currentYear);
        }
      }, 600);
    }

    setupEventListeners();
  }

  // --------------------------------------------------------------------------
  // 2. AUTHENTICATION (Login, Sign up, Guest Mode, Log Out)
  // --------------------------------------------------------------------------
  function showAuthScreen(type) {
    const loginScreen = document.getElementById('screen-auth-login');
    const signupScreen = document.getElementById('screen-auth-signup');

    if (type === 'signup') {
      loginScreen.classList.remove('active');
      signupScreen.classList.add('active');
    } else {
      signupScreen.classList.remove('active');
      loginScreen.classList.add('active');
    }
  }

  function hideAuthScreens() {
    const loginScreen = document.getElementById('screen-auth-login');
    const signupScreen = document.getElementById('screen-auth-signup');
    loginScreen.classList.remove('active');
    signupScreen.classList.remove('active');
  }

  async function handleLogin(e) {
    e.preventDefault();
    const name = (document.getElementById('login-name').value || '').trim();
    const phone = (document.getElementById('login-phone').value || '').trim();

    if (!name || !phone) {
      showToast('እባክዎ ሙሉ ስምዎንና ስልክ ቁጥርዎን ያስገቡ', 'warning');
      return;
    }

    try {
      const res = await Api.login(name, phone);
      if (res.success && res.user) {
        state.user = res.user;
        localStorage.setItem('bahire_hasab_user', JSON.stringify(res.user));
        hideAuthScreens();
        updateUserUI();
        loadBahireHasab(state.currentYear);
        showToast(`እንኳን ደህና መጡ ${res.user.name}!`);
      }
    } catch (err) {
      showToast(err.message || 'መግባት አልተቻለም', 'error');
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    const name = (document.getElementById('signup-name').value || '').trim();
    const phone = (document.getElementById('signup-phone').value || '').trim();
    const email = (document.getElementById('signup-email').value || '').trim();

    if (!name || !phone) {
      showToast('እባክዎ ሙሉ ስምዎንና ስልክ ቁጥርዎን ያስገቡ', 'warning');
      return;
    }

    try {
      const res = await Api.register(name, phone, email, state.selectedAvatar);
      if (res.success && res.user) {
        state.user = res.user;
        localStorage.setItem('bahire_hasab_user', JSON.stringify(res.user));
        hideAuthScreens();
        updateUserUI();
        loadBahireHasab(state.currentYear);
        showToast('አካውንትዎ በተሳካ ሁኔታ ተፈጥሯል!');
      }
    } catch (err) {
      showToast(err.message || 'መመዝገብ አልተቻለም', 'error');
    }
  }

  async function handleGuestLogin() {
    try {
      const res = await Api.loginGuest();
      if (res.success && res.user) {
        state.user = res.user;
        localStorage.setItem('bahire_hasab_user', JSON.stringify(res.user));
        hideAuthScreens();
        updateUserUI();
        loadBahireHasab(state.currentYear);
        showToast('እንደ እንግዳ ሆነው ገብተዋል');
      }
    } catch (err) {
      showToast('እንግዳ መግቢያ አልተሳካም', 'error');
    }
  }

  function handleSignOut() {
    state.user = null;
    localStorage.removeItem('bahire_hasab_user');
    updateUserUI();
    toggleDrawer(false);
    showAuthScreen('login');
    showToast('በተሳካ ሁኔታ ወጥተዋል');
  }

  // Update User info across Header & Welcome message
  function updateUserUI() {
    const user = state.user || {
      name: 'እንግዳ',
      unique_id: 'G000',
      avatar: '/assets/avatars/avatar-default.svg',
      role: 'guest'
    };

    const headerName = document.getElementById('header-username');
    const headerId = document.getElementById('header-user-id');
    const headerAvatar = document.getElementById('header-avatar-img');

    if (headerName) headerName.textContent = user.name;
    if (headerId) headerId.textContent = `id: #${user.unique_id}`;
    if (headerAvatar) headerAvatar.src = user.avatar || '/assets/avatars/avatar-1.jpg';

    const welcomeGreeting = document.getElementById('welcome-user-name');
    if (welcomeGreeting) welcomeGreeting.textContent = user.name;
  }

  // --------------------------------------------------------------------------
  // 3. ADMIN PORTAL (Credentials: yared / yared2442)
  // --------------------------------------------------------------------------
  function openAdminLoginModal() {
    const modal = document.getElementById('modal-admin-login');
    if (modal) {
      modal.classList.add('active');
      const uField = document.getElementById('admin-login-username');
      if (uField) uField.focus();
    }
  }

  function closeAdminLoginModal() {
    const modal = document.getElementById('modal-admin-login');
    if (modal) modal.classList.remove('active');
  }

  async function handleAdminLogin(e) {
    e.preventDefault();
    const u = (document.getElementById('admin-login-username').value || '').trim();
    const p = (document.getElementById('admin-login-password').value || '').trim();

    try {
      const res = await Api.adminLogin(u, p);
      if (res.success) {
        state.isAdminAuthenticated = true;
        state.adminUser = res.user;
        sessionStorage.setItem('bahire_hasab_admin', JSON.stringify(res.user));
        closeAdminLoginModal();
        document.getElementById('form-admin-login').reset();
        showToast(res.message || 'እንኳን ደህና መጡ አስተዳዳሪ ያሬድ!', 'success');
        navigateTo('admin');
      }
    } catch (err) {
      showToast(err.message || 'የተሳሳተ የተጠቃሚ ስም ወይም የይለፍ ቃል!', 'error');
    }
  }

  function logoutAdmin() {
    state.isAdminAuthenticated = false;
    state.adminUser = null;
    sessionStorage.removeItem('bahire_hasab_admin');
    showToast('ከአድሚን ዳሽቦርድ ወጥተዋል');
    navigateTo('home');
  }

  // --------------------------------------------------------------------------
  // 4. BAHIRE HASAB CALCULATIONS (Under Header Section)
  // --------------------------------------------------------------------------
  async function loadBahireHasab(year) {
    const inputYear = document.getElementById('input-year');
    if (inputYear) inputYear.value = year;

    try {
      const data = BahireHasab.calculate(year);
      state.bahireHasabData = data;
      renderBahireHasab(data);

      Api.getBahireHasab(year, state.user ? state.user.unique_id : 'anonymous').catch(() => {});
    } catch (err) {
      showToast('የዓመተ ምሕረት ስሌቱ አልተሳካም፤ እባክዎ ትክክለኛ ዓመት ያስገቡ', 'error');
    }
  }

  function renderBahireHasab(data) {
    // 1. Metric Cards
    document.getElementById('metric-amete-alem').textContent = data.ameteAlem;
    document.getElementById('metric-amete-alem-geez').textContent = `፭ሺ፭፻ + ${data.year} = ${data.ameteAlemGeez}`;

    document.getElementById('metric-wengelawi').textContent = `ዘመነ ${data.wengelawi}`;
    document.getElementById('metric-wengelawi-sub').textContent = data.isLeapYear ? 'ዘመነ ሠግር (ጳጉሜን ፮ ቀናት)' : 'መደበኛ ዓመት';

    document.getElementById('metric-rabiet').textContent = data.meteneRabiet;
    document.getElementById('metric-rabiet-geez').textContent = data.meteneRabietGeez;

    document.getElementById('metric-tinte-qemer').textContent = `ዕለተ ${data.meskerem1Day}`;
    document.getElementById('metric-tinte-qemer-sub').textContent = `መስከረም ፩ (${data.meskerem1DayEn})`;

    document.getElementById('metric-medeb').textContent = data.medeb;
    document.getElementById('metric-wenber').textContent = data.wenber;
    document.getElementById('metric-abekti').textContent = data.abekti;
    document.getElementById('metric-metqi').textContent = data.metqi;
    document.getElementById('metric-metqi-sub').textContent = `${data.metqiMonth} ${data.metqi} (${data.metqiDayOfWeek})`;

    // 2. Feasts and Fasts Cards
    const container = document.getElementById('feasts-cards-container');
    if (!container) return;
    container.innerHTML = '';

    data.moveableFeasts.forEach(feast => {
      const card = document.createElement('div');
      card.className = `feast-card ${feast.type === 'ጾም' ? 'is-fast' : 'is-feast'}`;
      card.innerHTML = `
        <div class="feast-top">
          <div>
            <div class="feast-name">${feast.name}</div>
            <div class="feast-name-en">${feast.nameEn}</div>
          </div>
          <span class="feast-tag ${feast.type === 'ጾም' ? 'fast' : 'feast'}">${feast.type}</span>
        </div>
        <div class="feast-date-row">
          <div class="feast-date-eth">${feast.month} ${feast.dayGeez} <span style="font-size: 0.92rem; color:#795548;">(${feast.day})</span></div>
          <div class="feast-day-of-week">${feast.dayOfWeek}</div>
        </div>
        <div class="feast-meaning">${feast.meaning}</div>
      `;
      container.appendChild(card);
    });

    // 3. Fixed Feasts Container
    const fixedContainer = document.getElementById('fixed-feasts-container');
    if (fixedContainer) {
      fixedContainer.innerHTML = '';
      data.fixedFeasts.forEach(feast => {
        const card = document.createElement('div');
        card.className = `feast-card is-feast`;
        card.innerHTML = `
          <div class="feast-top">
            <div>
              <div class="feast-name">${feast.name}</div>
              <div class="feast-name-en">${feast.nameEn}</div>
            </div>
            <span class="feast-tag ${feast.type === 'ጾም' ? 'fast' : 'feast'}">${feast.type}</span>
          </div>
          <div class="feast-date-row">
            <div class="feast-date-eth">${feast.month} ${feast.dayGeez} <span style="font-size: 0.92rem; color:#795548;">(${feast.day})</span></div>
            <div class="feast-day-of-week">${feast.desc}</div>
          </div>
        `;
        fixedContainer.appendChild(card);
      });
    }
  }

  // --------------------------------------------------------------------------
  // 5. CALENDAR PAGE
  // --------------------------------------------------------------------------
  function renderCalendar(year, month) {
    state.calYear = year;
    state.calMonth = month;

    const calData = EthiopianCalendar.getMonthCalendar(year, month);
    state.calendarData = calData;

    const titleEl = document.getElementById('cal-current-month');
    if (titleEl) {
      titleEl.textContent = `${calData.monthName} ${year} (${calData.monthNameEn})`;
    }

    const gridBody = document.getElementById('cal-days-grid');
    if (!gridBody) return;
    gridBody.innerHTML = '';

    for (let i = 0; i < calData.startDayOfWeek; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-cell empty';
      empty.style.opacity = '0.3';
      empty.style.pointerEvents = 'none';
      gridBody.appendChild(empty);
    }

    const today = EthiopianCalendar.getToday().ethiopian;

    calData.days.forEach(d => {
      const cell = document.createElement('div');
      const isToday = (today.year === year && today.month === month && today.day === d.day);
      cell.className = `cal-cell ${isToday ? 'is-today' : ''} ${d.isFastDay ? 'is-fast' : ''}`;
      
      const saintName = d.commemoration ? d.commemoration.name.split('/')[0].trim() : '';

      cell.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="cal-day-eth">${d.day}</span>
          <span class="cal-day-greg">${d.gregorianFormatted}</span>
        </div>
        <div class="cal-day-saint" title="${d.commemoration ? d.commemoration.name : ''}">
          ${saintName}
        </div>
      `;

      cell.addEventListener('click', () => {
        showDayDetailsModal(d, year, calData.monthName);
      });

      gridBody.appendChild(cell);
    });
  }

  function showDayDetailsModal(dayInfo, year, monthName) {
    const saint = dayInfo.commemoration;
    const msg = `
📅 ዕለት፡ ${monthName} ${dayInfo.day} ቀን ${year} ዓ.ም (${dayInfo.dayOfWeekEth})
🌍 ጎርጎሮሳዊ፡ ${dayInfo.gregorian.year}-${dayInfo.gregorian.month}-${dayInfo.gregorian.day}
⛪ የዕለቱ ጽላት / መታሰቢያ፡ ${saint ? saint.name : 'መደበኛ ዕለት'} (${saint ? saint.tag : ''})
${dayInfo.isFastDay ? '✨ የጾም ዕለት (ረቡዕ ወይም ዓርብ)' : ''}
    `;
    alert(msg);
  }

  // --------------------------------------------------------------------------
  // 6. HISTORY PAGE
  // --------------------------------------------------------------------------
  async function loadHistoryArticles() {
    const listContainer = document.getElementById('history-articles-list');
    if (!listContainer) return;

    try {
      const res = await Api.getAdminContents();
      if (res.success && res.contents) {
        listContainer.innerHTML = '';
        res.contents.forEach(article => {
          const card = document.createElement('div');
          card.className = 'history-article-card';
          card.innerHTML = `
            <div class="history-article-title">${article.title}</div>
            <div class="history-article-meta">ደራሲ / አቅራቢ፡ ${article.author} | ምድብ፡ ${article.category}</div>
            <div class="history-article-body">${article.body}</div>
          `;
          listContainer.appendChild(card);
        });
      }
    } catch (e) {}
  }

  // --------------------------------------------------------------------------
  // 7. CONTACT PAGE - Direct to bahirehasab27@gmail.com (+251966462684)
  // --------------------------------------------------------------------------
  async function handleContactSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const subject = document.getElementById('contact-subject').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !message) {
      showToast('እባክዎ ስምዎንና መልእክትዎን ያስገቡ', 'warning');
      return;
    }

    try {
      const res = await Api.sendContact({ name, phone, email, subject, message });
      if (res.success) {
        showToast('መልእክትዎ ወደ bahirehasab27@gmail.com ተልኳል፤ እናመሰግናለን!', 'success');
        document.getElementById('contact-form').reset();
        
        // Provide optional direct Gmail open link
        if (res.mailtoUrl && confirm('መልእክትዎ በስርዓቱ ተመዝግቧል! እንዲሁም በኢሜይል መላኪያ ፕሮግራምዎ (Gmail) በቀጥታ መክፈት ይፈልጋሉ?')) {
          window.location.href = res.mailtoUrl;
        }
      }
    } catch (err) {
      showToast(err.message || 'መልእክት መላክ አልተቻለም', 'error');
    }
  }

  // --------------------------------------------------------------------------
  // 8. ADMIN DASHBOARD & AUDIT LOGS
  // --------------------------------------------------------------------------
  async function loadAdminDashboard() {
    try {
      const statsRes = await Api.getAdminStats();
      if (statsRes.success && statsRes.stats) {
        document.getElementById('stat-total-users').textContent = statsRes.stats.totalUsers;
        document.getElementById('stat-total-guests').textContent = statsRes.stats.totalGuests;
        document.getElementById('stat-total-articles').textContent = statsRes.stats.totalArticles;
        document.getElementById('stat-total-messages').textContent = statsRes.stats.totalMessages;
        document.getElementById('stat-total-calcs').textContent = statsRes.stats.totalLogs || statsRes.recentLogs?.length || 0;
        
        if (statsRes.recentLogs) {
          renderAuditLogs(statsRes.recentLogs);
        }
      }
      loadAdminUsers();
      loadAdminContents();
      loadAdminMessages();
    } catch (err) {
      showToast('የአድሚን ዳሽቦርድ መረጃ ማምጣት አልተቻለም', 'error');
    }
  }

  function renderAuditLogs(logs) {
    const tbody = document.getElementById('admin-logs-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    logs.forEach(l => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="feast-tag feast">${l.event_type}</span></td>
        <td>${l.details}</td>
        <td><code>#${l.user_identifier || 'system'}</code></td>
        <td>${l.created_at || '-'}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  async function loadAdminUsers() {
    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;
    try {
      const res = await Api.getAdminUsers();
      if (res.success && res.users) {
        tbody.innerHTML = '';
        res.users.forEach(u => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>#${u.unique_id}</td>
            <td><strong>${u.name}</strong></td>
            <td>${u.phone || 'N/A'}</td>
            <td>${u.email || '-'}</td>
            <td><span class="feast-tag ${u.is_guest ? 'fast' : 'feast'}">${u.is_guest ? 'እንግዳ' : u.role}</span></td>
            <td>${u.created_at ? u.created_at.split(' ')[0] : '-'}</td>
            <td>
              <button class="cal-nav-btn" style="padding:4px 8px; color:#c53030;" onclick="window.App.deleteUser(${u.id})">አጥፋ</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    } catch (e) {}
  }

  async function loadAdminContents() {
    const list = document.getElementById('admin-contents-tbody');
    if (!list) return;
    try {
      const res = await Api.getAdminContents();
      if (res.success && res.contents) {
        list.innerHTML = '';
        res.contents.forEach(c => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>#${c.id}</td>
            <td><strong>${c.title}</strong></td>
            <td>${c.category}</td>
            <td>${c.author}</td>
            <td>
              <button class="cal-nav-btn" style="padding:4px 8px; color:#c53030;" onclick="window.App.deleteContent(${c.id})">አጥፋ</button>
            </td>
          `;
          list.appendChild(tr);
        });
      }
    } catch (e) {}
  }

  async function loadAdminMessages() {
    const tbody = document.getElementById('admin-messages-tbody');
    if (!tbody) return;
    try {
      const res = await Api.getAdminMessages();
      if (res.success && res.messages) {
        tbody.innerHTML = '';
        res.messages.forEach(m => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${m.name}</td>
            <td>${m.phone || '-'}</td>
            <td><strong>${m.subject}</strong></td>
            <td style="max-width:260px; overflow:hidden; text-overflow:ellipsis;">${m.message}</td>
            <td><span style="font-size:0.75rem; color:#d97706;">bahirehasab27@gmail.com</span></td>
            <td>
              <button class="cal-nav-btn" style="padding:4px 8px; color:#c53030;" onclick="window.App.deleteMessage(${m.id})">አጥፋ</button>
            </td>
          `;
          tbody.appendChild(tr);
        });
      }
    } catch (e) {}
  }

  // --------------------------------------------------------------------------
  // 9. PROFILE PHOTO PICKER MODAL
  // --------------------------------------------------------------------------
  function openPhotoModal() {
    const modal = document.getElementById('modal-profile-photo');
    if (modal) modal.classList.add('active');
  }

  function closePhotoModal() {
    const modal = document.getElementById('modal-profile-photo');
    if (modal) modal.classList.remove('active');
  }

  async function selectAvatar(avatarPath) {
    state.selectedAvatar = avatarPath;
    document.querySelectorAll('.avatar-option').forEach(el => {
      el.classList.toggle('selected', el.getAttribute('data-avatar') === avatarPath);
    });

    if (state.user) {
      try {
        const res = await Api.updateProfile({
          unique_id: state.user.unique_id,
          avatar: avatarPath
        });
        if (res.success && res.user) {
          state.user = res.user;
          localStorage.setItem('bahire_hasab_user', JSON.stringify(res.user));
          updateUserUI();
          showToast('የመገለጫ ፎቶዎ ተቀይሯል!');
        }
      } catch (e) {
        showToast('ፎቶ መቀየር አልተቻለም', 'error');
      }
    }
    closePhotoModal();
  }

  function handleCustomPhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('እባክዎ ምስል ብቻ ይምረጡ', 'warning');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (evt) {
      selectAvatar(evt.target.result);
    };
    reader.readAsDataURL(file);
  }

  // --------------------------------------------------------------------------
  // 10. NAVIGATION & ROUTING
  // --------------------------------------------------------------------------
  function navigateTo(pageId) {
    // Check Admin access protection
    if (pageId === 'admin' && !state.isAdminAuthenticated) {
      toggleDrawer(false);
      openAdminLoginModal();
      return;
    }

    state.activePage = pageId;

    document.querySelectorAll('.drawer-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('data-page') === pageId);
    });

    document.querySelectorAll('.page-section').forEach(section => {
      section.classList.remove('active');
    });

    const targetSection = document.getElementById(`page-${pageId}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    toggleDrawer(false);

    if (pageId === 'calendar') {
      renderCalendar(state.calYear, state.calMonth);
    } else if (pageId === 'history') {
      loadHistoryArticles();
    } else if (pageId === 'admin') {
      loadAdminDashboard();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function toggleDrawer(force) {
    const drawer = document.getElementById('nav-drawer');
    const backdrop = document.getElementById('nav-backdrop');
    const hamburger = document.getElementById('btn-hamburger');

    const isOpen = drawer.classList.contains('open');
    const shouldOpen = force !== undefined ? force : !isOpen;

    drawer.classList.toggle('open', shouldOpen);
    backdrop.classList.toggle('open', shouldOpen);
    hamburger.classList.toggle('active', shouldOpen);
  }

  // --------------------------------------------------------------------------
  // 11. EVENT LISTENERS
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    // Hamburger
    const hamburgerBtn = document.getElementById('btn-hamburger');
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => toggleDrawer());

    const navBackdrop = document.getElementById('nav-backdrop');
    if (navBackdrop) navBackdrop.addEventListener('click', () => toggleDrawer(false));

    // Nav drawer links
    document.querySelectorAll('.drawer-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        if (page) navigateTo(page);
      });
    });

    // Header Logout Button (Dedicated Header Icon)
    const headerLogoutBtn = document.getElementById('btn-header-logout');
    if (headerLogoutBtn) headerLogoutBtn.addEventListener('click', handleSignOut);

    // Drawer Sign out button
    const signoutBtn = document.getElementById('btn-signout');
    if (signoutBtn) signoutBtn.addEventListener('click', handleSignOut);

    // Auth screen transitions
    const toSignup = document.getElementById('link-to-signup');
    if (toSignup) toSignup.addEventListener('click', () => showAuthScreen('signup'));

    const toLogin = document.getElementById('link-to-login');
    if (toLogin) toLogin.addEventListener('click', () => showAuthScreen('login'));

    // Forms
    const loginForm = document.getElementById('form-login');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const signupForm = document.getElementById('form-signup');
    if (signupForm) signupForm.addEventListener('submit', handleRegister);

    // Guest login
    const guestBtn = document.getElementById('btn-guest-login');
    if (guestBtn) guestBtn.addEventListener('click', handleGuestLogin);

    // Admin login form (yared / yared2442)
    const formAdminLogin = document.getElementById('form-admin-login');
    if (formAdminLogin) formAdminLogin.addEventListener('submit', handleAdminLogin);

    const closeAdminBtn = document.getElementById('btn-close-admin-modal');
    if (closeAdminBtn) closeAdminBtn.addEventListener('click', closeAdminLoginModal);

    // Year Input & Calculate Button
    const formYear = document.getElementById('form-year-calc');
    if (formYear) {
      formYear.addEventListener('submit', (e) => {
        e.preventDefault();
        const yVal = parseInt(document.getElementById('input-year').value, 10);
        if (!isNaN(yVal) && yVal > 0) {
          state.currentYear = yVal;
          loadBahireHasab(yVal);
          showToast(`የ ${yVal} ዓ.ም ስሌት ተከናውኗል`);
        }
      });
    }

    // Quick year chips
    document.querySelectorAll('.chip-year').forEach(chip => {
      chip.addEventListener('click', () => {
        const yr = parseInt(chip.getAttribute('data-year'), 10);
        if (yr) {
          state.currentYear = yr;
          loadBahireHasab(yr);
          document.querySelectorAll('.chip-year').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');
        }
      });
    });

    // Calendar Navigation buttons
    const prevMonthBtn = document.getElementById('cal-prev-month');
    if (prevMonthBtn) {
      prevMonthBtn.addEventListener('click', () => {
        let m = state.calMonth - 1;
        let y = state.calYear;
        if (m < 1) { m = 13; y--; }
        renderCalendar(y, m);
      });
    }

    const nextMonthBtn = document.getElementById('cal-next-month');
    if (nextMonthBtn) {
      nextMonthBtn.addEventListener('click', () => {
        let m = state.calMonth + 1;
        let y = state.calYear;
        if (m > 13) { m = 1; y++; }
        renderCalendar(y, m);
      });
    }

    // Contact Form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) contactForm.addEventListener('submit', handleContactSubmit);

    // Profile Photo Selector Modal
    const profileWidget = document.getElementById('header-user-badge');
    if (profileWidget) profileWidget.addEventListener('click', openPhotoModal);

    const closePhotoBtn = document.getElementById('btn-close-photo-modal');
    if (closePhotoBtn) closePhotoBtn.addEventListener('click', closePhotoModal);

    const customPhotoInput = document.getElementById('input-custom-photo');
    if (customPhotoInput) customPhotoInput.addEventListener('change', handleCustomPhotoUpload);

    // Admin add content
    const adminContentForm = document.getElementById('admin-content-form');
    if (adminContentForm) {
      adminContentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('content-title').value.trim();
        const category = document.getElementById('content-category').value;
        const author = document.getElementById('content-author').value.trim();
        const body = document.getElementById('content-body').value.trim();

        if (!title || !body) {
          showToast('ርዕስ እና ይዘት አስፈላጊ ናቸው', 'warning');
          return;
        }

        try {
          const res = await Api.createContent({ title, category, author, body });
          if (res.success) {
            showToast('አዲስ ይዘት ተጨምሯል!', 'success');
            adminContentForm.reset();
            loadAdminContents();
          }
        } catch (err) {
          showToast(err.message || 'ይዘት መጨመር አልተቻለም', 'error');
        }
      });
    }

    // Admin Tabs
    document.querySelectorAll('.admin-tab-btn').forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-tab');
        document.querySelectorAll('.admin-tab-btn').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        document.querySelectorAll('.admin-tab-content').forEach(c => c.style.display = 'none');
        const activeTabContent = document.getElementById(`admin-tab-${target}`);
        if (activeTabContent) activeTabContent.style.display = 'block';
      });
    });
  }

  // Global exports for inline HTML actions
  window.App = {
    initApp,
    navigateTo,
    selectAvatar,
    logoutAdmin,
    openAdminLoginModal,
    async deleteUser(id) {
      if (confirm('ይህን ተጠቃሚ ለመሰረዝ እርግጠኛ ነዎት?')) {
        await Api.deleteUser(id);
        loadAdminUsers();
        showToast('ተጠቃሚው ተሰርዟል');
      }
    },
    async deleteContent(id) {
      if (confirm('ይህን ይዘት ለመሰረዝ እርግጠኛ ነዎት?')) {
        await Api.deleteContent(id);
        loadAdminContents();
        showToast('ይዘቱ ተሰርዟል');
      }
    },
    async deleteMessage(id) {
      if (confirm('ይህን መልእክት ለመሰረዝ እርግጠኛ ነዎት?')) {
        await Api.deleteMessage(id);
        loadAdminMessages();
        showToast('መልእክቱ ተሰርዟል');
      }
    }
  };

  document.addEventListener('DOMContentLoaded', initApp);
})();
