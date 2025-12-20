-- =============================================
-- CUSTOM LISTS SCHEMA FOR INKORA
-- =============================================
-- Run this SQL in your Supabase SQL Editor
-- Dashboard > SQL Editor > New Query

-- =============================================
-- 1. USER LISTS TABLE (Custom reading lists)
-- =============================================
CREATE TABLE IF NOT EXISTS public.user_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT 'list',
  color TEXT DEFAULT 'blue',
  is_default BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, name)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS user_lists_user_id_idx ON public.user_lists(user_id);
CREATE INDEX IF NOT EXISTS user_lists_sort_order_idx ON public.user_lists(sort_order);

-- Enable RLS
ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own lists" 
  ON public.user_lists FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lists" 
  ON public.user_lists FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists" 
  ON public.user_lists FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists" 
  ON public.user_lists FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 2. LIST ITEMS TABLE (Manhwa in lists)
-- =============================================
CREATE TABLE IF NOT EXISTS public.list_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID REFERENCES public.user_lists(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  manhwa_id TEXT NOT NULL,
  title TEXT NOT NULL,
  image TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(list_id, manhwa_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS list_items_list_id_idx ON public.list_items(list_id);
CREATE INDEX IF NOT EXISTS list_items_user_id_idx ON public.list_items(user_id);
CREATE INDEX IF NOT EXISTS list_items_manhwa_id_idx ON public.list_items(manhwa_id);

-- Enable RLS
ALTER TABLE public.list_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own list items" 
  ON public.list_items FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own list items" 
  ON public.list_items FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own list items" 
  ON public.list_items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own list items" 
  ON public.list_items FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- 3. CREATE DEFAULT LISTS FUNCTION
-- =============================================
-- This function creates default lists for new users

CREATE OR REPLACE FUNCTION create_default_lists(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Insert default lists if they don't exist
  INSERT INTO public.user_lists (user_id, name, description, icon, color, is_default, sort_order)
  VALUES 
    (p_user_id, 'Reading', 'Currently reading', 'book-open', 'blue', true, 0),
    (p_user_id, 'Plan to Read', 'Want to read later', 'clock', 'purple', true, 1),
    (p_user_id, 'Completed', 'Finished reading', 'check-circle', 'green', true, 2),
    (p_user_id, 'On Hold', 'Paused for now', 'pause-circle', 'yellow', true, 3),
    (p_user_id, 'Dropped', 'Stopped reading', 'x-circle', 'red', true, 4),
    (p_user_id, 'Favorites', 'My favorite series', 'heart', 'pink', true, 5)
  ON CONFLICT (user_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 4. UPDATE TIMESTAMP TRIGGER
-- =============================================
DROP TRIGGER IF EXISTS update_user_lists_updated_at ON public.user_lists;
CREATE TRIGGER update_user_lists_updated_at
  BEFORE UPDATE ON public.user_lists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DONE! Custom lists tables are ready.
-- =============================================
-- After running this, users can create and manage custom lists.
-- Default lists are created when calling create_default_lists(user_id)
