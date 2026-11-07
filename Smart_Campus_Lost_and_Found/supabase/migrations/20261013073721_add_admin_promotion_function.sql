/*
# Admin Promotion Function

## Overview
Adds a SECURITY DEFINER function that allows an existing admin to promote
or demote any user's role. Also adds an admin signup code mechanism so
new admin accounts can be created at registration time using a secret code.

## Changes
1. New Function: `promote_user(target_user_id uuid, new_role text)`
   - Callable only by authenticated users whose own profile has role='admin'
   - Sets the target user's profile role to 'user' or 'admin'
   - Raises an exception if the caller is not an admin
   - Prevents an admin from demoting themselves (to avoid locking out all admins)

2. New Function: `is_valid_admin_code(code text)`
   - Returns true if the provided code matches the admin signup code
   - The admin code is stored as a custom PostgreSQL setting `app.admin_code`
   - Defaults to 'CAMPUS-ADMIN-2026' if the setting is not configured
   - Used by the frontend to validate the admin code during signup

3. Security
   - Both functions are SECURITY DEFINER so they can update profiles.role
     (which normal users cannot do via RLS)
   - promote_user checks caller's admin status via auth.uid()
   - is_valid_admin_code does not expose any sensitive data
*/

-- ============================================================
-- Function: promote_user
-- ============================================================
-- Allows an admin to set another user's role to 'user' or 'admin'.
-- The caller must be an admin. An admin cannot demote themselves.
CREATE OR REPLACE FUNCTION promote_user(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  target_count int;
BEGIN
  -- Validate new_role
  IF new_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'Invalid role. Must be ''user'' or ''admin''.';
  END IF;

  -- Get caller's role
  SELECT role INTO caller_role FROM profiles WHERE user_id = auth.uid();
  IF caller_role IS NULL OR caller_role != 'admin' THEN
    RAISE EXCEPTION 'Only administrators can change user roles.';
  END IF;

  -- Prevent self-demotion to avoid locking out all admins
  IF target_user_id = auth.uid() AND new_role != 'admin' THEN
    RAISE EXCEPTION 'You cannot demote your own admin account.';
  END IF;

  -- Check target exists
  SELECT count(*) INTO target_count FROM profiles WHERE user_id = target_user_id;
  IF target_count = 0 THEN
    RAISE EXCEPTION 'Target user not found.';
  END IF;

  -- Update the target user's role
  UPDATE profiles SET role = new_role, updated_at = now() WHERE user_id = target_user_id;
END;
$$;

-- Grant execute to authenticated users (the function itself checks admin status)
GRANT EXECUTE ON FUNCTION promote_user(uuid, text) TO authenticated;

-- ============================================================
-- Function: is_valid_admin_code
-- ============================================================
-- Checks if the provided admin signup code is correct.
-- The code is stored in a custom GUC setting; defaults to a known value.
CREATE OR REPLACE FUNCTION is_valid_admin_code(code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stored_code text;
BEGIN
  stored_code := current_setting('app.admin_code', true);
  IF stored_code IS NULL THEN
    stored_code := 'CAMPUS-ADMIN-2026';
  END IF;
  RETURN lower(trim(code)) = lower(trim(stored_code));
END;
$$;

GRANT EXECUTE ON FUNCTION is_valid_admin_code(text) TO authenticated;
