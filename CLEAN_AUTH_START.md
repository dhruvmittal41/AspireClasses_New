# Clean account setup

The Email provider must be ON. Confirm email must be OFF. These are different settings. Deleting accounts does not fix a disabled provider.

1. In the Supabase project used by your Vercel `NEXT_PUBLIC_SUPABASE_URL`, open Authentication → Sign In / Providers → Email. Enable the Email provider and email/password signup; disable Confirm email. Save. Ensure new-user signup is permitted in Auth settings.
2. Export any account data you want to keep. Run `supabase/reset_accounts.sql` manually in the SQL Editor only if you want to delete every account. It deletes profiles, enrollments, attempts, results, admin approvals and password-help requests. It preserves tests/questions/exams/bundles and the legacy archive. The archive linker is removed so old profiles and assignments are not automatically restored. Do not rerun the legacy import afterwards.
3. This reset preserves your schema. Do not rerun the initial import or earlier admin migrations. If the session-repair and password-help migrations were already applied, keep them. The reset cannot correct a missing schema migration.
4. Open a private browser window so deleted-account cookies are not reused. Register your owner account at `/register`, with a new password. You should land on the dashboard without an email step. If signup says email login is disabled, stop and recheck step 1 and the Vercel project URL/key pairing.
5. Find that specific account under Supabase Authentication → Users and copy its User UID. Run:

```sql
insert into public.admin_allowlist (email,user_id,enabled)
select lower(trim(email)),id,true from auth.users
where id='YOUR_NEW_ADMIN_UUID'::uuid
on conflict(email) do update set user_id=excluded.user_id,enabled=true;

select email,user_id,enabled from public.admin_allowlist
where user_id='YOUR_NEW_ADMIN_UUID'::uuid;
```

Verify the query returns your account with enabled=true. No manual profile creation or role update is needed. Use your registered password at `/admin-login`.

6. Register a separate student account and test login. It should enter the student dashboard and have no admin access.
7. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only in Vercel for staff password resets. It is not needed for student/admin login. Redeploy code changes with `vercel deploy --prod`. Keep public URL/key and the service key associated with the same Supabase project.

If the reset fails because a user owns Supabase Storage objects, the transaction should roll back. Inspect the exact error and preserve or reassign those assets before retrying; do not drop tables or use TRUNCATE CASCADE to bypass it.

The reset and hosted provider settings have not been executed by Codex.
