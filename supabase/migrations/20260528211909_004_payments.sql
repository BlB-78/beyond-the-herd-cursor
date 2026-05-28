/*
  # Payments Table

  Tracks Stripe Checkout payment records:
  - User and course reference
  - Stripe session ID for verification
  - Payment status tracking (pending/completed/failed)
  - RLS policies for user and admin access
*/

-- Payments table
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

-- Indexes for performance
create index idx_payments_user on public.payments (user_id);
create index idx_payments_course on public.payments (course_id);

-- Enable RLS
alter table public.payments enable row level security;

-- Payment policies
create policy "payments_select_own_or_admin"
  on public.payments for select
  using (auth.uid() = user_id or public.is_admin());