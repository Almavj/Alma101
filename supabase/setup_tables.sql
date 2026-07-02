-- =============================================================
-- Alma101 - Create missing tables, triggers, and RLS policies
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor)
-- =============================================================

-- 1. Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can view their own profile') THEN
    CREATE POLICY "Users can view their own profile"
      ON public.profiles FOR SELECT
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can update their own profile') THEN
    CREATE POLICY "Users can update their own profile"
      ON public.profiles FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Users can insert their own profile') THEN
    CREATE POLICY "Users can insert their own profile"
      ON public.profiles FOR INSERT
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous) to read videos
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Anyone can view videos') THEN
    CREATE POLICY "Anyone can view videos"
      ON public.videos FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'admins_videos_full') THEN
    CREATE POLICY "admins_videos_full" ON public.videos
      FOR ALL
      USING ((SELECT email FROM auth.users WHERE id = auth.uid()) = 'machariaallan881@gmail.com');
  END IF;
END $$;

-- 3. Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  excerpt TEXT,
  image_url TEXT,
  link TEXT,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous) to read blogs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Anyone can view blogs') THEN
    CREATE POLICY "Anyone can view blogs"
      ON public.blogs FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'admins_blogs_full') THEN
    CREATE POLICY "admins_blogs_full" ON public.blogs
      FOR ALL
      USING ((SELECT email FROM auth.users WHERE id = auth.uid()) = 'machariaallan881@gmail.com');
  END IF;
END $$;

-- 4. Create tools table
CREATE TABLE IF NOT EXISTS public.tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  tool_url TEXT,
  category TEXT,
  icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous) to read tools
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Anyone can view tools') THEN
    CREATE POLICY "Anyone can view tools"
      ON public.tools FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'admins_tools_full') THEN
    CREATE POLICY "admins_tools_full" ON public.tools
      FOR ALL
      USING ((SELECT email FROM auth.users WHERE id = auth.uid()) = 'machariaallan881@gmail.com');
  END IF;
END $$;

-- 5. Create writeups table
CREATE TABLE IF NOT EXISTS public.writeups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT,
  author_id UUID REFERENCES auth.users(id),
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.writeups ENABLE ROW LEVEL SECURITY;

-- Allow anyone (including anonymous) to read writeups
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Anyone can view writeups') THEN
    CREATE POLICY "Anyone can view writeups"
      ON public.writeups FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'admins_writeups_full') THEN
    CREATE POLICY "admins_writeups_full" ON public.writeups
      FOR ALL
      USING ((SELECT email FROM auth.users WHERE id = auth.uid()) = 'machariaallan881@gmail.com');
  END IF;
END $$;

-- 6. Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'Anyone can submit contact form') THEN
    CREATE POLICY "Anyone can submit contact form"
      ON public.contact_submissions FOR INSERT
      WITH CHECK (true);
  END IF;
END $$;

-- 7. Create handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$;

-- Drop and recreate trigger to ensure it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Create update_updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Add update triggers (drop first to avoid duplicates)
DROP TRIGGER IF EXISTS update_videos_updated_at ON public.videos;
CREATE TRIGGER update_videos_updated_at
  BEFORE UPDATE ON public.videos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_blogs_updated_at ON public.blogs;
CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON public.blogs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_writeups_updated_at ON public.writeups;
CREATE TRIGGER update_writeups_updated_at
  BEFORE UPDATE ON public.writeups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 9. Create storage policies for videos bucket
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view videos storage') THEN
    CREATE POLICY "Anyone can view videos storage"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'videos');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can upload to videos storage') THEN
    CREATE POLICY "Admins can upload to videos storage"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'videos'
        AND (SELECT email FROM auth.users WHERE id = auth.uid()) = 'machariaallan881@gmail.com'
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete from videos storage') THEN
    CREATE POLICY "Admins can delete from videos storage"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'videos'
        AND (SELECT email FROM auth.users WHERE id = auth.uid()) = 'machariaallan881@gmail.com'
      );
  END IF;
END $$;

-- 10. Create storage policies for tools bucket
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can view tools storage') THEN
    CREATE POLICY "Anyone can view tools storage"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'tools');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can upload to tools storage') THEN
    CREATE POLICY "Admins can upload to tools storage"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (
        bucket_id = 'tools'
        AND (SELECT email FROM auth.users WHERE id = auth.uid()) = 'machariaallan881@gmail.com'
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete from tools storage') THEN
    CREATE POLICY "Admins can delete from tools storage"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (
        bucket_id = 'tools'
        AND (SELECT email FROM auth.users WHERE id = auth.uid()) = 'machariaallan881@gmail.com'
      );
  END IF;
END $$;

-- Done! All tables, triggers, RLS policies, and storage policies created.
