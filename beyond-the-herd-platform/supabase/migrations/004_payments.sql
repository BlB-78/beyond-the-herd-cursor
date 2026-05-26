-- Payment records (Stripe Checkout)

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  stripe_session_id text not null unique,
  amount numeric not null,
  currency text not null default 'usd',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed')),
  created_at timestamptz not null default now()
);

create index idx_payments_user on public.payments (user_id);
create index idx_payments_course on public.payments (course_id);

alter table public.payments enable row level security;

create policy "payments_select_own_or_admin"
  on public.payments for select
  using (auth.uid() = user_id or public.is_admin());

-- Inserts/updates only via service role (webhook)
