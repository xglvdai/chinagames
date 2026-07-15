/**
 * DragonTile Games — Main JavaScript
 * Handles navigation, leaderboard, animations, interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initCookieConsent();
  initNavigation();
  initFloatingTiles();
  initScrollAnimations();
  initLeaderboard();
  initNewsletterForm();
  initMobileMenu();
  initPlayNowModal();
  initDropdownMenus();
});

// ===== GDPR Cookie Consent Banner =====
function initCookieConsent() {
  const consent = localStorage.getItem('cookie_consent');
  if (consent === 'accepted' || consent === 'rejected') return;

  const banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.innerHTML = `
    <div class="cookie-banner-inner">
      <div class="cookie-banner-text">
        <h4>🍪 Cookie Preferences</h4>
        <p>We use essential cookies to make our site work. With your consent, we may also use non-essential cookies to improve user experience and analyze website traffic. By clicking "Accept All", you agree to our use of all cookies. You can <a href="/privacy">learn more</a> in our privacy policy.</p>
      </div>
      <div class="cookie-banner-actions">
        <button class="btn btn-secondary btn-sm" id="cookieReject">Reject Non-Essential</button>
        <button class="btn btn-primary btn-sm" id="cookieAccept">Accept All</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  // Animation: slide up
  requestAnimationFrame(() => banner.classList.add('show'));

  const acceptBtn = banner.querySelector('#cookieAccept');
  const rejectBtn = banner.querySelector('#cookieReject');

  acceptBtn.addEventListener('click', () => {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 400);
  });

  rejectBtn.addEventListener('click', () => {
    localStorage.setItem('cookie_consent', 'rejected');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    // Disable non-essential tracking
    window.gtag?.('consent', 'update', { analytics_storage: 'denied', ad_storage: 'denied' });
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 400);
  });
}

// ===== Navigation scroll effect =====
function initNavigation() {
  const nav = document.querySelector('#nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// ===== Mobile Menu =====
function initMobileMenu() {
  const btn = document.querySelector('#mobileMenuBtn');
  const links = document.querySelector('.nav-links');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    links.classList.toggle('open');
    const spans = btn.querySelectorAll('span');
    if (links.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close menu on link click
  links.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => links.classList.remove('open'));
  });
}

// ===== Floating Mahjong Tiles Animation =====
function initFloatingTiles() {
  const container = document.querySelector('#floatingTiles');
  if (!container) return;

  const tiles = ['🀄', '發', '🀫', '🀀', '🀁', '🀂', '🀃', '龍', '風', '🀐', '🀙'];
  tiles.forEach((tile, i) => {
    const div = document.createElement('div');
    div.className = 'floating-tile';
    div.textContent = tile;
    div.style.animationDelay = `${i * 0.35}s`;
    container.appendChild(div);
  });
}

// ===== Intersection Observer for Scroll Animations =====
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.game-card, .about-card, .section-header').forEach(el => {
    observer.observe(el);
  });
}

// ===== Leaderboard =====
function initLeaderboard() {
  const tabs = document.querySelectorAll('.lb-tab');
  const tbody = document.querySelector('#leaderboardBody');
  if (!tabs.length || !tbody) return;

  const API_BASE = 'https://api.dragontile.games';

  // Leaderboard data — local scores with fallback mock
  const mockData = {
    mahjong: [
      { rank: 1, player: 'DragonMaster', score: 'Level 10', time: '8:42', date: '2026-07-10' },
      { rank: 2, player: 'TileWhisperer', score: 'Level 9', time: '12:15', date: '2026-07-09' },
      { rank: 3, player: 'ZenPanda', score: 'Level 8', time: '10:30', date: '2026-07-08' },
      { rank: 4, player: 'BambooKing', score: 'Level 7', time: '15:00', date: '2026-07-07' },
      { rank: 5, player: 'JadeWarrior', score: 'Level 6', time: '11:20', date: '2026-07-06' },
      { rank: 6, player: 'SilkRoad', score: 'Level 5', time: '9:45', date: '2026-07-05' },
      { rank: 7, player: 'LotusFlower', score: 'Level 5', time: '14:10', date: '2026-07-04' },
      { rank: 8, player: 'EastWind', score: 'Level 4', time: '8:00', date: '2026-07-03' },
      { rank: 9, player: 'GreatWall', score: 'Level 3', time: '6:30', date: '2026-07-02' },
      { rank: 10, player: 'RiceField', score: 'Level 2', time: '4:15', date: '2026-07-01' },
    ],
    klotski: [
      { rank: 1, player: 'CaoCaoFan', score: 'Classic', time: '0:45 (35 moves)', date: '2026-07-10' },
      { rank: 2, player: 'PuzzleKing', score: 'Classic', time: '0:52 (42 moves)', date: '2026-07-09' },
      { rank: 3, player: 'SlidingPro', score: 'Easy', time: '0:18 (22 moves)', date: '2026-07-08' },
      { rank: 4, player: 'LogicLord', score: 'Easy', time: '0:25 (30 moves)', date: '2026-07-07' },
      { rank: 5, player: 'BrainTrainer', score: 'Easy', time: '0:32 (38 moves)', date: '2026-07-06' },
    ],
    hanzi: [
      { rank: 1, player: 'WordSmith', score: '150/150', time: '—', date: '2026-07-10' },
      { rank: 2, player: 'RadicalRacer', score: '120/150', time: '—', date: '2026-07-09' },
      { rank: 3, player: 'HanziHero', score: '95/150', time: '—', date: '2026-07-08' },
      { rank: 4, player: 'SymbolMaster', score: '60/150', time: '—', date: '2026-07-07' },
      { rank: 5, player: 'CharacterPro', score: '30/150', time: '—', date: '2026-07-06' },
    ]
  };

  function renderLeaderboard(game) {
    const data = mockData[game] || [];
    tbody.innerHTML = data.map(row => `
      <tr>
        <td><span class="${row.rank <= 3 ? 'rank-' + row.rank : ''}">#${row.rank}</span></td>
        <td>${row.player}</td>
        <td>${row.score.toLocaleString()}</td>
        <td>${row.time}</td>
        <td>${row.date}</td>
      </tr>
    `).join('');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderLeaderboard(tab.dataset.game);
    });
  });

  // Initial render
  renderLeaderboard('mahjong');
}

// ===== Newsletter Form =====
function initNewsletterForm() {
  const form = document.querySelector('#newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = form.querySelector('input').value;
    if (email) {
      // TODO: Connect to Mailchimp/ConvertKit API
      const btn = form.querySelector('button');
      const originalText = btn.textContent;
      btn.textContent = 'Subscribed! ✓';
      btn.style.background = 'var(--color-jade-dark)';
      form.querySelector('input').value = '';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
      }, 3000);
    }
  });
}

// ===== Play Now Modal =====
function initPlayNowModal() {
  const btn = document.querySelector('#playNowBtn');
  const modal = document.querySelector('#gamePickerModal');
  const closeBtn = document.querySelector('#closeGamePicker');
  if (!btn || !modal) return;

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    modal.classList.add('active');
  });

  closeBtn?.addEventListener('click', () => modal.classList.remove('active'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.remove('active');
  });
}

// ===== Dropdown Menus (mobile touch support) =====
function initDropdownMenus() {
  document.querySelectorAll('.nav-dropdown > .nav-link').forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        this.parentElement.querySelector('.dropdown-menu').classList.toggle('open');
      }
    });
  });
}

// ===== Smooth scroll for all anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
