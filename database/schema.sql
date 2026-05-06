-- ============================================================
-- AI BLOG PLATFORM — SUPABASE DATABASE SCHEMA
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Enable Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  description text,
  color text default '#6366f1',
  icon text,
  post_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- TAGS
-- ============================================================
create table if not exists tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  slug text unique not null,
  post_count integer default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- POSTS
-- ============================================================
create table if not exists posts (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  slug text unique not null,
  excerpt text,
  content text not null,
  meta_title text,
  meta_description text,
  og_image text,
  featured_image text,
  author text default 'AIScribe Team',
  author_avatar text,
  category_id uuid references categories(id) on delete set null,
  tags text[] default '{}',
  reading_time integer default 5,
  status text default 'draft' check (status in ('draft','published','archived')),
  language text default 'en',
  views integer default 0,
  seo_score integer default 0,
  schema_json jsonb,
  faqs_json jsonb,
  toc_json jsonb,
  social_caption text,
  internal_links text[] default '{}',
  related_post_ids uuid[] default '{}',
  ai_model_used text,
  tokens_used integer default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Full text search index
create index if not exists posts_fts_idx on posts
  using gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(excerpt,'') || ' ' || coalesce(content,'')));
create index if not exists posts_slug_idx on posts(slug);
create index if not exists posts_status_idx on posts(status);
create index if not exists posts_published_at_idx on posts(published_at desc);
create index if not exists posts_category_idx on posts(category_id);

-- ============================================================
-- TRENDING TOPICS
-- ============================================================
create table if not exists trending_topics (
  id uuid default uuid_generate_v4() primary key,
  keyword text not null,
  trend_score integer default 0,
  source text not null,
  difficulty text default 'medium' check (difficulty in ('low','medium','high')),
  cpc_estimate numeric(10,2) default 0,
  search_volume integer default 0,
  status text default 'pending' check (status in ('pending','processing','done','failed','skipped')),
  post_id uuid references posts(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists trending_topics_status_idx on trending_topics(status);
create index if not exists trending_topics_score_idx on trending_topics(trend_score desc);

-- ============================================================
-- AUTOMATION LOGS
-- ============================================================
create table if not exists automation_logs (
  id uuid default uuid_generate_v4() primary key,
  type text not null,
  status text not null check (status in ('running','success','failed','skipped')),
  message text,
  api_used text,
  tokens_used integer default 0,
  duration_ms integer default 0,
  metadata jsonb,
  created_at timestamptz default now()
);

create index if not exists automation_logs_type_idx on automation_logs(type);
create index if not exists automation_logs_created_idx on automation_logs(created_at desc);

-- ============================================================
-- ANALYTICS
-- ============================================================
create table if not exists analytics (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade,
  date date not null default current_date,
  views integer default 0,
  unique_visitors integer default 0,
  avg_time_on_page integer default 0,
  bounce_rate numeric(5,2) default 0,
  organic_traffic integer default 0,
  referrer text,
  country text,
  created_at timestamptz default now(),
  unique(post_id, date, referrer)
);

create index if not exists analytics_post_date_idx on analytics(post_id, date);

-- ============================================================
-- NEWSLETTER SUBSCRIBERS
-- ============================================================
create table if not exists newsletter_subscribers (
  id uuid default uuid_generate_v4() primary key,
  email text unique not null,
  name text,
  confirmed boolean default false,
  unsubscribed boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- COMMENTS
-- ============================================================
create table if not exists comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references posts(id) on delete cascade,
  author_name text not null,
  author_email text not null,
  content text not null,
  approved boolean default false,
  parent_id uuid references comments(id) on delete cascade,
  created_at timestamptz default now()
);

create index if not exists comments_post_idx on comments(post_id);

-- ============================================================
-- SEED CATEGORIES
-- ============================================================
insert into categories (name, slug, description, color, icon) values
  ('Artificial Intelligence', 'artificial-intelligence', 'Latest AI breakthroughs and tutorials', '#6366f1', 'Brain'),
  ('Web Development', 'web-development', 'Modern web development guides and tips', '#0ea5e9', 'Code2'),
  ('Machine Learning', 'machine-learning', 'ML algorithms, models, and applications', '#8b5cf6', 'Cpu'),
  ('Developer Tools', 'developer-tools', 'Best tools for modern developers', '#10b981', 'Wrench'),
  ('Tech News', 'tech-news', 'Latest technology news and trends', '#f59e0b', 'Newspaper'),
  ('Tutorials', 'tutorials', 'Step-by-step beginner-friendly guides', '#ec4899', 'BookOpen')
on conflict (slug) do nothing;

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_posts_updated_at before update on posts
  for each row execute function update_updated_at_column();

create trigger update_categories_updated_at before update on categories
  for each row execute function update_updated_at_column();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table posts enable row level security;
alter table categories enable row level security;
alter table tags enable row level security;
alter table trending_topics enable row level security;
alter table automation_logs enable row level security;
alter table analytics enable row level security;
alter table newsletter_subscribers enable row level security;
alter table comments enable row level security;

-- Public read for published posts
create policy "Public can read published posts" on posts
  for select using (status = 'published');

-- Public read categories & tags
create policy "Public can read categories" on categories for select using (true);
create policy "Public can read tags" on tags for select using (true);

-- Public can read approved comments
create policy "Public can read approved comments" on comments
  for select using (approved = true);

-- Public can insert comments (pending approval)
create policy "Public can submit comments" on comments
  for insert with check (true);

-- Public can subscribe to newsletter
create policy "Public can subscribe" on newsletter_subscribers
  for insert with check (true);

-- Analytics: public insert (for page view tracking)
create policy "Public can track views" on analytics
  for insert with check (true);

-- Service role has full access (automation system uses service role)
-- These are handled automatically by Supabase service role bypass
