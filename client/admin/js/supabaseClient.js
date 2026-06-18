  /**
 * supabaseClient.js - Supabase Auth Client
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
  const SUPABASE_URL      = 'https://myaemfxmgsetrnnaeynv.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15YWVtZnhtZ3NldHJubmFleW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2Nzc4NTEsImV4cCI6MjA5NjI1Mzg1MX0.cK0jSzJbKnGTXeJJV9Q6CKrNfuHUJOeqKtnZrW_t0aM';

  if (!window.supabase) {
    console.error('[admin] Supabase CDN not loaded. Check network connection.');
    return;
  }

  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('%c ✓ Supabase client initialised', 'color:#5dd9c1; font-weight:bold;');
})();
