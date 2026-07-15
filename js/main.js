/**
 * ZenMatch Games — Main JavaScript
 * Handles navigation, animations, interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initCookieConsent();
  initNavigation();
  initFloatingTiles();
  initScrollAnimations();
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
