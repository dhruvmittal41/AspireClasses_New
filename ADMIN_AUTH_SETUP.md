# Admin access repair

**Updated setup:** Follow [NO_EMAIL_AUTH_SETUP.md](NO_EMAIL_AUTH_SETUP.md) for the current flow. Admins now sign in directly with email/password; allowlist entries must be bound to an approved user UUID. Email confirmation is disabled for student signup, and password requests are reviewed in the admin panel. The older instructions below describe the preceding migration only.

Run `supabase/migrations/202609210001_admin_session_repair.sql` in the Supabase SQL Editor after your existing schema/import. Do not rerun the older admin scripts: they drop the allowlist or its dependent policies. The repair preserves existing emails, closes public access to the list, and restores the original admin policies.

Create and confirm the admin's Supabase account using the usual registration flow, then add the email in the SQL Editor:

```sql
insert into public.admin_allowlist (email, enabled)
values ('YOUR_ADMIN_EMAIL', true)
on conflict (email) do update set enabled = true;
```

No profile role promotion is needed. Open `/admin-login` and enter that account's email. An existing verified session goes straight to `/admin` when allowed; otherwise sign in using the normal password or Google flow. Supabase issues and refreshes the session tokens. An email address alone is not proof of ownership and never issues an admin token.

Admin pages, server actions, OAuth callbacks and database RLS use the same `is_admin()` decision based on `auth.uid()` and the account's confirmed email. The old `admin_email` cookie is ignored. Disabling or removing the allowlist row revokes admin permission on subsequent requests even while the user remains signed in.

Validate on your hosted site: allowed account can open the workspace and save a draft; a student and signed-out visitor cannot; disabling the allowed row blocks both page access and saves. Student login should still work. This migration has not been run against your hosted database by Codex.
