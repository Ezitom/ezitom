/**
 * data.js - Supabase Data Layer
 * ================================
 * All reads/writes go to Supabase. No localStorage for data.
 * Requires window.supabaseClient (initialised by supabaseClient.js).
 */

const db = () => window.supabaseClient;

// ── Projects ───────────────────────────────────────────────
async function getProjects() {
  const { data, error } = await db().from('projects').select('*').order('created_at', { ascending: false });
  if (error) { console.error('[data] getProjects:', error); return []; }
  return data || [];
}

async function addProject(project) {
  // Remove any stale id so Supabase generates a UUID
  const { id: _id, ...payload } = project;
  const { data, error } = await db().from('projects').insert([payload]).select().single();
  if (error) { console.error('[data] addProject:', error); throw error; }
  return data;
}

async function updateProject(id, updates) {
  const { id: _id, created_at: _ca, ...payload } = updates;
  const { data, error } = await db().from('projects').update(payload).eq('id', id).select().single();
  if (error) { console.error('[data] updateProject:', error); throw error; }
  return data;
}

async function deleteProject(id) {
  const { error } = await db().from('projects').delete().eq('id', id);
  if (error) { console.error('[data] deleteProject:', error); throw error; }
}

// ── Skills ─────────────────────────────────────────────────
async function getSkills() {
  const { data, error } = await db().from('skills').select('*').order('created_at', { ascending: true });
  if (error) { console.error('[data] getSkills:', error); return []; }
  return data || [];
}

async function addSkill(skill) {
  const { id: _id, ...payload } = skill;
  const { data, error } = await db().from('skills').insert([payload]).select().single();
  if (error) { console.error('[data] addSkill:', error); throw error; }
  return data;
}

async function updateSkill(id, updates) {
  const { id: _id, created_at: _ca, ...payload } = updates;
  const { data, error } = await db().from('skills').update(payload).eq('id', id).select().single();
  if (error) { console.error('[data] updateSkill:', error); throw error; }
  return data;
}

async function deleteSkill(id) {
  const { error } = await db().from('skills').delete().eq('id', id);
  if (error) { console.error('[data] deleteSkill:', error); throw error; }
}

// ── Messages ───────────────────────────────────────────────
async function getMessages() {
  const { data, error } = await db().from('messages').select('*').order('created_at', { ascending: false });
  if (error) { console.error('[data] getMessages:', error); return []; }
  return data || [];
}

async function markMessageRead(id) {
  const { error } = await db().from('messages').update({ is_read: true }).eq('id', id);
  if (error) { console.error('[data] markMessageRead:', error); throw error; }
}

async function deleteMessage(id) {
  const { error } = await db().from('messages').delete().eq('id', id);
  if (error) { console.error('[data] deleteMessage:', error); throw error; }
}

async function getUnreadCount() {
  const { count, error } = await db()
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .eq('is_read', false);
  if (error) { console.error('[data] getUnreadCount:', error); return 0; }
  return count || 0;
}
