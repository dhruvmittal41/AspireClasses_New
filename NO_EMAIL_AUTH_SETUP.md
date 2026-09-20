# Signup without email confirmation and manual password help

1. In Supabase Authentication → Sign In / Providers → Email, disable **Confirm email** and keep email/password signup enabled. This is a hosted Auth setting; changing application code does not switch it off. New signups then receive a session immediately and enter the dashboard. No SMTP provider is required for this flow.
2. Apply `supabase/migrations/202609210001_admin_session_repair.sql` if it has not already been applied, then apply `supabase/migrations/202609210002_password_help.sql`. Do not rerun the earlier destructive admin scripts.
3. Approve your admin account by its actual user UUID in Authentication → Users. Check that this is your own account before approving it; email-only public signup no longer proves ownership of an address. Run the following with that UUID:

```sql
-- Only for your own previously created account stuck awaiting confirmation:
update auth.users set email_confirmed_at = coalesce(email_confirmed_at, now())
where id = 'YOUR_VERIFIED_ADMIN_USER_UUID'::uuid;

insert into public.admin_allowlist (email, user_id, enabled)
select lower(trim(email)), id, true from auth.users
where id = 'YOUR_VERIFIED_ADMIN_USER_UUID'::uuid
on conflict (email) do update set user_id = excluded.user_id, enabled = true;
```

The new migration intentionally does not automatically approve accounts with matching emails. Existing allowlist entries need their user IDs approved once. An admin email is tied to that account; deleting it and signing up again cannot inherit admin access. No `profiles.role` edit is needed.

4. Open `/admin-login` and use that account's email and password. This page signs in directly without a student-login redirect. For new admin accounts, the project owner should create/approve the account in Supabase first; the admin page has no public admin signup.
5. Add `SUPABASE_SERVICE_ROLE_KEY` as a **server-only** Vercel environment variable and in your local `.env.local` when testing manual resets. Never prefix it with `NEXT_PUBLIC_`, commit it, or paste it into browser code. Redeploy after setting it. Student signup, admin login and request intake do not require this key; only the staff password-update action uses it.
6. Students use `/forgot-password` to submit their email and a student/parent phone number. Requests appear under `/admin/password-requests`. Submissions receive a generic acknowledgment and are limited to one request per email per day. This does not change any password or send any email.
7. Staff verify the student against existing enrollment records or a previously known contact, then enter a replacement password of at least 12 characters and resolve the request. Share it privately with that verified student/parent. The app does not save the replacement password in the request table. It also activates older unconfirmed student accounts when staff perform a verified reset. Unknown accounts can be rejected; admin accounts cannot be reset through this student workflow.

Previously registered unconfirmed accounts may still need individual activation; disabling confirmation should not be assumed to retroactively activate them. Admin recovery is handled by the Supabase project owner.

The request intake prevents repeated requests for one email but is not a full anti-spam service. Before broad public rollout, monitor request volume and add CAPTCHA or infrastructure rate limits if needed. Manual password updates do not promise immediate revocation of every previously issued access token.

Quick hosted check: create a new student account and confirm it goes straight to the dashboard; sign in directly at `/admin-login`; submit one password-help request; verify it appears in the admin panel; perform a verified reset and confirm the replacement password works. None of these hosted settings or migrations have been applied by Codex.
