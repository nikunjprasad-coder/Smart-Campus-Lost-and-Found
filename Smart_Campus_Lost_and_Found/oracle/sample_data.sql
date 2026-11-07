-- ============================================================
-- Smart Campus Lost and Found System
-- Oracle SQL Sample Data
-- ============================================================
-- Run this after schema.sql to populate the database with
-- sample categories, locations, users, items, and claims.
-- ============================================================

-- ============================================================
-- 1. CATEGORIES
-- ============================================================
INSERT INTO CATEGORIES (name, description, sort_order) VALUES ('Electronics', 'Phones, laptops, tablets, chargers, headphones', 1);
INSERT INTO CATEGORIES (name, description, sort_order) VALUES ('Clothing & Accessories', 'Jackets, bags, jewelry, watches, umbrellas', 2);
INSERT INTO CATEGORIES (name, description, sort_order) VALUES ('Books & Stationery', 'Textbooks, notebooks, pens, calculators', 3);
INSERT INTO CATEGORIES (name, description, sort_order) VALUES ('Keys & Cards', 'Keycards, keys, ID cards, access badges', 4);
INSERT INTO CATEGORIES (name, description, sort_order) VALUES ('Wallets & Purses', 'Wallets, purses, coin pouches', 5);
INSERT INTO CATEGORIES (name, description, sort_order) VALUES ('Bags & Backpacks', 'Backpacks, tote bags, luggage', 6);
INSERT INTO CATEGORIES (name, description, sort_order) VALUES ('Sports Equipment', 'Gym gear, sports balls, equipment', 7);
INSERT INTO CATEGORIES (name, description, sort_order) VALUES ('Other', 'Miscellaneous items', 8);

-- ============================================================
-- 2. LOCATIONS
-- ============================================================
INSERT INTO LOCATIONS (name, building, floor, description, sort_order) VALUES ('Main Library', 'Library Building', '1st Floor', 'Central campus library study area', 1);
INSERT INTO LOCATIONS (name, building, floor, description, sort_order) VALUES ('Science Building', 'Science Block', 'Various', 'Lecture halls and labs', 2);
INSERT INTO LOCATIONS (name, building, floor, description, sort_order) VALUES ('Student Cafeteria', 'Student Center', 'Ground Floor', 'Main dining hall', 3);
INSERT INTO LOCATIONS (name, building, floor, description, sort_order) VALUES ('Gymnasium', 'Sports Complex', '1st Floor', 'Indoor sports and fitness center', 4);
INSERT INTO LOCATIONS (name, building, floor, description, sort_order) VALUES ('Lecture Hall A', 'Academic Block A', '2nd Floor', 'Large lecture theater', 5);
INSERT INTO LOCATIONS (name, building, floor, description, sort_order) VALUES ('Computer Lab', 'IT Building', '3rd Floor', 'Open access computer lab', 6);
INSERT INTO LOCATIONS (name, building, floor, description, sort_order) VALUES ('Campus Bus Stop', 'Outside', 'Ground', 'Main campus bus terminal', 7);
INSERT INTO LOCATIONS (name, building, floor, description, sort_order) VALUES ('Student Lounge', 'Student Center', '2nd Floor', 'Relaxation and study lounge', 8);
INSERT INTO LOCATIONS (name, building, floor, description, sort_order) VALUES ('Auditorium', 'Arts Building', 'Ground Floor', 'Main event auditorium', 9);
INSERT INTO LOCATIONS (name, building, floor, description, sort_order) VALUES ('Parking Lot B', 'Outside', 'Ground', 'Student parking area', 10);

-- ============================================================
-- 3. USERS (sample users with hashed passwords)
-- ============================================================
-- NOTE: In production, password_hash should be a properly salted hash
-- (e.g., bcrypt). These are placeholder hashes for demo purposes.
-- The first user inserted will automatically become admin via trigger.

INSERT INTO USERS (email, password_hash, full_name, student_id, phone, role) VALUES ('admin@campus.edu', 'hashed_admin_pass_123', 'System Administrator', 'ADM001', '555-0100', 'admin');
INSERT INTO USERS (email, password_hash, full_name, student_id, phone, role) VALUES ('john.doe@campus.edu', 'hashed_pass_456', 'John Doe', 'STU1001', '555-0101', 'user');
INSERT INTO USERS (email, password_hash, full_name, student_id, phone, role) VALUES ('jane.smith@campus.edu', 'hashed_pass_789', 'Jane Smith', 'STU1002', '555-0102', 'user');
INSERT INTO USERS (email, password_hash, full_name, student_id, phone, role) VALUES ('mike.johnson@campus.edu', 'hashed_pass_012', 'Mike Johnson', 'STU1003', '555-0103', 'user');
INSERT INTO USERS (email, password_hash, full_name, student_id, phone, role) VALUES ('sarah.williams@campus.edu', 'hashed_pass_345', 'Sarah Williams', 'STU1004', '555-0104', 'user');

