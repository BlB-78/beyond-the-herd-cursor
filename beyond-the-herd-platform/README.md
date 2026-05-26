# Beyond The Herd

Online course platform for Forex traders — student portal, course player, Stripe + Chargily payments, and admin dashboard.

## Stack

- **Frontend:** React 19, Vite, Tailwind CSS, Zustand
- **Backend:** Supabase (Auth, PostgreSQL, Storage, RLS)
- **Payments:** Stripe (international cards) + [Chargily Pay](https://chargily.com) (Edahabia / CIB — Algeria)
- **Server:** Express (Vite dev, RSS proxy, payment APIs)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Run migrations **in order** in the SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_prevent_role_escalation.sql`
   - `supabase/migrations/003_storage_avatars.sql`
   - `supabase/migrations/004_payments.sql`
   - `supabase/migrations/005_payments_multi_provider.sql`
3. Enable **Email** (and optionally **Google**) under Authentication → Providers.
4. Set **Site URL** and **Redirect URLs** to `http://localhost:3000` (and `http://localhost:3000/**`).

### 2. Environment

```bash
cp .env.example .env.local
```

| Variable | Where to get it |
|----------|-----------------|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API |
| `VITE_SUPABASE_ANON_KEY` | Same |
| `SUPABASE_SERVICE_ROLE_KEY` | Same (server only — never commit) |
| `STRIPE_SECRET_KEY` | [Stripe Dashboard](https://dashboard.stripe.com/apikeys) → Secret key |
| `STRIPE_WEBHOOK_SECRET` | See Stripe webhooks below |
| `CHARGILY_API_KEY` | [Chargily Pay Dashboard](https://pay.chargily.com) → Developers |
| `CHARGILY_MODE` | `test` or `live` |
| `CHARGILY_DZD_PER_USD` | USD→DZD rate for Chargily amounts (e.g. `135`) |
| `APP_URL` | `http://localhost:3000` for local dev |

### 3. Stripe (test mode)

1. Add `STRIPE_SECRET_KEY` to `.env.local`.
2. Install [Stripe CLI](https://stripe.com/docs/stripe-cli) and forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the `whsec_...` secret into `STRIPE_WEBHOOK_SECRET`.

3. Use test card `4242 4242 4242 4242` with any future expiry and CVC.

Paid courses can use Stripe or Chargily from the checkout modal. Free courses (`price = 0`) enroll instantly.

### 4. Chargily Pay (Algeria — Edahabia / CIB)

1. Create an account at [pay.chargily.com](https://pay.chargily.com) and copy your **test** secret key (`test_sk_...`) into `CHARGILY_API_KEY`.
2. Set `CHARGILY_MODE=test` (use `live` in production with live keys).
3. Register your webhook URL in the Chargily dashboard **or** rely on the per-checkout `webhook_endpoint`:
   - `https://your-domain.com/api/webhooks/chargily`
4. For local testing, expose your server with [ngrok](https://ngrok.com) and point Chargily to `https://xxxx.ngrok.io/api/webhooks/chargily`.
5. Course prices are stored in **USD**; Chargily charges in **DZD** using `CHARGILY_DZD_PER_USD` (default `135`).

On the course page, students choose **International card (Stripe)** or **Chargily Pay (Edahabia / CIB)**.

### 5. Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 6. Admin user

After registering:

```sql
update public.profiles set role = 'admin' where email = 'your@email.com';
```

Sign out and back in, then visit `/admin`.

## Features

| Feature | Implementation |
|---------|----------------|
| Auth | Supabase (email + Google OAuth) |
| Courses / enrollments | PostgreSQL + RLS |
| Profile photos | Supabase Storage bucket `avatars` |
| Paid enrollment | Stripe or Chargily → webhooks + `/checkout/success` verify |
| Market news | `/api/analysis` RSS proxy |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Express + Vite on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | TypeScript check |

## Project structure

```
src/lib/
  supabase.ts    # Client
  data.ts        # Database CRUD
  storage.ts     # Avatar uploads
  payments.ts    # Checkout API client
src/server/
  payments.ts    # Stripe routes
  chargily.ts    # Chargily routes + webhook
  fulfillment.ts # Shared enrollment logic
  supabaseAdmin.ts
src/components/
  PaymentMethodModal.tsx
server.ts        # Express entry
supabase/migrations/
```
