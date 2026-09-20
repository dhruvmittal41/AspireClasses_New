-- =====================================================
-- Simple Admin Allowlist System
-- =====================================================
-- No authentication required - just checks email against allowlist
-- =====================================================

-- Drop existing objects if they exist
DROP TABLE IF EXISTS public.admin_allowlist CASCADE;

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

-- Grant select permission to everyone (anon users need this for login)
GRANT SELECT ON public.admin_allowlist TO anon, authenticated;

-- Add helpful comment
COMMENT ON TABLE public.admin_allowlist IS 'Simple email allowlist for admin access - no authentication required, just email verification.';

-- =====================================================
-- USAGE INSTRUCTIONS
-- =====================================================
-- 
-- To add an admin email:
--    INSERT INTO public.admin_allowlist (email)
--    VALUES ('admin@example.com')
--    ON CONFLICT (email) DO UPDATE SET enabled = true;
--
-- To disable an admin temporarily:
--    UPDATE public.admin_allowlist
--    SET enabled = false
--    WHERE email = 'admin@example.com';
--
-- To re-enable:
--    UPDATE public.admin_allowlist
--    SET enabled = true
--    WHERE email = 'admin@example.com';
--
-- To remove an admin permanently:
--    DELETE FROM public.admin_allowlist
--    WHERE email = 'admin@example.com';
--
-- To list all admins:
--    SELECT email, enabled, created_at
--    FROM public.admin_allowlist
--    ORDER BY created_at DESC;
-- =====================================================
