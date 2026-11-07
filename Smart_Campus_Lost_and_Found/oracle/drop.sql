-- ============================================================
-- Smart Campus Lost and Found System
-- Oracle SQL DROP Script (for cleanup/reset)
-- ============================================================
-- Run this to drop all tables, triggers, procedures, and
-- functions created by the schema. Use with caution!
-- ============================================================

DROP TRIGGER trg_auto_admin_first_user;
DROP TRIGGER trg_claims_updated;
DROP TRIGGER trg_found_reports_updated;
DROP TRIGGER trg_lost_reports_updated;
DROP TRIGGER trg_items_updated;
DROP TRIGGER trg_users_updated;

DROP FUNCTION fn_get_dashboard_stats;
DROP FUNCTION fn_find_potential_matches;

DROP PROCEDURE sp_review_claim;
DROP PROCEDURE sp_submit_claim;
DROP PROCEDURE sp_report_found_item;
DROP PROCEDURE sp_report_lost_item;

DROP TABLE ITEM_MATCHES CASCADE CONSTRAINTS;
DROP TABLE CLAIMS CASCADE CONSTRAINTS;
DROP TABLE FOUND_REPORTS CASCADE CONSTRAINTS;
DROP TABLE LOST_REPORTS CASCADE CONSTRAINTS;
DROP TABLE ITEMS CASCADE CONSTRAINTS;
DROP TABLE LOCATIONS CASCADE CONSTRAINTS;
DROP TABLE CATEGORIES CASCADE CONSTRAINTS;
DROP TABLE USERS CASCADE CONSTRAINTS;

-- Drop sequences if they were created (for Oracle 11g)
-- DROP SEQUENCE seq_users;
-- DROP SEQUENCE seq_categories;
-- DROP SEQUENCE seq_locations;
-- DROP SEQUENCE seq_items;
-- DROP SEQUENCE seq_lost_reports;
-- DROP SEQUENCE seq_found_reports;
-- DROP SEQUENCE seq_claims;
-- DROP SEQUENCE seq_matches;

COMMIT;
