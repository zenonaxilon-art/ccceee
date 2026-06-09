-- ==========================================
-- INFINITY REALMS ONLINE - SUPABASE SCHEMA
-- ==========================================
-- Run this in your Supabase SQL Editor
-- ==========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar TEXT DEFAULT 'https://api.dicebear.com/7.x/bottts/svg?seed=default',
  coins NUMERIC DEFAULT 0,
  gems NUMERIC DEFAULT 0,
  prestiges INTEGER DEFAULT 0,
  rebirths INTEGER DEFAULT 0,
  ascensions INTEGER DEFAULT 0,
  playtime NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ DEFAULT NOW(),
  level INTEGER DEFAULT 1,
  experience NUMERIC DEFAULT 0,
  state JSONB DEFAULT '{
    "buildings": {},
    "upgrades": [],
    "pets": [],
    "achievements": [],
    "stats": {
        "total_clicks": 0,
        "highest_combo": 0,
        "critical_clicks": 0
    }
  }'::jsonb
);

-- 2. Messages Table (Global Realtime Chat)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  avatar TEXT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Leaderboards View (Indexed for performance)
CREATE INDEX idx_profiles_coins ON profiles(coins DESC);
CREATE INDEX idx_profiles_level ON profiles(level DESC, experience DESC);

-- 4. Auth Trigger (Auto-create profile on signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name, avatar)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'Player_' || substr(new.id::text, 1, 8)),
    COALESCE(new.raw_user_meta_data->>'username', 'Player_' || substr(new.id::text, 1, 8)),
    'https://api.dicebear.com/7.x/bottts/svg?seed=' || new.id::text
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile."
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile."
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Messages Policies
CREATE POLICY "Messages are viewable by everyone."
  ON messages FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert messages."
  ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 6. Realtime Configuration
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE messages, profiles;
COMMIT;
