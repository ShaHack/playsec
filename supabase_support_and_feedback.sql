-- ====================================================================
-- PlaySec Support Center: feedback & support_tickets Tables & Policies
-- ====================================================================

-- 1. TABLE: feedback
create table if not exists public.feedback (
  id uuid default gen_random_uuid() primary key,
  name text,
  email text,
  feedback_type text not null,
  rating integer default 5,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.feedback enable row level security;

drop policy if exists "Allow public insert on feedback" on public.feedback;
drop policy if exists "Allow admin read on feedback" on public.feedback;

create policy "Allow public insert on feedback"
  on public.feedback for insert with check (true);

create policy "Allow admin read on feedback"
  on public.feedback for select using (public.is_admin());


-- 2. TABLE: support_tickets
create table if not exists public.support_tickets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  subject text not null,
  priority text default 'Medium',
  message text not null,
  status text default 'Open',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.support_tickets enable row level security;

drop policy if exists "Allow public insert on support_tickets" on public.support_tickets;
drop policy if exists "Allow admin manage on support_tickets" on public.support_tickets;

create policy "Allow public insert on support_tickets"
  on public.support_tickets for insert with check (true);

create policy "Allow admin manage on support_tickets"
  on public.support_tickets for all using (public.is_admin());
