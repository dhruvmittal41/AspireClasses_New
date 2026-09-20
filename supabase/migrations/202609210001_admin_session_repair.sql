-- Run after the earlier admin scripts. Preserves existing allowed emails.
begin;
create table if not exists public.admin_allowlist (
 email text primary key,
 enabled boolean not null default true,
 created_at timestamptz not null default now()
);
alter table public.admin_allowlist enable row level security;
revoke all on public.admin_allowlist from public, anon, authenticated;
drop policy if exists admin_allowlist_read on public.admin_allowlist;
drop policy if exists admin_allowlist_read_all on public.admin_allowlist;

-- Supabase authenticates the user; this function authorizes that identity.
-- No second profiles.role flag is required.
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
 select exists (
  select 1 from auth.users u
  join public.admin_allowlist a on lower(trim(a.email)) = lower(trim(u.email))
  where u.id = auth.uid() and u.email_confirmed_at is not null and a.enabled
 )
$$;
revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

-- Restore policies that DROP FUNCTION ... CASCADE may have removed.
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using(id=auth.uid() or public.is_admin());
drop policy if exists exams_admin on public.exams;
create policy exams_admin on public.exams for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists tests_read on public.tests;
create policy tests_read on public.tests for select using(published or public.is_admin());
drop policy if exists tests_admin on public.tests;
create policy tests_admin on public.tests for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists questions_admin on public.questions;
create policy questions_admin on public.questions for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists bundles_read on public.bundles;
create policy bundles_read on public.bundles for select using(published or public.is_admin());
drop policy if exists bundles_admin on public.bundles;
create policy bundles_admin on public.bundles for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists bundle_tests_read on public.bundle_tests;
create policy bundle_tests_read on public.bundle_tests for select using(exists(select 1 from public.bundles b where b.id=bundle_id and b.published) or public.is_admin());
drop policy if exists bundle_tests_admin on public.bundle_tests;
create policy bundle_tests_admin on public.bundle_tests for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists enrollments_read on public.enrollments;
create policy enrollments_read on public.enrollments for select to authenticated using(user_id=auth.uid() or public.is_admin());
drop policy if exists enrollments_admin on public.enrollments;
create policy enrollments_admin on public.enrollments for all to authenticated using(public.is_admin()) with check(public.is_admin());
drop policy if exists results_read on public.results;
create policy results_read on public.results for select to authenticated using(user_id=auth.uid() or public.is_admin());
drop policy if exists question_images_admin on storage.objects;
create policy question_images_admin on storage.objects for all to authenticated using(bucket_id='question-images' and public.is_admin()) with check(bucket_id='question-images' and public.is_admin());
commit;
