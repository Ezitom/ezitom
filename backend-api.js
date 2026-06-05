/**
 * backend-api.js — Portfolio Data Layer
 * =======================================
 * Reads from localStorage first (set by admin dashboard).
 * Falls back to PHP backend API if nothing is in localStorage.
 */

const API_BASE = 'backend/api';

// ── Hardcoded fallback data (used if both localStorage and API fail) ──
const FALLBACK_PROJECTS = [
  {
    id: 1,
    title: 'Business Website',
    description: 'A professional business website built for a local company showcasing services and contact info.',
    tech_stack: ['HTML', 'CSS', 'JavaScript'],
    image_url: 'images/projects/Business website.png',
    live_url: '#',
    github_url: '',
    category: 'Business'
  },
  {
    id: 2,
    title: 'Tolu & Dami Wedding',
    description: 'A beautiful wedding website for a couple, featuring event details, RSVP, and photo gallery.',
    tech_stack: ['HTML', 'CSS', 'JavaScript'],
    image_url: 'images/projects/tolu-dami-wedding.svg',
    live_url: '#',
    github_url: '',
    category: 'Wedding'
  },
  {
    id: 3,
    title: 'Greenroots Store',
    description: 'An e-commerce store for organic products with cart, product listings, and checkout flow.',
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    image_url: 'images/projects/greenroots-store.svg',
    live_url: '#',
    github_url: '',
    category: 'Business'
  },
  {
    id: 4,
    title: 'DevNotes Blog',
    description: 'A developer blog platform with markdown support, categories, and dark mode.',
    tech_stack: ['HTML', 'CSS', 'JavaScript'],
    image_url: 'images/projects/devnotes-blog.svg',
    live_url: '#',
    github_url: '',
    category: 'General'
  },
  {
    id: 5,
    title: 'Harbour Events',
    description: 'An event management platform for booking and managing corporate events.',
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    image_url: 'images/projects/harbour-events.svg',
    live_url: '#',
    github_url: '',
    category: 'Wedding'
  },
  {
    id: 6,
    title: 'AutoVibe',
    description: 'A modern automotive showcase website with animated car gallery and booking system.',
    tech_stack: ['HTML', 'CSS', 'JavaScript'],
    image_url: 'images/projects/Autovibe.png',
    live_url: '#',
    github_url: '',
    category: 'Business'
  }
];

const FALLBACK_SKILLS = [
  { id: 1, skill_name: 'HTML5',      category: 'Frontend',         proficiency: 95 },
  { id: 2, skill_name: 'CSS3',       category: 'Frontend',         proficiency: 90 },
  { id: 3, skill_name: 'JavaScript', category: 'Frontend',         proficiency: 88 },
  { id: 4, skill_name: 'React',      category: 'Frontend',         proficiency: 80 },
  { id: 5, skill_name: 'PHP',        category: 'Backend',          proficiency: 82 },
  { id: 6, skill_name: 'MySQL',      category: 'Backend',          proficiency: 78 },
  { id: 7, skill_name: 'Node.js',    category: 'Backend',          proficiency: 75 },
  { id: 8, skill_name: 'Git',        category: 'DevOps & Tooling', proficiency: 85 },
  { id: 9, skill_name: 'VS Code',    category: 'DevOps & Tooling', proficiency: 95 },
  { id: 10, skill_name: 'Linux',     category: 'DevOps & Tooling', proficiency: 70 },
];

// ── Utility ──────────────────────────────────────────────────
function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}


