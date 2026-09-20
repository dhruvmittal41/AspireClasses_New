-- =====================================================
-- Admin Allowlist System
-- =====================================================
-- Creates a secure admin allowlist table that controls
-- which email addresses can access admin features.
-- Admins must be both:
--   1. Listed in admin_allowlist with enabled=true
--   2. Have profiles.role = 'admin'
-- =====================================================

-- Create admin allowlist table
create table if not exists public.admin_allowlist (
  email text primary key,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add RLS to admin_allowlist
alter table public.admin_allowlist enable row level security;

-- Revoke all access by default
revoke all on public.admin_allowlist from public, anon, authenticated;

-- Allow anyone to check if an email is in the allowlist (for client-side validation)
create policy admin_allowlist_read on public.admin_allowlist 
  for select 
  to anon, authenticated 
  using (true);

-- Grant select permission
grant select on public.admin_allowlist to anon, authenticated;

-- Create function to check if current user is an admin
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    join auth.users u on u.id = p.id
    join public.admin_allowlist a
      on lower(trim(a.email)) = lower(trim(u.email))
     and a.enabled = true
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

-- Grant execute permission on is_admin function
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Add comment for documentation
comment on table public.admin_allowlist is 'Controls which email addresses are authorized for admin access. Users must also have role=admin in profiles table.';
comment on function public.is_admin() is 'Returns true if the current user is both in the admin allowlist and has admin role in profiles.';

-- =====================================================
-- How to add an admin:
-- =====================================================
-- 1. Add email to allowlist:
--    insert into public.admin_allowlist (email)
--    values ('admin@example.com')
--    on conflict (email) do update set enabled = true;
--
-- 2. Grant admin role (after they create an account):
--    update public.profiles p
--    set role = 'admin'
--    from auth.users u
--    where p.id = u.id
--      and lower(u.email) = lower('admin@example.com');
-- =====================================================
