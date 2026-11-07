-- ============================================================
-- Smart Campus Lost and Found System
-- Oracle SQL Schema Definition
-- ============================================================
-- This script creates the complete database schema for the
-- Smart Campus Lost and Found System using Oracle SQL.
-- Run this on an Oracle Database (12c or later recommended).
-- ============================================================

-- ============================================================
-- 1. USERS TABLE
-- ============================================================
-- Stores campus user accounts (students, staff, admins)
CREATE TABLE USERS (
    user_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email            VARCHAR2(255) NOT NULL UNIQUE,
    password_hash    VARCHAR2(255) NOT NULL,
    full_name        VARCHAR2(100) NOT NULL,
    student_id       VARCHAR2(20),
    phone            VARCHAR2(20),
    role             VARCHAR2(10) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

-- ============================================================
-- 2. CATEGORIES TABLE
-- ============================================================
-- Item categories (Electronics, Clothing, Books, etc.)
CREATE TABLE CATEGORIES (
    category_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name             VARCHAR2(50) NOT NULL UNIQUE,
    description      VARCHAR2(255),
    sort_order       NUMBER DEFAULT 0 NOT NULL,
    created_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

-- ============================================================
-- 3. LOCATIONS TABLE
-- ============================================================
-- Campus locations where items were lost or found
CREATE TABLE LOCATIONS (
    location_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name             VARCHAR2(100) NOT NULL UNIQUE,
    building         VARCHAR2(100),
    floor            VARCHAR2(20),
    description      VARCHAR2(255),
    sort_order       NUMBER DEFAULT 0 NOT NULL,
    created_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);

-- ============================================================
-- 4. ITEMS TABLE
-- ============================================================
-- Unified table for both lost and found items
CREATE TABLE ITEMS (
    item_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type             VARCHAR2(5) NOT NULL CHECK (type IN ('lost', 'found')),
    title            VARCHAR2(200) NOT NULL,
    description      CLOB,
    category_id      NUMBER,
    location_id      NUMBER,
    reported_by      NUMBER NOT NULL,
    status           VARCHAR2(10) NOT NULL DEFAULT 'active'
                     CHECK (status IN ('active', 'matched', 'claimed', 'resolved', 'expired')),
    color            VARCHAR2(50),
    brand            VARCHAR2(100),
    image_url        VARCHAR2(500),
    contact_info     VARCHAR2(200),
    incident_date    DATE,
    report_date      TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    created_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

    -- Foreign key constraints
    CONSTRAINT fk_items_category FOREIGN KEY (category_id) REFERENCES CATEGORIES(category_id) ON DELETE SET NULL,
    CONSTRAINT fk_items_location FOREIGN KEY (location_id) REFERENCES LOCATIONS(location_id) ON DELETE SET NULL,
    CONSTRAINT fk_items_user FOREIGN KEY (reported_by) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 5. LOST_REPORTS TABLE
-- ============================================================
-- Detailed lost item reports (linked to ITEMS table)
CREATE TABLE LOST_REPORTS (
    report_id        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_id          NUMBER NOT NULL,
    reporter_id      NUMBER NOT NULL,
    last_seen_date   DATE,
    last_seen_location VARCHAR2(200),
    reward_amount    NUMBER(10, 2),
    is_urgent        CHAR(1) DEFAULT 'N' CHECK (is_urgent IN ('Y', 'N')),
    report_status    VARCHAR2(15) NOT NULL DEFAULT 'active'
                     CHECK (report_status IN ('active', 'matched', 'resolved', 'expired')),
    created_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT fk_lost_item FOREIGN KEY (item_id) REFERENCES ITEMS(item_id) ON DELETE CASCADE,
    CONSTRAINT fk_lost_reporter FOREIGN KEY (reporter_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 6. FOUND_REPORTS TABLE
-- ============================================================
-- Detailed found item reports (linked to ITEMS table)
CREATE TABLE FOUND_REPORTS (
    report_id        NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_id          NUMBER NOT NULL,
    finder_id        NUMBER NOT NULL,
    found_date       DATE,
    found_location   VARCHAR2(200),
    storage_location VARCHAR2(200),
    is_handed_to_admin CHAR(1) DEFAULT 'N' CHECK (is_handed_to_admin IN ('Y', 'N')),
    report_status    VARCHAR2(15) NOT NULL DEFAULT 'active'
                     CHECK (report_status IN ('active', 'claimed', 'resolved', 'expired')),
    created_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT fk_found_item FOREIGN KEY (item_id) REFERENCES ITEMS(item_id) ON DELETE CASCADE,
    CONSTRAINT fk_found_finder FOREIGN KEY (finder_id) REFERENCES USERS(user_id) ON DELETE CASCADE
);

-- ============================================================
-- 7. CLAIMS TABLE
-- ============================================================
-- Claims submitted by users for found items they believe are theirs
CREATE TABLE CLAIMS (
    claim_id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_id          NUMBER NOT NULL,
    claimant_id      NUMBER NOT NULL,
    status           VARCHAR2(10) NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    claim_message    CLOB NOT NULL,
    verification_answer VARCHAR2(500),
    handover_date    TIMESTAMP,
    handover_notes   VARCHAR2(500),
    reviewed_by      NUMBER,
    reviewed_at      TIMESTAMP,
    created_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT fk_claim_item FOREIGN KEY (item_id) REFERENCES ITEMS(item_id) ON DELETE CASCADE,
    CONSTRAINT fk_claim_claimant FOREIGN KEY (claimant_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_claim_reviewer FOREIGN KEY (reviewed_by) REFERENCES USERS(user_id) ON DELETE SET NULL
);

-- ============================================================
-- 8. ITEM_MATCHES TABLE
-- ============================================================
-- Tracks potential matches between lost and found items
CREATE TABLE ITEM_MATCHES (
    match_id         NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lost_item_id     NUMBER NOT NULL,
    found_item_id    NUMBER NOT NULL,
    match_score      NUMBER(3) DEFAULT 0,
    match_status     VARCHAR2(15) NOT NULL DEFAULT 'potential'
                     CHECK (match_status IN ('potential', 'confirmed', 'rejected')),
    matched_by       NUMBER,
    created_at       TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,

    CONSTRAINT fk_match_lost FOREIGN KEY (lost_item_id) REFERENCES ITEMS(item_id) ON DELETE CASCADE,
    CONSTRAINT fk_match_found FOREIGN KEY (found_item_id) REFERENCES ITEMS(item_id) ON DELETE CASCADE,
    CONSTRAINT fk_match_user FOREIGN KEY (matched_by) REFERENCES USERS(user_id) ON DELETE SET NULL,

    CONSTRAINT chk_match_types CHECK (
        EXISTS (SELECT 1 FROM ITEMS i1 WHERE i1.item_id = lost_item_id AND i1.type = 'lost')
        AND EXISTS (SELECT 1 FROM ITEMS i2 WHERE i2.item_id = found_item_id AND i2.type = 'found')
    )
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_users_email ON USERS(email);
CREATE INDEX idx_items_type ON ITEMS(type);
CREATE INDEX idx_items_status ON ITEMS(status);
CREATE INDEX idx_items_category ON ITEMS(category_id);
CREATE INDEX idx_items_location ON ITEMS(location_id);
CREATE INDEX idx_items_reported_by ON ITEMS(reported_by);
CREATE INDEX idx_lost_reports_item ON LOST_REPORTS(item_id);
CREATE INDEX idx_lost_reports_reporter ON LOST_REPORTS(reporter_id);
CREATE INDEX idx_found_reports_item ON FOUND_REPORTS(item_id);
CREATE INDEX idx_found_reports_finder ON FOUND_REPORTS(finder_id);
CREATE INDEX idx_claims_item ON CLAIMS(item_id);
CREATE INDEX idx_claims_claimant ON CLAIMS(claimant_id);
CREATE INDEX idx_claims_status ON CLAIMS(status);
CREATE INDEX idx_matches_lost ON ITEM_MATCHES(lost_item_id);
CREATE INDEX idx_matches_found ON ITEM_MATCHES(found_item_id);

-- ============================================================
-- SEQUENCES (alternative to IDENTITY columns for older Oracle versions)
-- ============================================================
-- If using Oracle 11g or earlier, replace IDENTITY columns with sequences:
-- CREATE SEQUENCE seq_users START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
-- CREATE SEQUENCE seq_categories START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
-- CREATE SEQUENCE seq_locations START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
-- CREATE SEQUENCE seq_items START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
-- CREATE SEQUENCE seq_lost_reports START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
-- CREATE SEQUENCE seq_found_reports START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
-- CREATE SEQUENCE seq_claims START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;
-- CREATE SEQUENCE seq_matches START WITH 1 INCREMENT BY 1 NOCACHE NOCYCLE;

-- ============================================================
-- TRIGGERS: Auto-update updated_at
-- ============================================================
CREATE OR REPLACE TRIGGER trg_users_updated
BEFORE UPDATE ON USERS
FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_items_updated
BEFORE UPDATE ON ITEMS
FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_lost_reports_updated
BEFORE UPDATE ON LOST_REPORTS
FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_found_reports_updated
BEFORE UPDATE ON FOUND_REPORTS
FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSTIMESTAMP;
END;
/

CREATE OR REPLACE TRIGGER trg_claims_updated
BEFORE UPDATE ON CLAIMS
FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSTIMESTAMP;
END;
/

-- ============================================================
-- TRIGGER: Auto-assign first user as admin
-- ============================================================
CREATE OR REPLACE TRIGGER trg_auto_admin_first_user
AFTER INSERT ON USERS
FOR EACH ROW
DECLARE
    v_user_count NUMBER;
BEGIN
    SELECT COUNT(*) INTO v_user_count FROM USERS;
    IF v_user_count = 1 THEN
        UPDATE USERS SET role = 'admin' WHERE user_id = :NEW.user_id;
    END IF;
END;
/

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

-- Procedure to report a lost item
CREATE OR REPLACE PROCEDURE sp_report_lost_item(
    p_user_id        IN NUMBER,
    p_title          IN VARCHAR2,
    p_description    IN CLOB,
    p_category_id    IN NUMBER,
    p_location_id    IN NUMBER,
    p_color          IN VARCHAR2,
    p_brand          IN VARCHAR2,
    p_image_url      IN VARCHAR2,
    p_contact_info   IN VARCHAR2,
    p_incident_date  IN DATE,
    p_last_seen_date IN DATE,
    p_reward_amount  IN NUMBER DEFAULT NULL,
    p_is_urgent      IN CHAR DEFAULT 'N',
    p_item_id        OUT NUMBER,
    p_report_id      OUT NUMBER
)
AS
BEGIN
    -- Insert into ITEMS
    INSERT INTO ITEMS (type, title, description, category_id, location_id, reported_by,
                      status, color, brand, image_url, contact_info, incident_date)
    VALUES ('lost', p_title, p_description, p_category_id, p_location_id, p_user_id,
            'active', p_color, p_brand, p_image_url, p_contact_info, p_incident_date)
    RETURNING item_id INTO p_item_id;

    -- Insert into LOST_REPORTS
    INSERT INTO LOST_REPORTS (item_id, reporter_id, last_seen_date, last_seen_location,
                              reward_amount, is_urgent, report_status)
    VALUES (p_item_id, p_user_id, p_last_seen_date, NULL, p_reward_amount, p_is_urgent, 'active')
    RETURNING report_id INTO p_report_id;

    COMMIT;
END;
/

-- Procedure to report a found item
CREATE OR REPLACE PROCEDURE sp_report_found_item(
    p_user_id         IN NUMBER,
    p_title           IN VARCHAR2,
    p_description     IN CLOB,
    p_category_id     IN NUMBER,
    p_location_id     IN NUMBER,
    p_color           IN VARCHAR2,
    p_brand           IN VARCHAR2,
    p_image_url       IN VARCHAR2,
    p_contact_info    IN VARCHAR2,
    p_found_date      IN DATE,
    p_found_location  IN VARCHAR2,
    p_storage_location IN VARCHAR2,
    p_item_id         OUT NUMBER,
    p_report_id       OUT NUMBER
)
AS
BEGIN
    -- Insert into ITEMS
    INSERT INTO ITEMS (type, title, description, category_id, location_id, reported_by,
                      status, color, brand, image_url, contact_info, incident_date)
    VALUES ('found', p_title, p_description, p_category_id, p_location_id, p_user_id,
            'active', p_color, p_brand, p_image_url, p_contact_info, p_found_date)
    RETURNING item_id INTO p_item_id;

    -- Insert into FOUND_REPORTS
    INSERT INTO FOUND_REPORTS (item_id, finder_id, found_date, found_location,
                               storage_location, is_handed_to_admin, report_status)
    VALUES (p_item_id, p_user_id, p_found_date, p_found_location, p_storage_location, 'N', 'active')
    RETURNING report_id INTO p_report_id;

    COMMIT;
END;
/

-- Procedure to submit a claim
CREATE OR REPLACE PROCEDURE sp_submit_claim(
    p_item_id         IN NUMBER,
    p_claimant_id     IN NUMBER,
    p_message         IN CLOB,
    p_verification    IN VARCHAR2,
    p_claim_id        OUT NUMBER
)
AS
    v_item_type VARCHAR2(5);
    v_item_status VARCHAR2(10);
    v_existing_claim NUMBER;
BEGIN
    -- Verify the item exists, is found, and is active
    SELECT type, status INTO v_item_type, v_item_status
    FROM ITEMS WHERE item_id = p_item_id;

    IF v_item_type != 'found' THEN
        RAISE_APPLICATION_ERROR(-20001, 'Claims can only be submitted for found items');
    END IF;

    IF v_item_status != 'active' THEN
        RAISE_APPLICATION_ERROR(-20002, 'This item is no longer available for claims');
    END IF;

    -- Check for existing claim by same user
    SELECT COUNT(*) INTO v_existing_claim FROM CLAIMS
    WHERE item_id = p_item_id AND claimant_id = p_claimant_id
      AND status IN ('pending', 'approved');

    IF v_existing_claim > 0 THEN
        RAISE_APPLICATION_ERROR(-20003, 'You have already submitted a claim for this item');
    END IF;

    -- Insert claim
    INSERT INTO CLAIMS (item_id, claimant_id, status, claim_message, verification_answer)
    VALUES (p_item_id, p_claimant_id, 'pending', p_message, p_verification)
    RETURNING claim_id INTO p_claim_id;

    COMMIT;
END;
/

-- Procedure to approve/reject a claim (admin only)
CREATE OR REPLACE PROCEDURE sp_review_claim(
    p_claim_id        IN NUMBER,
    p_admin_id        IN NUMBER,
    p_new_status      IN VARCHAR2,
    p_handover_notes  IN VARCHAR2 DEFAULT NULL
)
AS
    v_admin_role VARCHAR2(10);
    v_item_id NUMBER;
BEGIN
    -- Verify admin role
    SELECT role INTO v_admin_role FROM USERS WHERE user_id = p_admin_id;
    IF v_admin_role != 'admin' THEN
        RAISE_APPLICATION_ERROR(-20004, 'Only administrators can review claims');
    END IF;

    -- Get item_id for the claim
    SELECT item_id INTO v_item_id FROM CLAIMS WHERE claim_id = p_claim_id;

    -- Update claim
    UPDATE CLAIMS
    SET status = p_new_status,
        reviewed_by = p_admin_id,
        reviewed_at = SYSTIMESTAMP,
        handover_notes = p_handover_notes,
        handover_date = CASE WHEN p_new_status = 'approved' THEN SYSTIMESTAMP ELSE NULL END
    WHERE claim_id = p_claim_id;

    -- If approved, mark item as resolved
    IF p_new_status = 'approved' THEN
        UPDATE ITEMS SET status = 'resolved' WHERE item_id = v_item_id;
        UPDATE FOUND_REPORTS SET report_status = 'resolved' WHERE item_id = v_item_id;
    END IF;

    COMMIT;
END;
/

-- Function to find potential matches between lost and found items
CREATE OR REPLACE FUNCTION fn_find_potential_matches(
    p_lost_item_id IN NUMBER
) RETURN SYS_REFCURSOR
AS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT f.item_id, f.title, f.description, f.color, f.brand,
               c.name AS category_name, l.name AS location_name,
               f.incident_date, f.report_date
        FROM ITEMS f
        LEFT JOIN CATEGORIES c ON f.category_id = c.category_id
        LEFT JOIN LOCATIONS l ON f.location_id = l.location_id
        WHERE f.type = 'found'
          AND f.status = 'active'
          AND f.item_id != p_lost_item_id
          AND (
              f.category_id = (SELECT category_id FROM ITEMS WHERE item_id = p_lost_item_id)
              OR (f.color IS NOT NULL AND f.color = (SELECT color FROM ITEMS WHERE item_id = p_lost_item_id))
              OR (f.brand IS NOT NULL AND f.brand = (SELECT brand FROM ITEMS WHERE item_id = p_lost_item_id))
          )
        ORDER BY f.report_date DESC;
    RETURN v_cursor;
END;
/

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION fn_get_dashboard_stats
RETURN SYS_REFCURSOR
AS
    v_cursor SYS_REFCURSOR;
BEGIN
    OPEN v_cursor FOR
        SELECT
            (SELECT COUNT(*) FROM ITEMS WHERE type = 'lost' AND status = 'active') AS active_lost,
            (SELECT COUNT(*) FROM ITEMS WHERE type = 'found' AND status = 'active') AS active_found,
            (SELECT COUNT(*) FROM ITEMS WHERE status = 'resolved') AS resolved_items,
            (SELECT COUNT(*) FROM USERS) AS total_users,
            (SELECT COUNT(*) FROM CLAIMS WHERE status = 'pending') AS pending_claims,
            (SELECT COUNT(*) FROM CLAIMS) AS total_claims,
            (SELECT COUNT(*) FROM ITEMS) AS total_items
        FROM DUAL;
    RETURN v_cursor;
END;
/

COMMIT;

-- ============================================================
-- END OF SCHEMA DEFINITION
-- ============================================================
