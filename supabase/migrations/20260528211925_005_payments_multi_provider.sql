/*
  # Multi-Provider Payment Support

  Updates the payments table to support multiple payment providers (Stripe, Chargily):
  - Renames stripe_session_id to provider_checkout_id
  - Adds provider column with default 'stripe'
  - Updates unique constraint to be provider + checkout_id combination
  - Adds check constraint for valid provider values
*/

-- Rename stripe_session_id to generic provider_checkout_id
alter table public.payments
  rename column stripe_session_id to provider_checkout_id;

-- Add provider column with default 'stripe'
alter table public.payments
  add column if not exists provider text not null default 'stripe';

-- Drop old unique constraint
alter table public.payments
  drop constraint if exists payments_stripe_session_id_key;

-- Create new unique constraint for provider + checkout_id combination
create unique index if not exists payments_provider_checkout_uidx
  on public.payments (provider, provider_checkout_id);

-- Drop old check constraint if exists
alter table public.payments
  drop constraint if exists payments_provider_check;

-- Add new check constraint for valid provider values
alter table public.payments
  add constraint payments_provider_check
  check (provider in ('stripe', 'chargily'));