-- ============================================================
-- SUPABASE SETUP SCRIPT — dev.folio Portfolio
-- ============================================================
-- Run this ONCE in the Supabase SQL Editor:
-- Dashboard → SQL Editor → New Query → paste & run
-- ============================================================

-- ── 1. Create Tables ─────────────────────────────────────────

create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  tech_stack text[],
  image_url text,
  live_url text,
  github_url text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists skills (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  icon_url text,
  proficiency integer,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  sender_name text not null,
  sender_email text not null,
  message text not null,
  is_read boolean default false,
  email_status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ── 2. Enable Row Level Security ────────────────────────────

alter table projects enable row level security;
alter table skills    enable row level security;
alter table messages  enable row level security;

-- ── 3. RLS Policies — authenticated users get full access ──

-- Projects
create policy "Allow authenticated access"
on projects for all
to authenticated
using (true)
with check (true);

-- Skills
create policy "Allow authenticated access"
on skills for all
to authenticated
using (true)
with check (true);

-- Messages (full access for authenticated admin)
create policy "Allow authenticated access"
on messages for all
to authenticated
using (true)
with check (true);

-- Messages (public INSERT so visitors can submit contact form)
create policy "Allow public insert"
on messages for insert
to anon
with check (true);

-- ── 4. Seed Default Projects ─────────────────────────────────

insert into projects (title, description, tech_stack, image_url, live_url, github_url, category)
values
  (
    'Business Website',
    'A professional business website built for a local company showcasing services and contact info.',
    array['HTML', 'CSS', 'JavaScript'],
    '/images/projects/Business website.png',
    '#', '', 'Business'
  ),
  (
    'Tolu & Dami Wedding',
    'A beautiful wedding website for a couple, featuring event details, RSVP, and photo gallery.',
    array['HTML', 'CSS', 'JavaScript'],
    '/images/projects/tolu-dami-wedding.svg',
    '#', '', 'Wedding'
  ),
  (
    'Greenroots Store',
    'An e-commerce store for organic products with cart, product listings, and checkout flow.',
    array['HTML', 'CSS', 'JavaScript', 'PHP'],
    '/images/projects/greenroots-store.svg',
    '#', '', 'Business'
  ),
  (
    'DevNotes Blog',
    'A developer blog platform with markdown support, categories, and dark mode.',
    array['HTML', 'CSS', 'JavaScript'],
    '/images/projects/devnotes-blog.svg',
    '#', '', 'General'
  ),
  (
    'Harbour Events',
    'An event management platform for booking and managing corporate events.',
    array['HTML', 'CSS', 'JavaScript', 'PHP'],
    '/images/projects/harbour-events.svg',
    '#', '', 'Wedding'
  ),
  (
    'AutoVibe',
    'A modern automotive showcase website with animated car gallery and booking system.',
    array['HTML', 'CSS', 'JavaScript'],
    '/images/projects/Autovibe.png',
    '#', '', 'Business'
  );

-- ── 5. Seed Default Skills ───────────────────────────────────

insert into skills (name, category, proficiency, icon_url)
values
  ('HTML5',      'Frontend',         95, ''),
  ('CSS3',       'Frontend',         90, ''),
  ('JavaScript', 'Frontend',         88, ''),
  ('React',      'Frontend',         80, ''),
  ('PHP',        'Backend',          82, ''),
  ('MySQL',      'Backend',          78, ''),
  ('Node.js',    'Backend',          75, ''),
  ('Git',        'DevOps & Tooling', 85, ''),
  ('VS Code',    'DevOps & Tooling', 95, ''),
  ('Linux',      'DevOps & Tooling', 70, '');

-- ── Done! ────────────────────────────────────────────────────
-- Check your data in Table Editor → projects / skills / messages
-- The contact form will now write to 'messages' automatically.
