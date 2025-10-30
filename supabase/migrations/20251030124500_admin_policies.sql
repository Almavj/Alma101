-- RLS policies to restrict write operations to a single admin email
-- Adjust the email below or set SUPABASE_ADMIN_EMAIL in your environment and replace accordingly

-- Allow admins (by email) to INSERT/UPDATE/DELETE on videos, blogs, tools, writeups

DO $$
BEGIN
  -- Videos
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'admins_videos_full') THEN
    CREATE POLICY "admins_videos_full" ON public.videos
      FOR ALL
      USING ((SELECT email FROM auth.users WHERE id = auth.uid()) = 'machariaallan881@gmail.com');
  END IF;

  -- Blogs
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'admins_blogs_full') THEN
    CREATE POLICY "admins_blogs_full" ON public.blogs
      FOR ALL
      USING ((SELECT email FROM auth.users WHERE id = auth.uid()) = 'machariaallan881@gmail.com');
  END IF;

  -- Tools
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'admins_tools_full') THEN
    CREATE POLICY "admins_tools_full" ON public.tools
      FOR ALL
      USING ((SELECT email FROM auth.users WHERE id = auth.uid()) = 'machariaallan881@gmail.com');
  END IF;

  -- Writeups
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'admins_writeups_full') THEN
    CREATE POLICY "admins_writeups_full" ON public.writeups
      FOR ALL
      USING ((SELECT email FROM auth.users WHERE id = auth.uid()) = 'machariaallan881@gmail.com');
  END IF;
END$$;

-- Note: SELECT policies above already exist in an earlier migration to allow authenticated users to READ.
-- This migration restricts ALL other operations to the specific admin email.
