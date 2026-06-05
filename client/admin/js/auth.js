/**
 * auth.js — Admin Authentication Helpers (Supabase)
 * ===================================================
 * All auth state is validated against the live Supabase session.
 * localStorage 'adminAuth' is kept only as a fast UI hint.
 */

function getLoginRedirectUrl() {
  const currentUrl = window.location.href;
  if (currentUrl.includes('/client/admin/')) {
    return 'login.html';
  }
  const isGithubPages = window.location.pathname.includes('/ezitom/');
  const base = isGithubPages ? '/ezitom' : '';
  return `${base}/admin/login/`;
}

function getDashboardUrl() {
  const currentUrl = window.location.href;
  if (currentUrl.includes('/client/admin/')) return 'dashboard.html';
  const isGhPages = window.location.pathname.includes('/ezitom/');
  return (isGhPages ? '/ezitom' : '') + '/admin/';
}

/**
 * requireAuth — call at the top of every protected page.
 * Usage: requireAuth(function() { /* page init code *\/ });
 * If the Supabase session is missing the user is redirected to login.
 */
function requireAuth(onSuccess) {
  if (!window.supabaseClient) {
    // Supabase not ready — hard redirect to be safe
    window.location.href = getLoginRedirectUrl();
    return;
  }
  window.supabaseClient.auth.getSession().then(function (_ref) {
    var session = (_ref.data || {}).session;
    if (session) {
      localStorage.setItem('adminAuth', 'true');
      if (typeof onSuccess === 'function') onSuccess();
    } else {
      localStorage.removeItem('adminAuth');
      window.location.href = getLoginRedirectUrl();
    }
  }).catch(function () {
    window.location.href = getLoginRedirectUrl();
  });
}

/**
 * isAuthenticated — fast localStorage check (used for instant UI hints only).
 * Never used as a security gate — requireAuth() is the real guard.
 */
function isAuthenticated() {
  return localStorage.getItem('adminAuth') === 'true';
}

/**
 * logout — signs out of Supabase and clears local state.
 */
function logout() {
  if (window.supabaseClient) {
    window.supabaseClient.auth.signOut().finally(function () {
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('admin_remember');
      window.location.href = getLoginRedirectUrl();
    });
  } else {
    localStorage.removeItem('adminAuth');
    window.location.href = getLoginRedirectUrl();
  }
}
