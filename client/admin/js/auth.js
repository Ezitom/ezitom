/**
 * auth.js — Admin Authentication Helpers
 * Uses localStorage 'adminAuth' key only. No API calls.
 */

function isAuthenticated() {
  return localStorage.getItem('adminAuth') === 'true';
}

function getLoginRedirectUrl() {
  const currentUrl = window.location.href;
  if (currentUrl.includes('/client/admin/')) {
    // Local Live Server / static files
    return 'login.html';
  } else {
    // Production clean routes
    const isGithubPages = window.location.pathname.includes('/ezitom/');
    const base = isGithubPages ? '/ezitom' : '';
    return `${base}/admin/login/`;
  }
}

function logout() {
  localStorage.removeItem('adminAuth');
  localStorage.removeItem('admin_remember');
  window.location.href = getLoginRedirectUrl();
}

function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = getLoginRedirectUrl();
    return false;
  }
  return true;
}
