# Admin Login Setup Guide

## Overview

The admin login system uses **email-only authentication** (passwordless) for administrators. Admins receive a magic link in their email to sign in securely.

## How It Works

1. **Admin enters their email** at `/admin-login`
2. **System checks** if the email is in the admin allowlist
3. **Magic link is sent** to the admin's email
4. **Admin clicks the link** to authenticate
5. **System verifies** admin status and redirects to `/admin`

## Setup Steps

### 1. Run the Supabase Migration

In your **Supabase Dashboard** → **SQL Editor**, run this migration:

```sql
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

-- Drop the old is_admin function if it exists
drop function if exists public.is_admin();

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
```

### 2. Configure Supabase Email Settings

In **Supabase Dashboard** → **Authentication** → **Email Templates**:

1. **Enable Magic Link** template
2. Customize the email template if needed (optional)
3. Make sure the "Confirm your mail" setting is configured

### 3. Add Your First Admin

Replace `admin@example.com` with your actual admin email:

```sql
-- Step 1: Add email to allowlist
insert into public.admin_allowlist (email)
values ('admin@example.com')
on conflict (email) do update set enabled = true;

-- Step 2: Grant admin role (only needed if the user already has an account)
-- If they don't have an account yet, skip this step
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('admin@example.com');
```

**Important:** If the admin doesn't have an account yet:
- First add them to the allowlist (Step 1)
- They can create a regular account at `/register`
- Then run Step 2 to grant them admin role

### 4. Configure Supabase Redirect URLs

In **Supabase Dashboard** → **Authentication** → **URL Configuration**, add:

```
Production URLs:
https://your-vercel-domain.vercel.app/auth/callback
https://your-vercel-domain.vercel.app/reset-password

Development URLs:
http://localhost:3000/auth/callback
http://localhost:3000/reset-password
```

### 5. Test the Admin Login Flow

1. Go to `https://your-domain.com/admin-login`
2. Enter your admin email
3. Click "Send magic link"
4. Check your email inbox
5. Click the magic link
6. You should be redirected to `/admin`

## Admin Login Features

- ✅ **Email-only authentication** (no password required)
- ✅ **Magic link sent via email**
- ✅ **Admin allowlist validation**
- ✅ **Google OAuth support** (optional)
- ✅ **Server-side protection** on all `/admin` routes
- ✅ **Automatic sign-out** for unauthorized users

## Managing Admins

### Add a New Admin

```sql
-- Add to allowlist
insert into public.admin_allowlist (email)
values ('newadmin@example.com')
on conflict (email) do update set enabled = true;

-- Grant admin role (after they create an account)
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('newadmin@example.com');
```

### Disable an Admin (Temporarily)

```sql
update public.admin_allowlist
set enabled = false
where email = 'admin@example.com';
```

### Re-enable an Admin

```sql
update public.admin_allowlist
set enabled = true
where email = 'admin@example.com';
```

### Remove an Admin (Permanently)

```sql
-- Remove from allowlist
delete from public.admin_allowlist
where email = 'admin@example.com';

-- Optionally revoke admin role
update public.profiles p
set role = 'student'
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('admin@example.com');
```

### List All Admins

```sql
select 
  a.email,
  a.enabled,
  a.created_at,
  p.full_name,
  p.role
from public.admin_allowlist a
left join auth.users u on lower(u.email) = lower(a.email)
left join public.profiles p on p.id = u.id
order by a.created_at desc;
```

## Troubleshooting

### "This email is not authorized for admin access"

**Cause:** Email is not in the admin allowlist or is disabled.

**Solution:**
```sql
-- Check if email exists
select * from public.admin_allowlist where email = 'admin@example.com';

-- If not found, add it
insert into public.admin_allowlist (email) values ('admin@example.com');

-- If found but disabled
update public.admin_allowlist set enabled = true where email = 'admin@example.com';
```

### Magic Link Not Received

1. **Check spam folder**
2. **Verify email configuration** in Supabase → Authentication → Email Templates
3. **Check rate limits** - Supabase has email rate limits (wait 60 seconds between attempts)
4. **Verify SMTP settings** in Supabase (for production)

### Admin Gets Signed Out After Login

**Cause:** User has `role = 'student'` in profiles table.

**Solution:**
```sql
update public.profiles p
set role = 'admin'
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('admin@example.com');
```

### "Unable to verify admin access"

**Cause:** The `is_admin()` function is not working or doesn't exist.

**Solution:** Re-run the migration SQL from Step 1.

## Security Notes

- ✅ Magic links expire after use
- ✅ All admin routes are protected server-side
- ✅ Non-admin users are signed out if they try to access admin areas
- ✅ RLS policies prevent unauthorized database access
- ✅ Admin status requires BOTH allowlist entry AND admin role

## Google OAuth for Admins

If you've enabled Google authentication:

1. Admins can click "Continue with Google (Admin)" on `/admin-login`
2. After Google authentication, the system verifies their email is in the allowlist
3. If not authorized, they're signed out and redirected with an error

## URLs

- **Admin Login:** `/admin-login`
- **Admin Dashboard:** `/admin`
- **Regular Login:** `/login`
- **Regular Signup:** `/register`

---

## Quick Reference

```sql
-- Add admin
insert into public.admin_allowlist (email) values ('admin@example.com');
update public.profiles p set role = 'admin' from auth.users u 
where p.id = u.id and lower(u.email) = lower('admin@example.com');

-- Remove admin
delete from public.admin_allowlist where email = 'admin@example.com';

-- List admins
select * from public.admin_allowlist;
```
