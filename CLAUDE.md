# Tallied

Self-hosted AI receipt/invoice parser SaaS for solopreneurs and small accounting firms.

## Tech Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **AI:** Anthropic Claude Vision API (via `@anthropic-ai/sdk`)
- **Payments:** Stripe (subscriptions + webhooks)
- **UI:** Tailwind CSS v4 + shadcn/ui (base-ui primitives)
- **CSV:** Papa Parse
- **Deploy:** Vercel

## Key Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npx tsc --noEmit` — Type check

## Architecture
- `src/app/(auth)/` — Login, signup, callback (Supabase Auth)
- `src/app/(dashboard)/` — Protected app pages (dashboard, upload, transactions, rules, billing, settings)
- `src/app/api/` — Stripe webhook + billing checkout/portal routes
- `src/actions/` — Server actions (upload, transactions, rules, usage)
- `src/lib/ai/` — Claude Vision extraction pipeline
- `src/lib/supabase/` — Client utilities (browser, server, admin)
- `src/lib/stripe/` — Stripe client + plan config
- `src/components/` — React components organized by feature area
- `supabase/migrations/` — Database schema SQL
- `middleware.ts` — Auth session refresh + route protection

## Important Notes
- shadcn/ui v4 uses base-ui primitives — use `render` prop instead of `asChild` on Trigger components (Dialog, Sheet, DropdownMenu)
- Button component uses classic Radix Slot pattern for `asChild` support
- Stripe and Anthropic clients are lazy-initialized to avoid build-time errors
- Supabase types are manually defined in `src/lib/supabase/types.ts` — regenerate with `supabase gen types typescript` after schema changes
- Migration SQL in `supabase/migrations/001_initial_schema.sql` must be applied manually to the Supabase project
