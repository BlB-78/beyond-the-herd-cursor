-- Support Stripe + Chargily (and future gateways)

alter table public.payments
  rename column stripe_session_id to provider_checkout_id;

alter table public.payments
  add column if not exists provider text not null default 'stripe';

alter table public.payments
  drop constraint if exists payments_stripe_session_id_key;

alter table public.payments
  drop constraint if exists payments_provider_checkout_id_key;

create unique index if not exists payments_provider_checkout_uidx
  on public.payments (provider, provider_checkout_id);

alter table public.payments
  drop constraint if exists payments_provider_check;

alter table public.payments
  add constraint payments_provider_check
  check (provider in ('stripe', 'chargily'));
