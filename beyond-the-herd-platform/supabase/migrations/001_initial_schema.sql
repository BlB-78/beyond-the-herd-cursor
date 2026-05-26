-- Beyond The Herd — Supabase schema

create extension if not exists "pgcrypto";

-- Profiles (extends auth.users)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  bio text default '',
  location text default '',
  phone text default '',
  photo_url text default '',
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  instructor text,
  price numeric not null default 0,
  image_url text,
  created_at timestamptz not null default now()
);

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  order_idx int not null default 0
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references public.sections (id) on delete cascade,
  title text not null,
  video_url text,
  duration text,
  order_idx int not null default 0
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  user_name text,
  created_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index idx_sections_course on public.sections (course_id, order_idx);
create index idx_lessons_section on public.lessons (section_id, order_idx);
create index idx_enrollments_user on public.enrollments (user_id);
create index idx_reviews_course on public.reviews (course_id);
create index idx_progress_user on public.progress (user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'User'),
    coalesce(new.email, ''),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin helper for RLS
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.sections enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.reviews enable row level security;
alter table public.progress enable row level security;

-- Profiles
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own_or_admin"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (
    auth.uid() = id
    or public.is_admin()
  );

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Courses (public read)
create policy "courses_select_all"
  on public.courses for select using (true);

create policy "courses_insert_admin"
  on public.courses for insert with check (public.is_admin());

create policy "courses_update_admin"
  on public.courses for update using (public.is_admin());

create policy "courses_delete_admin"
  on public.courses for delete using (public.is_admin());

-- Sections & lessons (public read)
create policy "sections_select_all"
  on public.sections for select using (true);

create policy "sections_insert_admin"
  on public.sections for insert with check (public.is_admin());

create policy "sections_update_admin"
  on public.sections for update using (public.is_admin());

create policy "sections_delete_admin"
  on public.sections for delete using (public.is_admin());

create policy "lessons_select_all"
  on public.lessons for select using (true);

create policy "lessons_insert_admin"
  on public.lessons for insert with check (public.is_admin());

create policy "lessons_update_admin"
  on public.lessons for update using (public.is_admin());

create policy "lessons_delete_admin"
  on public.lessons for delete using (public.is_admin());

-- Enrollments
create policy "enrollments_select_own_or_admin"
  on public.enrollments for select
  using (auth.uid() = user_id or public.is_admin());

create policy "enrollments_insert_own"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

create policy "enrollments_delete_admin"
  on public.enrollments for delete using (public.is_admin());

-- Reviews
create policy "reviews_select_all"
  on public.reviews for select using (true);

create policy "reviews_insert_enrolled"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.enrollments e
      where e.user_id = auth.uid() and e.course_id = course_id
    )
  );

create policy "reviews_update_own"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "reviews_delete_admin"
  on public.reviews for delete using (public.is_admin());

-- Progress
create policy "progress_select_own_or_admin"
  on public.progress for select
  using (auth.uid() = user_id or public.is_admin());

create policy "progress_insert_own"
  on public.progress for insert
  with check (auth.uid() = user_id);

create policy "progress_delete_admin"
  on public.progress for delete using (public.is_admin());

-- Seed sample courses (run once on fresh DB)
do $$
declare
  c1 uuid;
  c2 uuid;
  s1 uuid;
  s2 uuid;
begin
  if exists (select 1 from public.courses limit 1) then
    return;
  end if;

  insert into public.courses (title, description, instructor, price, image_url)
  values (
    'Forex Fundamentals',
    'Complete guide to starting with Forex trading.',
    'Alex Turner',
    49.99,
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=800'
  )
  returning id into c1;

  insert into public.courses (title, description, instructor, price, image_url)
  values (
    'Advanced Technical Analysis',
    'Master candlestick patterns and market structures.',
    'Sarah Jenkins',
    99.99,
    'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=800'
  )
  returning id into c2;

  insert into public.sections (course_id, title, order_idx)
  values (c1, 'Introduction to Forex', 1)
  returning id into s1;

  insert into public.lessons (section_id, title, video_url, duration, order_idx) values
    (s1, 'What is Forex?', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '10:00', 1),
    (s1, 'Market Participants', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '12:30', 2);

  insert into public.sections (course_id, title, order_idx)
  values (c2, 'Price Action Mastery', 1)
  returning id into s2;

  insert into public.lessons (section_id, title, video_url, duration, order_idx) values
    (s2, 'Support and Resistance', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '15:45', 1),
    (s2, 'Trendlines', 'https://www.youtube.com/embed/dQw4w9WgXcQ', '11:20', 2);
end $$;
