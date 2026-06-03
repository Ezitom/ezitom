/*
================================================================
 EMAIL SETUP — Web3Forms
 https://web3forms.com
================================================================

 QUICK SETUP (2 minutes):

 1. Go to https://web3forms.com
 2. Enter your Gmail address to get a free access key
 3. Copy the access key (looks like: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)
 4. Paste it as the value of WEB3FORMS_ACCESS_KEY below
 5. Add the same key to your Vercel environment variables:
    Settings → Environment Variables → VITE_WEB3FORMS_ACCESS_KEY

 No domain restrictions. No backend needed. Completely free.
================================================================
*/

// ── WEB3FORMS ACCESS KEY ──────────────────────────────────────
// Replace this with your real key from https://web3forms.com
const WEB3FORMS_ACCESS_KEY = 'c2aafe30-5e26-4628-a968-a33d4c9216de';

const SITE_URL = 'https://ezitom.vercel.app/'; // live Vercel URL

// ── GOOGLE ANALYTICS GA4 CONFIGURATION ───────────────────────────
const GA_MEASUREMENT_ID = 'import.meta.env.VITE_GA_MEASUREMENT_ID';

// ReactGA compatibility helper for Vanilla JS
const ReactGA = {
  initialize: (id) => {
    if (!id || id.includes('import.meta')) return;
    if (document.querySelector(`script[src*="gtag/js?id=${id}"]`)) return;
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', id);
  },
  send: (payload) => {
    if (window.gtag) {
      if (payload.hitType === 'pageview') {
        window.gtag('event', 'page_view', {
          page_path: payload.page || window.location.pathname
        });
      } else {
        window.gtag('event', payload.eventAction || 'event', payload);
      }
    }
  }
};
window.ReactGA = ReactGA;

// Self-initialize Google Analytics
(function initGoogleAnalytics() {
  if (GA_MEASUREMENT_ID && !GA_MEASUREMENT_ID.includes('import.meta') && GA_MEASUREMENT_ID.trim() !== '') {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    ReactGA.send({ hitType: 'pageview', page: window.location.pathname });
    console.log(`%c ✓ Google Analytics initialized: ${GA_MEASUREMENT_ID}`, 'color:#5dd9c1; font-weight:bold;');
  }
})();

console.log('%c ✓ Web3Forms ready', 'color:#00d4c8; font-weight:bold;');

// ── LOCAL STORAGE MESSAGE HELPER ──────────────────────────────
function saveMessageToLocalStorage(msgObj) {
  try {
    const key = 'portfolio_messages';
    const messages = JSON.parse(localStorage.getItem(key) || '[]');
    const existingIdx = messages.findIndex(m => m.id === msgObj.id);
    if (existingIdx > -1) {
      messages[existingIdx] = msgObj;
    } else {
      messages.push(msgObj);
    }
    localStorage.setItem(key, JSON.stringify(messages));
    localStorage.setItem('messages', JSON.stringify(messages)); // alias key 'messages'
  } catch (e) {
    console.error('[dev.folio] LocalStorage error:', e);
  }
}


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

// Project filter logic
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');
if (filterBtns.length > 0) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-cat');

      const projectCards = document.querySelectorAll('.project-card');
      projectCards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-cat') === cat) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

// ── CORE EMAIL SENDER (Web3Forms) ────────────────────────────────────────────
// Sends contact notification to the admin Gmail via Web3Forms.
// Returns a Promise. Rejects on failure so the form handler can update the UI.