-- ============================================================
-- 4. ITEMS (Lost and Found)
-- ============================================================
-- Lost Items
INSERT INTO ITEMS (type, title, description, category_id, location_id, reported_by, status, color, brand, incident_date, contact_info)
VALUES ('lost', 'Black iPhone 13 with blue case', 'Lost my iPhone 13 in a dark blue silicone case. Has a sticker on the back. Screen has a small scratch on top right corner.', 1, 1, 2, 'active', 'Black', 'Apple', TO_DATE('2026-10-08', 'YYYY-MM-DD'), 'john.doe@campus.edu');

INSERT INTO ITEMS (type, title, description, category_id, location_id, reported_by, status, color, brand, incident_date, contact_info)
VALUES ('lost', 'Brown leather wallet', 'Brown leather bifold wallet. Contains student ID, driver license, and some cash. Very important to me.', 5, 3, 3, 'active', 'Brown', 'Fossil', TO_DATE('2026-10-09', 'YYYY-MM-DD'), '555-0102');

INSERT INTO ITEMS (type, title, description, category_id, location_id, reported_by, status, color, brand, incident_date, contact_info)
VALUES ('lost', 'Calculus textbook 8th edition', 'Stewart Calculus 8th edition. Has my name written on the inside cover and lots of highlighted pages.', 3, 5, 4, 'active', NULL, 'Stewart', TO_DATE('2026-10-07', 'YYYY-MM-DD'), 'mike.johnson@campus.edu');

INSERT INTO ITEMS (type, title, description, category_id, location_id, reported_by, status, color, brand, incident_date, contact_info)
VALUES ('lost', 'Silver house keys with red lanyard', 'Set of 3 silver keys on a red university lanyard. One key has a small rubber cover.', 4, 7, 5, 'matched', 'Silver', NULL, TO_DATE('2026-10-05', 'YYYY-MM-DD'), '555-0104');

-- Found Items
INSERT INTO ITEMS (type, title, description, category_id, location_id, reported_by, status, color, brand, incident_date, contact_info)
VALUES ('found', 'Found: Black iPhone near library', 'Found a black iPhone on a study table in the library. Has a blue case with a sticker on the back. Screen has a scratch.', 1, 1, 3, 'active', 'Black', 'Apple', TO_DATE('2026-10-08', 'YYYY-MM-DD'), 'jane.smith@campus.edu');

INSERT INTO ITEMS (type, title, description, category_id, location_id, reported_by, status, color, brand, incident_date, contact_info)
VALUES ('found', 'Found: Brown wallet in cafeteria', 'Found a brown leather wallet on a tray return station. Contains IDs and some cash. Handed to admin office.', 5, 3, 4, 'claimed', 'Brown', 'Fossil', TO_DATE('2026-10-09', 'YYYY-MM-DD'), 'mike.johnson@campus.edu');

INSERT INTO ITEMS (type, title, description, category_id, location_id, reported_by, status, color, brand, incident_date, contact_info)
VALUES ('found', 'Found: Silver keys on red lanyard at bus stop', 'Found a set of silver keys on a red lanyard at the campus bus stop. 3 keys, one with a rubber cover.', 4, 7, 2, 'matched', 'Silver', NULL, TO_DATE('2026-10-06', 'YYYY-MM-DD'), 'john.doe@campus.edu');

INSERT INTO ITEMS (type, title, description, category_id, location_id, reported_by, status, color, brand, incident_date, contact_info)
VALUES ('found', 'Found: Blue water bottle in gym', 'Blue Hydro Flask water bottle left in the gym. Has initials "M.J." engraved on the bottom.', 7, 4, 5, 'active', 'Blue', 'Hydro Flask', TO_DATE('2026-10-10', 'YYYY-MM-DD'), '555-0104');

-- ============================================================
-- 5. LOST_REPORTS (detailed lost report metadata)
-- ============================================================
INSERT INTO LOST_REPORTS (item_id, reporter_id, last_seen_date, last_seen_location, reward_amount, is_urgent, report_status)
VALUES (1, 2, TO_DATE('2026-10-08', 'YYYY-MM-DD'), 'Main Library - 2nd floor study area', 50.00, 'Y', 'active');

INSERT INTO LOST_REPORTS (item_id, reporter_id, last_seen_date, last_seen_location, reward_amount, is_urgent, report_status)
VALUES (2, 3, TO_DATE('2026-10-09', 'YYYY-MM-DD'), 'Student Cafeteria - tray return', 25.00, 'N', 'active');

INSERT INTO LOST_REPORTS (item_id, reporter_id, last_seen_date, last_seen_location, reward_amount, is_urgent, report_status)
VALUES (3, 4, TO_DATE('2026-10-07', 'YYYY-MM-DD'), 'Lecture Hall A - row 5', NULL, 'N', 'active');

INSERT INTO LOST_REPORTS (item_id, reporter_id, last_seen_date, last_seen_location, reward_amount, is_urgent, report_status)
VALUES (4, 5, TO_DATE('2026-10-05', 'YYYY-MM-DD'), 'Campus Bus Stop', NULL, 'N', 'matched');

