/*
================================================================
 EMAIL API SETUP — EmailJS
 https://www.emailjs.com
================================================================

 QUICK SETUP (takes about 10 minutes):

 1. Go to https://www.emailjs.com and create a free account

 2. Connect your email provider:
    - Dashboard → Email Services → Add New Service
    - Choose Gmail (or Outlook / Yahoo)
    - Authorise your email account
    - Copy the SERVICE ID shown (looks like: service_xxxxxxx)
    - Paste it as the value of EMAILJS_SERVICE_ID below

 3. Create the Developer Notification template:
    - Dashboard → Email Templates → Create New Template
    - Subject:  New enquiry from {{first_name}} {{last_name}} — {{subject}}
    - Body:
        Name:     {{first_name}} {{last_name}}
        Email:    {{reply_to}}
        Subject:  {{subject}}
        Budget:   {{budget}}
        Source:   {{form_source}}
        Message:
        {{message}}
    - "To Email" field: your personal email address
    - "Reply To" field: {{reply_to}}
    - Save and copy the TEMPLATE ID (looks like: template_xxxxxxx)
    - Paste it as the value of EMAILJS_TEMPLATE_ID below

 4. Create the Auto-Reply template:
    - Dashboard → Email Templates → Create New Template
    - Subject:  Got your message, {{first_name}} — I'll be in touch soon
    - Body (write in first person, warm tone):
        Hi {{first_name}},

        Thanks for reaching out — I've received your message
        and will get back to you within 24 hours.

        Here's a quick summary of what you sent:
        Subject: {{subject}}
        Message: {{message}}

        While you wait, feel free to check out my projects:
        {{site_url}}

        Talk soon,
        [Your Name]
    - "To Email" field: {{reply_to}}
    - "From Name" field: Your name
    - Save and copy this TEMPLATE ID
    - Paste it as the value of EMAILJS_AUTOREPLY_TEMPLATE_ID below

 5. Get your Public Key:
    - Dashboard → Account → API Keys
    - Copy the Public Key
    - Paste it as the value of EMAILJS_PUBLIC_KEY below

 6. Replace G-XXXXXXXXXX with your GA4 ID if not already done

================================================================
*/

// ── EMAILJS CONFIGURATION & DYNAMIC RESOLVER ─────────────
function getEmailJSConfig() {
  // Hardcoded fallbacks — these are used when running via Live Server (no Vite bundler)
  let serviceId          = 'service_cf49mul';
  let templateId         = 'template_ab12cd3';
  let autoreplyTemplateId = 'template_babyzyk';
  let resetTemplateId    = 'template_7yndbe4';
  let publicKey          = 'KlVap2Dd6hYP_CS06';

  // When bundled with Vite, read from .env variables
  try {
    const metaEnv = new Function('return typeof import.meta !== "undefined" ? import.meta.env : null')();
    if (metaEnv) {
      if (metaEnv.VITE_EMAILJS_SERVICE_ID)       serviceId           = metaEnv.VITE_EMAILJS_SERVICE_ID;
      if (metaEnv.VITE_EMAILJS_TEMPLATE_ID)      templateId          = metaEnv.VITE_EMAILJS_TEMPLATE_ID;
      if (metaEnv.VITE_EMAILJS_PUBLIC_KEY)        publicKey           = metaEnv.VITE_EMAILJS_PUBLIC_KEY;
      if (metaEnv.VITE_EMAILJS_RESET_TEMPLATE_ID) resetTemplateId    = metaEnv.VITE_EMAILJS_RESET_TEMPLATE_ID;
    }
  } catch (e) { /* not running in Vite — use fallbacks above */ }

  return { serviceId, templateId, autoreplyTemplateId, resetTemplateId, publicKey };
}

const SITE_URL = 'http://localhost/ezitom/'; // your live URL

// ── EMAILJS INIT ─────────────────────────────────────────────
(function initEmailJS() {
  if (typeof emailjs !== 'undefined') {
    const config = getEmailJSConfig();
    emailjs.init(config.publicKey);
    console.log(
      '%c ✓ EmailJS connected',
      'color:#00d4c8; font-weight:bold;'
    );
  }
})();

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

// ── CORE EMAIL SENDER ─────────────────────────────────────────────────────
// Sends notification email to developer + optional auto-reply to visitor.
// Returns a Promise. Rejects with an error object on failure.

async function sendEnquiryEmails(params) {
  const config = getEmailJSConfig();

  // Guard: EmailJS SDK must be loaded
  if (typeof emailjs === 'undefined') {
    throw new Error('EmailJS SDK is not loaded. Check the <script> tag in your HTML.');
  }

  // 1. Developer notification email
  // Template variables must match your EmailJS template exactly.
  // Standard EmailJS template variables: {{from_name}}, {{from_email}}, {{reply_to}}, {{subject}}, {{message}}, {{sent_time}}
  let devResponse;
  try {
    devResponse = await emailjs.send(
      config.serviceId,
      config.templateId,
      {
        from_name:   `${params.firstName} ${params.lastName || ''}`.trim(),
        from_email:  params.email,
        reply_to:    params.email,
        subject:     params.subject     || 'New Enquiry',
        budget:      params.budget      || 'Not specified',
        message:     params.message,
        form_source: params.source      || 'Contact Page',
        site_url:    SITE_URL,
        sent_time:   new Date().toLocaleString()
      }
    );
    console.log('[EmailJS] ✓ Developer notification sent. Status:', devResponse.status, devResponse.text);
  } catch (err) {
    // Detailed logging so DevTools shows exactly what went wrong
    console.error('[EmailJS] ✗ Developer notification FAILED.');
    console.error('  Service ID  :', config.serviceId);
    console.error('  Template ID :', config.templateId);
    console.error('  Error status:', err.status);
    console.error('  Error text  :', err.text);
    console.error('  Full error  :', err);
    throw err; // re-throw so the form handler updates localStorage delivery_status
  }

  // 2. Auto-reply to the visitor (non-fatal — main notification already succeeded)
  if (config.autoreplyTemplateId) {
    try {
      const replyResponse = await emailjs.send(
        config.serviceId,
        config.autoreplyTemplateId,
        {
          from_name:  `${params.firstName} ${params.lastName || ''}`.trim(),
          from_email: params.email,
          reply_to:   params.email,
          subject:    params.subject || 'New Enquiry',
          message:    params.message,
          site_url:   SITE_URL,
        }
      );
      console.log('[EmailJS] ✓ Auto-reply sent. Status:', replyResponse.status, replyResponse.text);
    } catch (err) {
      console.warn('[EmailJS] ⚠ Auto-reply failed (non-fatal):', err.status, err.text);
    }
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
      console.error('EmailJS error (contact form):', err);
      
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
      console.error('EmailJS error (home form):', err);
      
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
