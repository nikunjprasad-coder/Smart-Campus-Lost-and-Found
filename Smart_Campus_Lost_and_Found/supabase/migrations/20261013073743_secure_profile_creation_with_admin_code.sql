/*
# Secure Profile Creation with Admin Code

## Overview
Tightens profile insertion so users cannot self-assign the 'admin' role
during signup. Adds a SECURITY DEFINER function `create_profile` that
validates an optional admin code before setting the role. The frontend
will call this RPC instead of inserting directly into the profiles table.

## Changes
1. New Function: `create_profile(p_full_name text, p_student_id text, p_phone text, p_admin_code text)`
   - Inserts a profile for the calling user (auth.uid())
   - If p_admin_code is provided and valid (via is_valid_admin_code), role = 'admin'
   - Otherwise role = 'user'
   - Returns the new profile's id

2. RLS Policy Update:
   - The existing profiles_insert_own policy now also checks that role = 'user'
   - This prevents direct admin role injection via client-side inserts
   - The create_profile function (SECURITY DEFINER) bypasses RLS to set admin role

3. Security
   - create_profile is SECURITY DEFINER, so it can insert any role
   - It validates the admin code server-side before assigning admin
   - The tightened INSERT policy ensures direct client inserts can only be 'user'
*/

-- ============================================================
-- Function: create_profile
-- ============================================================
CREATE OR REPLACE FUNCTION create_profile(
  p_full_name text,
  p_student_id text,
  p_phone text,
  p_admin_code text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
  new_role text := 'user';
BEGIN
  -- Check admin code if provided
  IF p_admin_code IS NOT NULL AND trim(p_admin_code) != '' THEN
    IF is_valid_admin_code(p_admin_code) THEN
      new_role := 'admin';
    ELSE
      RAISE EXCEPTION 'Invalid admin code.';
    END IF;
  END IF;

  -- Insert the profile for the calling user
  INSERT INTO profiles (user_id, full_name, student_id, phone, role)
  VALUES (auth.uid(), p_full_name, p_student_id, p_phone, new_role)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_profile(text, text, text, text) TO authenticated;

-- ============================================================
-- Tighten the profiles INSERT policy
-- ============================================================
-- Only allow direct inserts with role='user'. Admin-role inserts
-- must go through the create_profile SECURITY DEFINER function.
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id AND role = 'user');
