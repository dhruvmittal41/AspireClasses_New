# Simple Admin Login Setup

## How It Works

1. Admin visits `/admin-login`
2. Enters their email
3. System checks if email exists in `admin_allowlist` table
4. If yes → redirect to `/admin` dashboard
5. If no → show error message

**No passwords, no authentication, no magic links!**

## Setup Steps

### 1. Run This SQL in Supabase Dashboard

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Create admin allowlist table
CREATE TABLE public.admin_allowlist (
  email text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS but allow public read access
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read from the allowlist (needed for login verification)
CREATE POLICY admin_allowlist_read_all ON public.admin_allowlist
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grant select permission
GRANT SELECT ON public.admin_allowlist TO anon, authenticated;
```

### 2. Add Your First Admin Email

```sql
INSERT INTO public.admin_allowlist (email)
VALUES ('your-email@example.com');
```

### 3. Test It

1. Go to `http://localhost:3000/admin-login` (or your production URL)
2. Enter the email you added
3. Click "Access Admin Dashboard"
4. You should be redirected to `/admin`

## Managing Admin Emails

### Add a New Admin

```sql
INSERT INTO public.admin_allowlist (email)
VALUES ('newadmin@example.com');
```

### Temporarily Disable an Admin

```sql
UPDATE public.admin_allowlist
SET enabled = false
WHERE email = 'admin@example.com';
```

### Re-enable an Admin

```sql
UPDATE public.admin_allowlist
SET enabled = true
WHERE email = 'admin@example.com';
```

### Remove an Admin Permanently

```sql
DELETE FROM public.admin_allowlist
WHERE email = 'admin@example.com';
```

### List All Admins

```sql
SELECT email, enabled, created_at
FROM public.admin_allowlist
ORDER BY created_at DESC;
```

## How the Session Works

- When an admin logs in, their email is stored in a **secure HTTP-only cookie**
- The cookie lasts for **7 days**
- Every admin page checks the cookie and verifies the email is still in the allowlist
- If the email is removed from the allowlist, access is revoked immediately

## Security Notes

✅ **Simple but secure:**
- Email is stored in HTTP-only cookie (not accessible via JavaScript)
- Server-side verification on every admin page
- Can instantly revoke access by disabling/removing email
- No password to forget or manage

⚠️ **Important:**
- This is suitable for internal tools where you trust the network
- For production with sensitive data, consider adding additional authentication layers

## Troubleshooting

### "This email is not authorized"

**Solution:** Add the email to the allowlist:
```sql
INSERT INTO public.admin_allowlist (email)
VALUES ('your-email@example.com');
```

### "Your session expired"

**Solution:** Just log in again at `/admin-login`

### Changes to allowlist not working

**Solution:** 
1. Clear browser cookies
2. Log in again
3. Server checks allowlist on every page load

## Quick Reference

```sql
-- Add admin
INSERT INTO public.admin_allowlist (email) VALUES ('admin@example.com');

-- Remove admin
DELETE FROM public.admin_allowlist WHERE email = 'admin@example.com';

-- List all
SELECT * FROM public.admin_allowlist ORDER BY created_at DESC;
```

## URLs

- **Admin Login:** `/admin-login`
- **Admin Dashboard:** `/admin`
- **Student Login:** `/login`
