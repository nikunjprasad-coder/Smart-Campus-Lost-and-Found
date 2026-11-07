-- Add direct foreign keys from items/claims to profiles.user_id
-- so PostgREST can resolve the reporter/claimant/reviewer joins
-- used across Browse, MyClaims, MyReports, AdminItems, and AdminClaims.

-- profiles.user_id is already UNIQUE, so it can be a FK target.

ALTER TABLE items
  DROP CONSTRAINT IF EXISTS items_reported_by_profiles_fkey;

ALTER TABLE items
  ADD CONSTRAINT items_reported_by_profiles_fkey
  FOREIGN KEY (reported_by) REFERENCES profiles(user_id)
  ON DELETE CASCADE;

ALTER TABLE claims
  DROP CONSTRAINT IF EXISTS claims_claimant_id_profiles_fkey;

ALTER TABLE claims
  ADD CONSTRAINT claims_claimant_id_profiles_fkey
  FOREIGN KEY (claimant_id) REFERENCES profiles(user_id)
  ON DELETE CASCADE;

ALTER TABLE claims
  DROP CONSTRAINT IF EXISTS claims_reviewed_by_profiles_fkey;

ALTER TABLE claims
  ADD CONSTRAINT claims_reviewed_by_profiles_fkey
  FOREIGN KEY (reviewed_by) REFERENCES profiles(user_id)
  ON DELETE SET NULL;
