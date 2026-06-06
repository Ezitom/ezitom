/**
 * backend-api.js — Portfolio Data Layer (Supabase)
 * =================================================
 * Fetches projects and skills from Supabase for public portfolio pages.
 * Falls back to hardcoded data if Supabase is unavailable.
 */

const SUPABASE_URL      = 'https://myaemfxmgsetrnnaeynv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15YWVtZnhtZ3NldHJubmFleW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2Nzc4NTEsImV4cCI6MjA5NjI1Mzg1MX0.cK0jSzJbKnGTXeJJV9Q6CKrNfuHUJOeqKtnZrW_t0aM';

// ── Hardcoded fallback data (used if Supabase is unavailable) ──
const FALLBACK_PROJECTS = [
  {
    id: '1',
    title: 'Business Website',
    description: 'A professional business website built for a local company showcasing services and contact info.',
    tech_stack: ['HTML', 'CSS', 'JavaScript'],
    image_url: 'images/projects/Business website.png',
    live_url: '#',
    github_url: '',
    category: 'Business'
  },
  {
    id: '2',
    title: 'Tolu & Dami Wedding',
    description: 'A beautiful wedding website for a couple, featuring event details, RSVP, and photo gallery.',
    tech_stack: ['HTML', 'CSS', 'JavaScript'],
    image_url: 'images/projects/tolu-dami-wedding.svg',
    live_url: '#',
    github_url: '',
    category: 'Wedding'
  },
  {
    id: '3',
    title: 'Greenroots Store',
    description: 'An e-commerce store for organic products with cart, product listings, and checkout flow.',
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    image_url: 'images/projects/greenroots-store.svg',
    live_url: '#',
    github_url: '',
    category: 'Business'
  },
  {
    id: '4',
    title: 'DevNotes Blog',
    description: 'A developer blog platform with markdown support, categories, and dark mode.',
    tech_stack: ['HTML', 'CSS', 'JavaScript'],
    image_url: 'images/projects/devnotes-blog.svg',
    live_url: '#',
    github_url: '',
    category: 'General'
  },
  {
    id: '5',
    title: 'Harbour Events',
    description: 'An event management platform for booking and managing corporate events.',
    tech_stack: ['HTML', 'CSS', 'JavaScript', 'PHP'],
    image_url: 'images/projects/harbour-events.svg',
    live_url: '#',
    github_url: '',
    category: 'Wedding'
  },
  {
    id: '6',
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
  { id: '1', name: 'HTML5',      category: 'Frontend',         proficiency: 95 },
  { id: '2', name: 'CSS3',       category: 'Frontend',         proficiency: 90 },
  { id: '3', name: 'JavaScript', category: 'Frontend',         proficiency: 88 },
  { id: '4', name: 'React',      category: 'Frontend',         proficiency: 80 },
  { id: '5', name: 'PHP',        category: 'Backend',          proficiency: 82 },
  { id: '6', name: 'MySQL',      category: 'Backend',          proficiency: 78 },
  { id: '7', name: 'Node.js',    category: 'Backend',          proficiency: 75 },
  { id: '8', name: 'Git',        category: 'DevOps & Tooling', proficiency: 85 },
  { id: '9', name: 'VS Code',    category: 'DevOps & Tooling', proficiency: 95 },
  { id: '10', name: 'Linux',     category: 'DevOps & Tooling', proficiency: 70 },
];

// ── Utility ──────────────────────────────────────────────────
function escHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ── Initialise public Supabase client ────────────────────────
function getPublicSupabase() {
  if (window._publicSupabase) return window._publicSupabase;
  if (!window.supabase) return null;
  window._publicSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return window._publicSupabase;
}

// ── Projects Loader ───────────────────────────────────────────
async function loadProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  // Show loading skeleton
  grid.innerHTML = `
    <div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:1rem;padding:3rem;color:var(--text-muted);">
      <div style="width:40px;height:40px;border:3px solid rgba(255,255,255,0.1);border-top-color:var(--accent,#00d4c8);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
      <span>Loading projects…</span>
    </div>
    <style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;

  let projects = null;

  // Try Supabase
  try {
    const sb = getPublicSupabase();
    if (sb) {
      const { data, error } = await sb
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length) {
        projects = data;
        console.log('[dev.folio] Projects loaded from Supabase.');
      }
    }
  } catch (e) {
    console.warn('[dev.folio] Supabase unavailable, using fallback projects.');
  }

  // Use hardcoded fallback
  if (!projects || !projects.length) {
    projects = FALLBACK_PROJECTS;
    console.log('[dev.folio] Using fallback projects.');
  }

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

  // Re-apply filter after projects load
  const activeFilter = document.querySelector('.filter-btn.active');
  if (activeFilter) {
    const cat = activeFilter.getAttribute('data-cat');
    document.querySelectorAll('.project-card').forEach(card => {
      card.style.display = (cat === 'all' || card.getAttribute('data-cat') === cat) ? 'flex' : 'none';
    });
  }
}

// ── Skills Loader ─────────────────────────────────────────────
async function loadSkills() {
  const container = document.getElementById('skills-container');
  if (!container) return;

  // Show loading
  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;padding:3rem;color:var(--text-muted);">
      <div style="width:40px;height:40px;border:3px solid rgba(255,255,255,0.1);border-top-color:var(--accent,#00d4c8);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
      <span>Loading skills…</span>
    </div>`;

  let skillsArr = null;

  // Try Supabase
  try {
    const sb = getPublicSupabase();
    if (sb) {
      const { data, error } = await sb
        .from('skills')
        .select('*')
        .order('created_at', { ascending: true });
      if (!error && data && data.length) {
        skillsArr = data;
        console.log('[dev.folio] Skills loaded from Supabase.');
      }
    }
  } catch (e) {
    console.warn('[dev.folio] Supabase unavailable, using fallback skills.');
  }

  // Use hardcoded fallback
  if (!skillsArr || !skillsArr.length) {
    skillsArr = FALLBACK_SKILLS;
    console.log('[dev.folio] Using fallback skills.');
  }

  // Group by category
  const skills = skillsArr.reduce((acc, s) => {
    const cat = s.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {});

  let html = '<div class="skills-grid">';
  for (const [category, catSkills] of Object.entries(skills)) {
    html += `
      <div class="skill-card reveal">
        <h3 class="mono">${escHtml(category)}</h3>
        <div class="skill-list">
          ${catSkills.map(s => `
            <div class="skill-bar-row">
              <div class="skill-bar-info">
                <span>${escHtml(s.name || s.skill_name)}</span>
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
