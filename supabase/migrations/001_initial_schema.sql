-- Tallied: Initial Schema
-- Tables: profiles, transactions, category_rules, scan_usage
-- Plus: storage bucket, RLS policies, triggers, helper functions

-- ============================================================
-- 1. Profiles (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  stripe_customer_id text unique,
  subscription_status text not null default 'free'
    check (subscription_status in ('free', 'pro', 'self_hosted', 'canceled')),
  subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- 2. Transactions (core receipt data)
-- ============================================================
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vendor_name text,
  transaction_date date,
  amount numeric(12,2),
  currency text not null default 'USD',
  category text,
  ai_category text,
  has_tax boolean not null default false,
  tax_amount numeric(12,2),
  notes text,
  image_url text,
  raw_extraction jsonb,
  extraction_status text not null default 'pending'
    check (extraction_status in ('pending', 'success', 'failed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions enable row level security;

create policy "Users can view own transactions"
  on public.transactions for select
  using (auth.uid() = user_id);

create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own transactions"
  on public.transactions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own transactions"
  on public.transactions for delete
  using (auth.uid() = user_id);

create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_date on public.transactions(user_id, transaction_date desc);

-- ============================================================
-- 3. Category Rules
-- ============================================================
create table public.category_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  vendor_pattern text not null,
  category text not null,
  is_exact_match boolean not null default false,
  created_at timestamptz not null default now(),
  unique(user_id, vendor_pattern)
);

alter table public.category_rules enable row level security;

create policy "Users can view own rules"
  on public.category_rules for select
  using (auth.uid() = user_id);

create policy "Users can insert own rules"
  on public.category_rules for insert
  with check (auth.uid() = user_id);

create policy "Users can update own rules"
  on public.category_rules for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own rules"
  on public.category_rules for delete
  using (auth.uid() = user_id);

-- ============================================================
-- 4. Scan Usage (monthly rate limiting)
-- ============================================================
create table public.scan_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  month date not null, -- first day of month, e.g. 2026-03-01
  scan_count integer not null default 0,
  unique(user_id, month)
);

alter table public.scan_usage enable row level security;

create policy "Users can view own usage"
  on public.scan_usage for select
  using (auth.uid() = user_id);

-- Insert/update handled by server-side function with service role

-- ============================================================
-- 5. Helper Functions
-- ============================================================

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Increment scan count (upsert for current month)
create or replace function public.increment_scan_count(p_user_id uuid)
returns integer
language plpgsql
security definer set search_path = ''
as $$
declare
  v_month date := date_trunc('month', now())::date;
  v_count integer;
begin
  insert into public.scan_usage (user_id, month, scan_count)
  values (p_user_id, v_month, 1)
  on conflict (user_id, month)
  do update set scan_count = public.scan_usage.scan_count + 1
  returning scan_count into v_count;
  return v_count;
end;
$$;

-- Get current month scan count
create or replace function public.get_scan_count(p_user_id uuid)
returns integer
language plpgsql
security definer set search_path = ''
as $$
declare
  v_month date := date_trunc('month', now())::date;
  v_count integer;
begin
  select scan_count into v_count
  from public.scan_usage
  where user_id = p_user_id and month = v_month;
  return coalesce(v_count, 0);
end;
$$;

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();

create trigger set_transactions_updated_at
  before update on public.transactions
  for each row execute function public.update_updated_at();

-- ============================================================
-- 6. Storage Bucket
-- ============================================================
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', false);

create policy "Users can upload receipts"
  on storage.objects for insert
  with check (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can view own receipts"
  on storage.objects for select
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own receipts"
  on storage.objects for delete
  using (
    bucket_id = 'receipts'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
