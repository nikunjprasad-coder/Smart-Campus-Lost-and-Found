/*
# Auto-admin for first user

## Overview
Creates a trigger function that automatically assigns the 'admin' role to the very first user who registers on the platform. All subsequent users get the default 'user' role.

## How it works
1. After a profile is inserted, the function checks if it's the only profile in the table.
2. If so, it updates that profile's role to 'admin'.
3. This ensures the system always has at least one admin from the start.
*/

CREATE OR REPLACE FUNCTION assign_first_user_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if this is the first profile
  IF (SELECT COUNT(*) FROM profiles) = 1 THEN
    UPDATE profiles SET role = 'admin' WHERE id = NEW.id;
    NEW.role := 'admin';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS profiles_auto_admin ON profiles;
CREATE TRIGGER profiles_auto_admin
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION assign_first_user_admin();