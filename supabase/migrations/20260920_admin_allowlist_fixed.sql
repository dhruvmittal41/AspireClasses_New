-- =====================================================
-- Admin Allowlist System (Fixed Version)
-- =====================================================
-- Creates a secure admin allowlist table that controls
-- which email addresses can access admin features.
-- =====================================================

-- Drop existing objects if they exist
DROP TABLE IF EXISTS public.admin_allowlist CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- Create admin allowlist table
CREATE TABLE public.admin_allowlist (
  email text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_allowlist ENABLE ROW LEVEL SECURITY;

-- Create function to check if current user is an admin
-- This checks BOTH the allowlist AND the profiles.role
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    JOIN public.admin_allowlist a
      ON lower(trim(a.email)) = lower(trim(u.email))
     AND a.enabled = true
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  );
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;

-- Add helpful comments
COMMENT ON TABLE public.admin_allowlist IS 'Controls which email addresses are authorized for admin access. Users must also have role=admin in profiles table.';
COMMENT ON FUNCTION public.is_admin() IS 'Returns true if the current user is both in the admin allowlist and has admin role in profiles.';

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================
-- 
-- To add an admin (run these in order):
--
-- 1. Add email to allowlist:
--    INSERT INTO public.admin_allowlist (email)
--    VALUES ('admin@example.com')
--    ON CONFLICT (email) DO UPDATE SET enabled = true;
--
-- 2. Grant admin role (after they create an account):
--    UPDATE public.profiles p
--    SET role = 'admin'
--    FROM auth.users u
--    WHERE p.id = u.id
--      AND lower(u.email) = lower('admin@example.com');
--
-- To disable an admin temporarily:
--    UPDATE public.admin_allowlist
--    SET enabled = false
--    WHERE email = 'admin@example.com';
--
-- To remove an admin permanently:
--    DELETE FROM public.admin_allowlist
--    WHERE email = 'admin@example.com';
-- =====================================================
