-- MANUAL, DESTRUCTIVE RESET. Run only in this site's Supabase SQL Editor.
-- Deletes ALL Supabase login accounts, profiles, enrollments, attempts, results,
-- admin approvals and password-help requests. Export any records you need first.
-- Preserves exams, tests, questions, bundles and the legacy archive.
-- This is NOT a migration and must NOT be part of an automated deployment.
begin;

-- Stop legacy records from repopulating newly registered profiles/assignments.
drop trigger if exists link_legacy_profile_after_insert on public.profiles;
do $$
begin
 if to_regclass('legacy_import.users') is not null then
  execute 'update legacy_import.users set auth_user_id = null';
 end if;
 if to_regclass('public.password_help_requests') is not null then
  execute 'delete from public.password_help_requests';
 end if;
 if to_regclass('public.admin_allowlist') is not null then
  execute 'delete from public.admin_allowlist';
 end if;
end $$;

-- Existing ON DELETE CASCADE foreign keys delete the dependent application data.
-- An unexpected dependency fails the transaction rather than dropping tables.
delete from auth.users;

commit;

select 'auth accounts' as item, count(*) as remaining from auth.users
union all select 'profiles', count(*) from public.profiles
union all select 'results', count(*) from public.results
union all select 'enrollments', count(*) from public.enrollments
union all select 'attempts', count(*) from private.attempts;
