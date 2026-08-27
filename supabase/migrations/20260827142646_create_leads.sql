-- Leads captured by the landing page contact form.
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text,
  outcome text not null,
  ip text,
  user_agent text
);

alter table public.leads enable row level security;

-- RLS is on with no policies defined, so anon and authenticated can read and
-- write nothing. /api/contact uses the service role key, which bypasses RLS.
revoke all on public.leads from anon, authenticated;

create index if not exists leads_created_at_idx on public.leads (created_at desc);
