/**
 * supabaseClient.js — Supabase Auth Client
 * ==========================================
 * Loaded AFTER the Supabase CDN script.
 * Exposes `window.supabaseClient` for use in all admin pages.
 *
 * ⚠️  SETUP REQUIRED:
 *   1. Go to https://supabase.com and create a free project.
 *   2. In the Supabase dashboard go to Project Settings → API.
 *   3. Copy "Project URL" and "anon public" key and paste below.
 *   4. Go to Authentication → Users → Add User and create your admin account.
 *   5. Go to Authentication → Settings → disable "Enable email confirmations"
 *      and disable "Enable Sign Ups".
 *   6. Go to Authentication → URL Configuration → add this to Redirect URLs:
 *      https://ezitom.github.io/ezitom/admin/reset-password/
 */

(function () {
  const SUPABASE_URL      = 'YOUR_SUPABASE_PROJECT_URL';   // e.g. https://abcdefgh.supabase.co
  const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';      // long JWT starting with eyJ...

  if (!window.supabase) {
    console.error('[admin] Supabase CDN not loaded. Check network connection.');
    return;
  }

  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('%c ✓ Supabase client initialised', 'color:#5dd9c1; font-weight:bold;');
})();