// ── Projects Loader ───────────────────────────────────────────
async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  let projects = null;

  // 1. Try localStorage first (admin dashboard data)
  const stored = localStorage.getItem('portfolio_projects');
  if (stored) {
    try {
      projects = JSON.parse(stored);
      console.log('[dev.folio] Projects loaded from localStorage.');
    } catch (e) { projects = null; }
  }

  // 2. Try backend API
  if (!projects) {
    try {
      const res    = await fetch(`${API_BASE}/projects.php`);
      const result = await res.json();
      if (result.success && result.data) {
        projects = result.data;
        console.log('[dev.folio] Projects loaded from API.');
      }
    } catch (e) {
      console.warn('[dev.folio] API unavailable, using fallback projects.');
    }
  }

  // 3. Use hardcoded fallback
  if (!projects) projects = FALLBACK_PROJECTS;

  if (!projects.length) {
    grid.innerHTML = '<p class="text-muted">No projects available yet.</p>';
    return;
  }

  grid.innerHTML = projects.map(p => {
    const normalizedCat = p.category === 'Events & Wedding' ? 'Wedding' : (p.category || 'General');
    return `
      <div class="project-card reveal" data-cat="${escHtml(normalizedCat)}">
        <div class="project-thumb">
          <img src="${escHtml(p.image_url)}" alt="${escHtml(p.title)}" class="project-thumb-img"
               onerror="this.style.display='none'">
          <span class="project-cat-pill">${escHtml(normalizedCat)}</span>
        </div>
        <div class="project-content">
          <div class="project-tags">
            ${(p.tech_stack || []).map(t => `<span>${escHtml(t)}</span>`).join('')}
          </div>
          <h3>${escHtml(p.title)}</h3>
          <p class="project-copy">${escHtml(p.description)}</p>
          <div class="project-links">
            ${p.live_url && p.live_url !== '#' ? `<a href="${escHtml(p.live_url)}" target="_blank" class="btn btn-filled project-link live">Live Site &rarr;</a>` : ''}
            ${p.github_url ? `<a href="${escHtml(p.github_url)}" target="_blank" class="btn btn-outlined project-link">GitHub</a>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Re-trigger animations
  if (window.observer) {
    grid.querySelectorAll('.reveal').forEach(el => window.observer.observe(el));
  }
}

// ── Skills Loader ─────────────────────────────────────────────
async function loadSkills() {
  const container = document.getElementById('skills-container');
  if (!container) return;

  let skills = null;

  // 1. Try localStorage first
  const stored = localStorage.getItem('portfolio_skills');
  if (stored) {
    try {
      const arr = JSON.parse(stored);
      // Group by category
      skills = arr.reduce((acc, s) => {
        if (!acc[s.category]) acc[s.category] = [];
        acc[s.category].push(s);
        return acc;
      }, {});
      console.log('[dev.folio] Skills loaded from localStorage.');
    } catch (e) { skills = null; }
  }

  // 2. Try backend API
  if (!skills) {
    try {
      const res    = await fetch(`${API_BASE}/skills.php`);
      const result = await res.json();
      if (result.success && result.data) {
        skills = result.data;
        console.log('[dev.folio] Skills loaded from API.');
      }
    } catch (e) {
      console.warn('[dev.folio] API unavailable, using fallback skills.');
    }
  }

  // 3. Use hardcoded fallback (grouped)
  if (!skills) {
    skills = FALLBACK_SKILLS.reduce((acc, s) => {
      if (!acc[s.category]) acc[s.category] = [];
      acc[s.category].push(s);
      return acc;
    }, {});
  }

  let html = '<div class="skills-grid">';
  for (const [category, catSkills] of Object.entries(skills)) {
    html += `
      <div class="skill-card reveal">
        <h3 class="mono">${escHtml(category)}</h3>
        <div class="skill-list">
          ${catSkills.map(s => `
            <div class="skill-bar-row">
              <div class="skill-bar-info">
                <span>${escHtml(s.skill_name)}</span>
                <span>${s.proficiency}%</span>
              </div>
              <div class="skill-bar-bg">
                <div class="skill-bar-fill" data-width="${s.proficiency}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  html += '</div>';
  container.innerHTML = html;

  if (window.observer) {
    container.querySelectorAll('.reveal').forEach(el => window.observer.observe(el));
  }
  if (window.skillObserver) {
    container.querySelectorAll('.skill-bar-fill').forEach(el => window.skillObserver.observe(el));
  }
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  loadSkills();
});
