/**
 * config.js - Admin Dashboard Configuration
 * ============================================
 * Auth is handled by Supabase (see supabaseClient.js).
 * This file manages Google Analytics and default data seeding.
 */

// ── GOOGLE ANALYTICS GA4 CONFIGURATION ───────────────────────────
const GA_MEASUREMENT_ID = 'G-7HVT5JRQRH';

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

// ── DEFAULT PROJECTS (seeded into localStorage on first load) ──
const DEFAULT_PROJECTS = [
  {
    id: 1,
    title: 'Business Website',
    description: 'A professional business website built for a local company showcasing services and contact info.',
    tech_stack: ['HTML', 'CSS', 'JavaScript'],
    image_url: '/images/projects/Business website.png',
    live_url: '#',
    github_url: '',
    category: 'Business'
  },
  {
    id: 2,
    title: 'Tolu & Dami Wedding',
    description: 'A beautiful wedding website for a couple, featuring event details, RSVP, and photo gallery.',
    tech_stack: ['HTML', 'CSS', 'JavaScript'],
    image_url: '/images/projects/tolu-dami-wedding.svg',
    live_url: '#',
    github_url: '',
    category: 'Wedding'
  },
  {
    id: 3,
    title: 'Greenroots Store',
    description: 'An e-commerce store for organic products with cart, product listings, and checkout flow.',
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    image_url: '/images/projects/greenroots-store.svg',
    live_url: '#',
    github_url: '',
    category: 'Business'
  },
  {
    id: 4,
    title: 'DevNotes Blog',
    description: 'A developer blog platform with markdown support, categories, and dark mode.',
    tech_stack: ['HTML', 'CSS', 'JavaScript'],
    image_url: '/images/projects/devnotes-blog.svg',
    live_url: '#',
    github_url: '',
    category: 'General'
  },
  {
    id: 5,
    title: 'Harbour Events',
    description: 'An event management platform for booking and managing corporate events.',
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    image_url: '/images/projects/harbour-events.svg',
    live_url: '#',
    github_url: '',
    category: 'Wedding'
  },
  {
    id: 6,
    title: 'AutoVibe',
    description: 'A modern automotive showcase website with animated car gallery and booking system.',
    tech_stack: ['HTML', 'CSS', 'JavaScript'],
    image_url: '/images/projects/Autovibe.png',
    live_url: '#',
    github_url: '',
    category: 'Business'
  }
];

// ── DEFAULT SKILLS (seeded into localStorage on first load) ──
const DEFAULT_SKILLS = [
  { id: 1, skill_name: 'HTML5',       category: 'Frontend',        proficiency: 95, icon_url: '' },
  { id: 2, skill_name: 'CSS3',        category: 'Frontend',        proficiency: 90, icon_url: '' },
  { id: 3, skill_name: 'JavaScript',  category: 'Frontend',        proficiency: 88, icon_url: '' },
  { id: 4, skill_name: 'React',       category: 'Frontend',        proficiency: 80, icon_url: '' },
  { id: 5, skill_name: 'PHP',         category: 'Backend',         proficiency: 82, icon_url: '' },
  { id: 6, skill_name: 'MySQL',       category: 'Backend',         proficiency: 78, icon_url: '' },
  { id: 7, skill_name: 'Node.js',     category: 'Backend',         proficiency: 75, icon_url: '' },
  { id: 8, skill_name: 'Git',         category: 'DevOps & Tooling', proficiency: 85, icon_url: '' },
  { id: 9, skill_name: 'VS Code',     category: 'DevOps & Tooling', proficiency: 95, icon_url: '' },
  { id: 10, skill_name: 'Linux',      category: 'DevOps & Tooling', proficiency: 70, icon_url: '' }
];
