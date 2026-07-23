-- ====================================================================
-- PlaySec Complete Backend Row Level Security (RLS) & Authorization Script
-- ====================================================================
-- Description:
-- Secures all database tables (playbooks, knowledge_resources, admins)
-- and Supabase Storage buckets against unauthorized INSERT, UPDATE, 
-- and DELETE requests from Postman, cURL, or direct REST API calls.
-- ====================================================================

-- 1. HELPER FUNCTION: Verify Admin Role from JWT Email
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 
    from public.admins 
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
end;
$$ language plpgsql security definer;

-- --------------------------------------------------------------------
-- 2. TABLE: admins
-- --------------------------------------------------------------------
alter table public.admins enable row level security;

-- Drop existing policies if re-running script
drop policy if exists "Allow read access to admins table" on public.admins;
drop policy if exists "Allow insert access to admins table for admins only" on public.admins;
drop policy if exists "Allow update access to admins table for admins only" on public.admins;
drop policy if exists "Allow delete access to admins table for admins only" on public.admins;

-- Policy: Allow read access to admins table (to check admin status)
create policy "Allow read access to admins table"
  on public.admins
  for select
  using (true);

-- Policy: Admin-only INSERT
create policy "Allow insert access to admins table for admins only"
  on public.admins
  for insert
  with check (public.is_admin());

-- Policy: Admin-only UPDATE
create policy "Allow update access to admins table for admins only"
  on public.admins
  for update
  using (public.is_admin());

-- Policy: Admin-only DELETE
create policy "Allow delete access to admins table for admins only"
  on public.admins
  for delete
  using (public.is_admin());


-- --------------------------------------------------------------------
-- 3. TABLE: playbooks
-- --------------------------------------------------------------------
alter table public.playbooks enable row level security;

drop policy if exists "Allow public read access to published playbooks" on public.playbooks;
drop policy if exists "Allow insert on playbooks for admins only" on public.playbooks;
drop policy if exists "Allow update on playbooks for admins only" on public.playbooks;
drop policy if exists "Allow delete on playbooks for admins only" on public.playbooks;

-- Policy: Public SELECT for published content only
create policy "Allow public read access to published playbooks"
  on public.playbooks
  for select
  using (published = true or public.is_admin());

-- Policy: Admin-only INSERT
create policy "Allow insert on playbooks for admins only"
  on public.playbooks
  for insert
  with check (public.is_admin());

-- Policy: Admin-only UPDATE
create policy "Allow update on playbooks for admins only"
  on public.playbooks
  for update
  using (public.is_admin());

-- Policy: Admin-only DELETE
create policy "Allow delete on playbooks for admins only"
  on public.playbooks
  for delete
  using (public.is_admin());


-- --------------------------------------------------------------------
-- 4. TABLE: knowledge_resources
-- --------------------------------------------------------------------
alter table public.knowledge_resources enable row level security;

drop policy if exists "Allow public read access to published knowledge_resources" on public.knowledge_resources;
drop policy if exists "Allow insert on knowledge_resources for admins only" on public.knowledge_resources;
drop policy if exists "Allow update on knowledge_resources for admins only" on public.knowledge_resources;
drop policy if exists "Allow delete on knowledge_resources for admins only" on public.knowledge_resources;

-- Policy: Public SELECT for published content only
create policy "Allow public read access to published knowledge_resources"
  on public.knowledge_resources
  for select
  using (published = true or public.is_admin());

-- Policy: Admin-only INSERT
create policy "Allow insert on knowledge_resources for admins only"
  on public.knowledge_resources
  for insert
  with check (public.is_admin());

-- Policy: Admin-only UPDATE
create policy "Allow update on knowledge_resources for admins only"
  on public.knowledge_resources
  for update
  using (public.is_admin());

-- Policy: Admin-only DELETE
create policy "Allow delete on knowledge_resources for admins only"
  on public.knowledge_resources
  for delete
  using (public.is_admin());


-- --------------------------------------------------------------------
-- 5. STORAGE BUCKETS (playbook-audio, library-resources, cover-images)
-- --------------------------------------------------------------------
drop policy if exists "Public Read Access for Storage Buckets" on storage.objects;
drop policy if exists "Admin Insert Access for Storage Buckets" on storage.objects;
drop policy if exists "Admin Update Access for Storage Buckets" on storage.objects;
drop policy if exists "Admin Delete Access for Storage Buckets" on storage.objects;

-- Policy: Public Read Access
create policy "Public Read Access for Storage Buckets"
  on storage.objects
  for select
  using (bucket_id in ('playbook-audio', 'library-resources', 'cover-images'));

-- Policy: Admin-only Upload (INSERT)
create policy "Admin Insert Access for Storage Buckets"
  on storage.objects
  for insert
  with check (
    bucket_id in ('playbook-audio', 'library-resources', 'cover-images') 
    and public.is_admin()
  );

-- Policy: Admin-only UPDATE
create policy "Admin Update Access for Storage Buckets"
  on storage.objects
  for update
  using (
    bucket_id in ('playbook-audio', 'library-resources', 'cover-images') 
    and public.is_admin()
  );

-- Policy: Admin-only DELETE
create policy "Admin Delete Access for Storage Buckets"
  on storage.objects
  for delete
  using (
    bucket_id in ('playbook-audio', 'library-resources', 'cover-images') 
    and public.is_admin()
  );