async function sendEnquiryEmails(params) {
  const fullName = `${params.firstName} ${params.lastName || ''}`.trim();

  const payload = {
    access_key:  WEB3FORMS_ACCESS_KEY,
    name:        fullName,
    email:       params.email,
    subject:     `New enquiry from ${fullName} — ${params.subject || 'Contact Form'}`,
    message:     [
      `Name:    ${fullName}`,
      `Email:   ${params.email}`,
      `Subject: ${params.subject || 'Not specified'}`,
      `Budget:  ${params.budget  || 'Not specified'}`,
      `Source:  ${params.source  || 'Portfolio'}`,
      ``,
      `Message:`,
      params.message,
      ``,
      `Sent from: ${SITE_URL}`,
      `Time: ${new Date().toLocaleString()}`
    ].join('\n'),
    from_name:   'dev.folio Contact Form',
    replyto:     params.email,
  };

  const response = await fetch('https://api.web3forms.com/submit', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body:    JSON.stringify(payload)
  });

  const result = await response.json();
  console.log('[Web3Forms] Response:', result);

  if (!result.success) {
    throw new Error(result.message || 'Web3Forms submission failed');
  }
}

// ── RATE LIMIT CHECK ──────────────────────────────────────────
function isRateLimited(formKey) {
  const lastSent = sessionStorage.getItem(formKey);
  if (lastSent && Date.now() - parseInt(lastSent) < 60000) {
    showToast(
      'Slow down ✋',
      'You already sent a message. Please wait 60 seconds before trying again.',
      false
    );
    return true;
  }
  return false;
}

function markSent(formKey) {
  sessionStorage.setItem(formKey, Date.now().toString());
}

// ── CONTACT PAGE FORM ─────────────────────────────────────────
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Rate limit check
    if (isRateLimited('contact_form')) return;

    // Grab field values
    const firstName = document.getElementById('fname')?.value.trim();
    const lastName = document.getElementById('lname')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const subject = document.getElementById('subject')?.value;
    const budget = document.getElementById('budget')?.value;
    const message = document.getElementById('message')?.value.trim();

    // Validate required fields
    let isValid = true;
    const required = [
      { id: 'fname', val: firstName },
      { id: 'lname', val: lastName },
      { id: 'email', val: email },
      { id: 'subject', val: subject },
      { id: 'message', val: message },
    ];
    required.forEach(({ id, val }) => {
      const el = document.getElementById(id);
      if (!val) {
        el.style.borderColor = '#e24b4a';
        isValid = false;
      } else {
        el.style.borderColor = '';
      }
    });

    // Reset borders on typing
    required.forEach(({ id }) => {
      const el = document.getElementById(id);
      el?.addEventListener('input', () => el.style.borderColor = '', { once: true });
    });

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      document.getElementById('email').style.borderColor = '#e24b4a';
      showToast('Invalid email', 'Please enter a valid email address.', false);
      return;
    }

    if (!isValid) {
      showToast('Missing fields', 'Please fill in all required fields.', false);
      return;
    }

    // Set button to loading state
    const btn = document.getElementById('submitBtn');
    setButtonLoading(btn, true);

    const msgId = Date.now();
    const msgObj = {
      id: msgId,
      name: `${firstName} ${lastName || ''}`.trim(),
      email: email,
      subject: subject || 'Contact Page Form',
      budget: budget || 'Not specified',
      message: message,
      timestamp: msgId,
      read: false,
      delivery_status: 'pending'
    };

    // Save message to localStorage simultaneously (in pending state)
    saveMessageToLocalStorage(msgObj);

    try {
      await sendEnquiryEmails({
        firstName,
        lastName,
        email,
        subject,
        budget,
        message,
        source: 'Contact Page Form',
      });

      // Update local message state to successful delivery
      msgObj.delivery_status = 'success';
      saveMessageToLocalStorage(msgObj);

      markSent('contact_form');
      showToast(
        'Message sent! ✓',
        "Thanks — I'll get back to you within 24 hours. Check your inbox for a confirmation.",
        true
      );
      contactForm.reset();

    } catch (err) {
      console.error('[Web3Forms] Contact form error:', err);
      
      // Update local message state to failed delivery
      msgObj.delivery_status = 'failed';
      saveMessageToLocalStorage(msgObj);

      showToast(
        'Something went wrong',
        'Failed to deliver email. However, your message has been stored locally for the administrator.',
        false
      );
    } finally {
      setButtonLoading(btn, false);
    }
  });
}

