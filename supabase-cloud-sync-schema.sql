-- =============================================
-- CLOUD SYNC SCHEMA FOR INKORA
-- =============================================
-- Run this SQL in your Supabase SQL Editor after the initial schema
-- Dashboard > SQL Editor > New Query

-- =============================================
-- 1. USER BOOKMARKS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  manhwa_id TEXT NOT NULL,
  title TEXT NOT NULL,
  image TEXT,
  provider TEXT DEFAULT 'mgeko',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, manhwa_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_bookmarks_user_id_idx ON public.user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS user_bookmarks_manhwa_id_idx ON public.user_bookmarks(manhwa_id);
CREATE INDEX IF NOT EXISTS user_bookmarks_created_at_idx ON public.user_bookmarks(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Policies for user_bookmarks
CREATE POLICY "Users can view their own bookmarks" 
  ON public.user_bookmarks FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bookmarks" 
  ON public.user_bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookmarks" 
  ON public.user_bookmarks FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" 
  ON public.user_bookmarks FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 2. READING PROGRESS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.reading_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  manhwa_id TEXT NOT NULL,
  manhwa_title TEXT NOT NULL,
  manhwa_image TEXT,
  last_chapter_id TEXT NOT NULL,
  last_chapter_title TEXT,
  chapters_read TEXT[] DEFAULT '{}',
  chapter_progress JSONB DEFAULT '{}',
  total_chapters INTEGER,
  provider TEXT DEFAULT 'mgeko',
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, manhwa_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS reading_progress_user_id_idx ON public.reading_progress(user_id);
CREATE INDEX IF NOT EXISTS reading_progress_manhwa_id_idx ON public.reading_progress(manhwa_id);
CREATE INDEX IF NOT EXISTS reading_progress_last_read_at_idx ON public.reading_progress(last_read_at DESC);

-- Enable RLS
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

-- Policies for reading_progress
CREATE POLICY "Users can view their own reading progress" 
  ON public.reading_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reading progress" 
  ON public.reading_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reading progress" 
  ON public.reading_progress FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reading progress" 
  ON public.reading_progress FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 3. SYNC METADATA TABLE
-- =============================================
-- Tracks last sync time for conflict resolution
CREATE TABLE IF NOT EXISTS public.sync_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  last_bookmarks_sync TIMESTAMP WITH TIME ZONE,
  last_progress_sync TIMESTAMP WITH TIME ZONE,
  device_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.sync_metadata ENABLE ROW LEVEL SECURITY;

-- Policies for sync_metadata
CREATE POLICY "Users can view their own sync metadata" 
  ON public.sync_metadata FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sync metadata" 
  ON public.sync_metadata FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync metadata" 
  ON public.sync_metadata FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- 4. UPDATE TIMESTAMP TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
DROP TRIGGER IF EXISTS update_user_bookmarks_updated_at ON public.user_bookmarks;
CREATE TRIGGER update_user_bookmarks_updated_at
  BEFORE UPDATE ON public.user_bookmarks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reading_progress_updated_at ON public.reading_progress;
CREATE TRIGGER update_reading_progress_updated_at
  BEFORE UPDATE ON public.reading_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_sync_metadata_updated_at ON public.sync_metadata;
CREATE TRIGGER update_sync_metadata_updated_at
  BEFORE UPDATE ON public.sync_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DONE! Cloud sync tables are ready.
-- =============================================