-- ============================================================
-- 6. FOUND_REPORTS (detailed found report metadata)
-- ============================================================
INSERT INTO FOUND_REPORTS (item_id, finder_id, found_date, found_location, storage_location, is_handed_to_admin, report_status)
VALUES (5, 3, TO_DATE('2026-10-08', 'YYYY-MM-DD'), 'Main Library - 2nd floor table 12', 'Admin Office - Lost & Found Cabinet', 'Y', 'active');

INSERT INTO FOUND_REPORTS (item_id, finder_id, found_date, found_location, storage_location, is_handed_to_admin, report_status)
VALUES (6, 4, TO_DATE('2026-10-09', 'YYYY-MM-DD'), 'Student Cafeteria - tray return', 'Admin Office - Lost & Found Cabinet', 'Y', 'claimed');

INSERT INTO FOUND_REPORTS (item_id, finder_id, found_date, found_location, storage_location, is_handed_to_admin, report_status)
VALUES (7, 2, TO_DATE('2026-10-06', 'YYYY-MM-DD'), 'Campus Bus Stop - bench', 'Admin Office - Lost & Found Cabinet', 'Y', 'matched');

INSERT INTO FOUND_REPORTS (item_id, finder_id, found_date, found_location, storage_location, is_handed_to_admin, report_status)
VALUES (8, 5, TO_DATE('2026-10-10', 'YYYY-MM-DD'), 'Gymnasium - treadmill area 3', 'Gym front desk', 'N', 'active');

-- ============================================================
-- 7. CLAIMS (sample claims)
-- ============================================================
INSERT INTO CLAIMS (item_id, claimant_id, status, claim_message, verification_answer)
VALUES (5, 2, 'pending', 'I lost my iPhone 13 at the library on Oct 8th. It has a blue silicone case with a sticker on the back and a scratch on the top right of the screen. This matches exactly what was found.', 'The sticker is a small star wars logo');

INSERT INTO CLAIMS (item_id, claimant_id, status, claim_message, verification_answer, reviewed_by, reviewed_at, handover_date, handover_notes)
VALUES (6, 3, 'approved', 'This is my brown Fossil wallet. I lost it in the cafeteria. It contains my student ID (STU1002), my driver license, and about $30 in cash.', 'Driver license number: DL-4567890', 1, SYSTIMESTAMP, SYSTIMESTAMP, 'Item handed over at admin office. Student ID verified against wallet contents.');

-- ============================================================
-- 8. ITEM_MATCHES (potential matches between lost and found)
-- ============================================================
INSERT INTO ITEM_MATCHES (lost_item_id, found_item_id, match_score, match_status, matched_by)
VALUES (1, 5, 95, 'confirmed', 1);

INSERT INTO ITEM_MATCHES (lost_item_id, found_item_id, match_score, match_status, matched_by)
VALUES (4, 7, 90, 'confirmed', 1);

COMMIT;

-- ============================================================
-- VERIFICATION QUERIES
-- ============================================================

-- View all items with category and location names
-- SELECT i.item_id, i.type, i.title, i.status, c.name AS category, l.name AS location,
--        u.full_name AS reporter, i.report_date
-- FROM ITEMS i
-- LEFT JOIN CATEGORIES c ON i.category_id = c.category_id
-- LEFT JOIN LOCATIONS l ON i.location_id = l.location_id
-- LEFT JOIN USERS u ON i.reported_by = u.user_id
-- ORDER BY i.report_date DESC;

-- View all claims with item and claimant details
-- SELECT cl.claim_id, cl.status, i.title AS item_title,
--        u.full_name AS claimant, cl.claim_message, cl.created_at
-- FROM CLAIMS cl
-- JOIN ITEMS i ON cl.item_id = i.item_id
-- JOIN USERS u ON cl.claimant_id = u.user_id
-- ORDER BY cl.created_at DESC;

-- View matched lost and found items
-- SELECT im.match_id, li.title AS lost_item, fi.title AS found_item,
--        im.match_score, im.match_status
-- FROM ITEM_MATCHES im
-- JOIN ITEMS li ON im.lost_item_id = li.item_id
-- JOIN ITEMS fi ON im.found_item_id = fi.item_id;

-- Dashboard statistics
-- SELECT
--     (SELECT COUNT(*) FROM ITEMS WHERE type = 'lost' AND status = 'active') AS active_lost,
--     (SELECT COUNT(*) FROM ITEMS WHERE type = 'found' AND status = 'active') AS active_found,
--     (SELECT COUNT(*) FROM ITEMS WHERE status = 'resolved') AS resolved_items,
--     (SELECT COUNT(*) FROM USERS) AS total_users,
--     (SELECT COUNT(*) FROM CLAIMS WHERE status = 'pending') AS pending_claims
-- FROM DUAL;

-- ============================================================
-- END OF SAMPLE DATA
-- ============================================================
