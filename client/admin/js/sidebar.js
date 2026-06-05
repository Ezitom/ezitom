/**
 * sidebar.js — Injects sidebar + topbar into every admin page
 * and handles mobile toggle & unread badge.
 */

function getAdminPath(subPath) {
  const currentUrl = window.location.href;
  if (currentUrl.includes('/client/admin/')) {
    // Local Live Server / static files
    if (subPath === '/') return 'dashboard.html';
    if (subPath === '/projects/') return 'projects.html';
    if (subPath === '/skills/') return 'skills.html';
    if (subPath === '/messages/') return 'messages.html';
    return subPath.replace(/^\//, '');
  } else {
    // Production clean routes
    const isGithubPages = window.location.pathname.includes('/ezitom/');
    const base = isGithubPages ? '/ezitom' : '';
    return `${base}/admin${subPath}`;
  }
}

function renderSidebar(activePage) {
  const unread = getUnreadCount ? getUnreadCount() : 0;
  const isGithubPages = window.location.pathname.includes('/ezitom/');
  const portfolioUrl = isGithubPages ? '/ezitom/' : '/';

  const html = `
    <!-- Mobile topbar -->
    <div class="topbar" id="topbar">
      <span class="topbar-logo">dev.folio Admin</span>
      <button class="hamburger-btn" id="hamburgerBtn" aria-label="Open menu">
        <i class="fas fa-bars"></i>
      </button>
    </div>

    <!-- Sidebar overlay (mobile) -->
    <div class="sidebar-overlay" id="sidebarOverlay"></div>

    <!-- Sidebar -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <i class="fas fa-code" style="font-size:1.1rem;"></i>
          dev.folio
        </div>
        <div class="sidebar-subtitle">Admin Dashboard</div>
      </div>

      <nav class="sidebar-nav">
        <ul>
          <li>
            <a href="${getAdminPath('/')}" class="nav-link ${activePage==='dashboard'?'active':''}" >
              <i class="fas fa-tachometer-alt"></i> Dashboard
            </a>
          </li>
          <li>
            <a href="${getAdminPath('/projects/')}" class="nav-link ${activePage==='projects'?'active':''}">
              <i class="fas fa-project-diagram"></i> Projects
            </a>
          </li>
          <li>
            <a href="${getAdminPath('/skills/')}" class="nav-link ${activePage==='skills'?'active':''}">
              <i class="fas fa-code"></i> Skills
            </a>
          </li>
          <li>
            <a href="${getAdminPath('/messages/')}" class="nav-link ${activePage==='messages'?'active':''}">
              <i class="fas fa-envelope"></i> Messages
              ${unread > 0 ? `<span class="badge-count">${unread}</span>` : ''}
            </a>
          </li>
        </ul>

        <ul style="margin-top:auto; padding-top:2rem; border-top:1px solid var(--border); margin-top:1rem;">
          <li>
            <a href="${portfolioUrl}" class="nav-link" target="_blank">
              <i class="fas fa-external-link-alt"></i> View Portfolio
            </a>
          </li>
          <li>
            <a href="#" class="nav-link danger" id="logoutLink">
              <i class="fas fa-sign-out-alt"></i> Logout
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  `;

  // Insert before main content
  document.body.insertAdjacentHTML('afterbegin', html);

  // Mobile toggle logic
  const btn     = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('open');
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  }

  btn?.addEventListener('click', openSidebar);
  overlay?.addEventListener('click', closeSidebar);

  // Logout
  document.getElementById('logoutLink').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
  });
}
