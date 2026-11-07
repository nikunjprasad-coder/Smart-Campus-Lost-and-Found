/*
# Smart Campus Lost and Found System - Database Schema

## Overview
Creates a complete lost-and-found system for a university campus. Users can report lost items, report found items, search/browse items, submit claims for found items they believe are theirs, and admins can manage claims and item handovers.

## Tables

1. **profiles** - Extends auth.users with campus-specific fields (full_name, student_id, phone, role: 'user'|'admin')
2. **categories** - Item categories (Electronics, Clothing, Books, etc.)
3. **locations** - Campus locations (Library, Cafeteria, Gym, etc.)
4. **items** - Unified item records that can be either lost or found, with status tracking
5. **claims** - Claims submitted by users for found items they believe are theirs

## Item Status Flow
- lost items: 'active' → 'matched' → 'resolved'
- found items: 'active' → 'claimed' → 'resolved'

## Security
- RLS enabled on all tables
- Profiles: users read all, update own; admins full access
- Categories/Locations: public read, admin write
- Items: authenticated read all, insert own, update own (admin all)
- Claims: authenticated read own, insert own, admin can update all

## Important Notes
1. Uses auth.uid() for ownership checks
2. profiles.user_id defaults to auth.uid() so inserts work without explicitly passing it
3. items.reported_by defaults to auth.uid() for the same reason
4. claims.claimant_id defaults to auth.uid()
5. Admin role stored in profiles.role column
*/

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  student_id text,
  phone text,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles: anyone authenticated can read (to see who reported items)
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

-- Profiles: users can insert their own profile
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

-- Profiles: users can update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  icon text NOT NULL DEFAULT 'Package',
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Categories: anyone authenticated can read
DROP POLICY IF EXISTS "categories_select_all" ON categories;
CREATE POLICY "categories_select_all" ON categories FOR SELECT
  TO authenticated USING (true);

-- Categories: only admins can insert
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Categories: only admins can update
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Categories: only admins can delete
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- LOCATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  building text,
  floor text,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

-- Locations: anyone authenticated can read
DROP POLICY IF EXISTS "locations_select_all" ON locations;
CREATE POLICY "locations_select_all" ON locations FOR SELECT
  TO authenticated USING (true);

-- Locations: only admins can insert
DROP POLICY IF EXISTS "locations_insert_admin" ON locations;
CREATE POLICY "locations_insert_admin" ON locations FOR INSERT
  TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Locations: only admins can update
DROP POLICY IF EXISTS "locations_update_admin" ON locations;
CREATE POLICY "locations_update_admin" ON locations FOR UPDATE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Locations: only admins can delete
DROP POLICY IF EXISTS "locations_delete_admin" ON locations;
CREATE POLICY "locations_delete_admin" ON locations FOR DELETE
  TO authenticated USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- ITEMS TABLE (unified lost + found)
-- ============================================================
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('lost', 'found')),
  title text NOT NULL,
  description text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  reported_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'matched', 'claimed', 'resolved', 'expired')),
  report_date timestamptz NOT NULL DEFAULT now(),
  incident_date date,
  color text,
  brand text,
  image_url text,
  contact_info text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Items: anyone authenticated can read all items
DROP POLICY IF EXISTS "items_select_all" ON items;
CREATE POLICY "items_select_all" ON items FOR SELECT
  TO authenticated USING (true);

-- Items: authenticated users can insert their own
DROP POLICY IF EXISTS "items_insert_own" ON items;
CREATE POLICY "items_insert_own" ON items FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = reported_by);

-- Items: users can update their own; admins can update any
DROP POLICY IF EXISTS "items_update_own_or_admin" ON items;
CREATE POLICY "items_update_own_or_admin" ON items FOR UPDATE
  TO authenticated USING (
    auth.uid() = reported_by
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    auth.uid() = reported_by
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Items: users can delete their own; admins can delete any
DROP POLICY IF EXISTS "items_delete_own_or_admin" ON items;
CREATE POLICY "items_delete_own_or_admin" ON items FOR DELETE
  TO authenticated USING (
    auth.uid() = reported_by
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- CLAIMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  claimant_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  message text NOT NULL,
  verification_answer text,
  handover_date timestamptz,
  handover_notes text,
  reviewed_by uuid REFERENCES auth.users(id),
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Claims: users can read their own claims; admins can read all; item owners can see claims on their items
DROP POLICY IF EXISTS "claims_select_own_or_admin" ON claims;
CREATE POLICY "claims_select_own_or_admin" ON claims FOR SELECT
  TO authenticated USING (
    auth.uid() = claimant_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
    OR EXISTS (SELECT 1 FROM items WHERE items.id = claims.item_id AND items.reported_by = auth.uid())
  );

-- Claims: authenticated users can insert their own claims
DROP POLICY IF EXISTS "claims_insert_own" ON claims;
CREATE POLICY "claims_insert_own" ON claims FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = claimant_id);

-- Claims: users can update their own (withdraw); admins can update any (approve/reject)
DROP POLICY IF EXISTS "claims_update_own_or_admin" ON claims;
CREATE POLICY "claims_update_own_or_admin" ON claims FOR UPDATE
  TO authenticated USING (
    auth.uid() = claimant_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    auth.uid() = claimant_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Claims: users can delete (withdraw) their own; admins can delete any
DROP POLICY IF EXISTS "claims_delete_own_or_admin" ON claims;
CREATE POLICY "claims_delete_own_or_admin" ON claims FOR DELETE
  TO authenticated USING (
    auth.uid() = claimant_id
    OR EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_items_type ON items(type);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_location ON items(location_id);
CREATE INDEX IF NOT EXISTS idx_items_reported_by ON items(reported_by);
CREATE INDEX IF NOT EXISTS idx_claims_item ON claims(item_id);
CREATE INDEX IF NOT EXISTS idx_claims_claimant ON claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims(status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS items_updated_at ON items;
CREATE TRIGGER items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS claims_updated_at ON claims;
CREATE TRIGGER claims_updated_at BEFORE UPDATE ON claims
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();