// ── HOME PAGE ENQUIRY FORM ────────────────────────────────────
const homeEnquiryForm = document.getElementById('homeEnquiryForm');

if (homeEnquiryForm) {
  homeEnquiryForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Rate limit check
    if (isRateLimited('home_enquiry')) return;

    const name = document.getElementById('enquiry-name')?.value.trim();
    const email = document.getElementById('enquiry-email')?.value.trim();
    const subject = document.getElementById('enquiry-subject')?.value;
    const message = document.getElementById('enquiry-message')?.value.trim();

    // Split name into first/last for the email template
    const nameParts = name ? name.split(' ') : [''];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '';

    // Validate
    let isValid = true;
    const fields = [
      { id: 'enquiry-name', val: name },
      { id: 'enquiry-email', val: email },
      { id: 'enquiry-message', val: message },
    ];
    fields.forEach(({ id, val }) => {
      const el = document.getElementById(id);
      if (!val) { el.style.borderColor = '#e24b4a'; isValid = false; }
      else el.style.borderColor = '';
    });

    // Reset borders on typing
    fields.forEach(({ id }) => {
      const el = document.getElementById(id);
      el?.addEventListener('input', () => el.style.borderColor = '', { once: true });
    });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      document.getElementById('enquiry-email').style.borderColor = '#e24b4a';
      showToast('Invalid email', 'Please enter a valid email address.', false);
      return;
    }

    if (!isValid) {
      showToast('Missing fields', 'Please fill in all required fields.', false);
      return;
    }

    const btn = document.getElementById('homeEnquiryBtn');
    setButtonLoading(btn, true);

    const msgId = Date.now();
    const msgObj = {
      id: msgId,
      name: name,
      email: email,
      subject: subject || 'Quick Enquiry',
      budget: 'Not specified',
      message: message,
      timestamp: msgId,
      read: false,
      delivery_status: 'pending'
    };

    // Save message to localStorage simultaneously (in pending state)
    saveMessageToLocalStorage(msgObj);

    try {
      await sendEnquiryEmails({
        firstName,
        lastName,
        email,
        subject: subject || 'Quick Enquiry',
        message,
        source: 'Home Page Enquiry Form',
      });

      // Update local message state to successful delivery
      msgObj.delivery_status = 'success';
      saveMessageToLocalStorage(msgObj);

      markSent('home_enquiry');
      showToast(
        'Enquiry sent! ✓',
        "Got it — I'll be in touch soon. Check your inbox for a confirmation.",
        true
      );
      homeEnquiryForm.reset();

    } catch (err) {
      console.error('[Web3Forms] Home form error:', err);
      
      // Update local message state to failed delivery
      msgObj.delivery_status = 'failed';
      saveMessageToLocalStorage(msgObj);

      showToast(
        'Something went wrong',
        'Failed to deliver enquiry. However, your message has been stored locally for the administrator.',
        false
      );
    } finally {
      setButtonLoading(btn, false);
    }
  });
}

// ── HELPERS ───────────────────────────────────────────────────

// Sets a submit button into loading or ready state
function setButtonLoading(btn, isLoading) {
  if (!btn) return;
  if (isLoading) {
    btn.disabled = true;
    btn.dataset.originalText = btn.innerHTML;
    btn.innerHTML = `
      <svg style="width:16px;height:16px;stroke:currentColor;fill:none;
                  stroke-width:2;animation:spin 1s linear infinite; margin-right: 8px;"
           viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" stroke-dasharray="30 70"/>
      </svg>
      Sending…`;
  } else {
    btn.disabled = false;
    btn.innerHTML = btn.dataset.originalText || 'Send Message →';
  }
}

// Shows a toast notification bottom-right
// success = true (green accent border) / false (red border)
function showToast(title, text, success = true) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-text').textContent = text;
  document.getElementById('toast-icon').textContent = success ? '✓' : '✕';
  toast.style.borderColor = success ? 'var(--accent)' : '#e24b4a';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 6000);
}

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

// Initialize Lucide Icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}
