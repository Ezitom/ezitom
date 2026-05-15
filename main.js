const EMAILJS_PUBLIC_KEY = window.CONFIG?.EMAILJS_PUBLIC_KEY || '';
const EMAILJS_SERVICE_ID = window.CONFIG?.EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = window.CONFIG?.EMAILJS_TEMPLATE_ID || '';

// ── FOOTER LOADER ─────────────────────────────────────────
function loadFooter() {
  const placeholder = document.getElementById('footer-placeholder');
  if (!placeholder) return;
  fetch('footer.html')
    .then(res => res.text())
    .then(html => {
      placeholder.innerHTML = html;
      const yearEl = document.getElementById('current-year');
      if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
      }
    })
    .catch(err => console.warn('Footer could not be loaded:', err));
}
loadFooter();

// Theme Toggle
const themeToggles = document.querySelectorAll('.theme-toggle');
const htmlEl = document.documentElement;

themeToggles.forEach(toggle => {
  toggle.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    htmlEl.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    if (typeof initParticles === 'function') initParticles();
  });
});

// Hamburger Menu
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// IntersectionObserver for .reveal elements
const observerOpts = { root: null, rootMargin: '0px', threshold: 0.15 };
window.observer = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      obs.unobserve(entry.target);
    }
  });
}, observerOpts);

document.querySelectorAll('.reveal').forEach(el => window.observer.observe(el));

// IntersectionObserver for .skill-bar-fill
window.skillObserver = new IntersectionObserver((entries, obs) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.width = entry.target.getAttribute('data-width');
      obs.unobserve(entry.target);
    }
  });
}, observerOpts);

document.querySelectorAll('.skill-bar-fill').forEach(el => window.skillObserver.observe(el));

// Project filter logic (using event delegation for dynamic projects)
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const cat = btn.getAttribute('data-cat');

  projectCards.forEach(card => {
    if (cat === 'all' || card.getAttribute('data-cat') === cat) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
});

// Contact form logic — [DEPRECATED] Handled by backend-api.js
/*
const form = document.getElementById('contact-form');
...
*/


// Home enquiry form logic — [DEPRECATED] Handled by backend-api.js
/*
const homeEnquiryForm = document.getElementById('homeEnquiryForm');
...
*/


// Canvas particle animation
const canvas = document.getElementById('hero-canvas');
let particles = [];

function initParticles() {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = canvas.parentElement.offsetHeight;
  particles = [];

  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const color = isLight ? 'rgba(0, 119, 204,' : 'rgba(0, 212, 200,';

  for (let i = 0; i < 110; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      sx: (Math.random() - 0.5) * 0.5,
      sy: (Math.random() - 0.5) * 0.5,
      color: color
    });
  }
}

function animateParticles() {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const rgb = isLight ? '0, 119, 204' : '0, 212, 200';

  for (let i = 0; i < particles.length; i++) {
    let p = particles[i];
    p.x += p.sx; p.y += p.sy;
    if (p.x < 0 || p.x > canvas.width) p.sx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.sy *= -1;

    ctx.fillStyle = p.color + ' 0.5)';
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();

    for (let j = i; j < particles.length; j++) {
      let p2 = particles[j];
      const dx = p.x - p2.x;
      const dy = p.y - p2.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${rgb}, ${1 - dist / 100})`;
        ctx.lineWidth = 0.5;
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(animateParticles);
}

if (canvas) {
  window.addEventListener('resize', initParticles);
  initParticles();
  animateParticles();
}

// Typewriter
const typeEl = document.getElementById('typewriter');
if (typeEl) {
  const roles = ["am a Full-Stack Web Developer", "am an API Architect", "turn ideas into real products"];
  let rIdx = 0, cIdx = 0, isDel = false;

  function type() {
    const role = roles[rIdx];
    if (isDel) {
      typeEl.textContent = role.substring(0, cIdx - 1);
      cIdx--;
    } else {
      typeEl.textContent = role.substring(0, cIdx + 1);
      cIdx++;
    }

    let speed = isDel ? 30 : 80;
    if (!isDel && cIdx === role.length) {
      speed = 2000;
      isDel = true;
    } else if (isDel && cIdx === 0) {
      isDel = false;
      rIdx = (rIdx + 1) % roles.length;
      speed = 500;
    }
    setTimeout(type, speed);
  }
  setTimeout(type, 1000);
}

// ── ANALYTICS EVENT TRACKING ─────────────────────────────
// Fires custom GA4 events for key user interactions.
// All calls are guarded so the site works fine if GA is blocked.

// Track: CTA button clicks on the home page
document.querySelectorAll('.btn-p, .btn-s').forEach(btn => {
  btn.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'cta_click', {
        event_category: 'engagement',
        event_label: btn.textContent.trim()
      });
    }
  });
});

// Track: Project card "Live Site" link clicks
document.querySelectorAll('.project-link.live').forEach(link => {
  link.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'project_click', {
        event_category: 'projects',
        event_label: link.closest('.project-card')
          ?.querySelector('.project-title')?.textContent.trim()
      });
    }
  });
});

// Track: Form submission attempts — [DEPRECATED] Handled by backend-api.js
/*
const contactForm = document.getElementById('contactForm');
...
*/


// Track: Theme toggle usage
const themeToggle = document.getElementById('themeToggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'theme_toggle', {
        event_category: 'ui',
        event_label: document.documentElement.getAttribute('data-theme')
      });
    }
  });
}


// Initialize Lucide Icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}
