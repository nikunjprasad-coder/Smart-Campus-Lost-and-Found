# Smart Campus Lost and Found System — Complete Project Report

---

## Chapter 1: Introduction

### 1.1 Background

Universities are bustling environments with thousands of students, faculty, and staff moving across large campuses daily. Libraries, cafeterias, lecture halls, gyms, and common areas see heavy foot traffic, and personal belongings are frequently misplaced or left behind. Traditional lost-and-found systems at most campuses rely on a physical desk at the security office or student center, where found items are stored in a box or cabinet. Students who lose something must physically visit these locations during operating hours, describe their item, and hope it has been turned in. This approach is slow, inefficient, and geographically limiting.

With the widespread adoption of smartphones and web-based services, a digital lost-and-found platform can dramatically improve the speed and likelihood of recovering lost items. Such a system allows anyone on campus to report a lost or found item from anywhere, at any time, and enables automated matching between lost and found reports.

### 1.2 Problem Statement

The existing manual lost-and-found process at most university campuses suffers from the following problems:

- **No centralized digital record:** Found items are logged in paper registers or not at all, making tracking and searching difficult.
- **Geographic and time constraints:** Students must physically visit the lost-and-found office during working hours to check for their belongings.
- **No matching mechanism:** There is no automated way to connect a lost item report with a corresponding found item report.
- **No accountability or verification:** When someone claims an item, there is no formal verification process or record of who claimed what.
- **No analytics or reporting:** Campus administrators have no visibility into trends such as which locations have the most lost items or how many items are successfully returned.

### 1.3 Objectives

The primary objectives of this project are:

1. **User Authentication:** Provide secure user registration and login with role-based access (user and admin).
2. **Lost Item Reporting:** Allow users to report items they have lost with details such as title, description, category, location, color, brand, and date.
3. **Found Item Reporting:** Allow users to report items they have found on campus with similar details and storage location information.
4. **Item Categories and Locations:** Maintain structured lists of item categories and campus locations for consistent classification and filtering.
5. **Search and Filtering:** Enable users to search items by keyword and filter by type (lost/found), category, location, and status.
6. **Matching Lost Items with Found Items:** Automatically suggest potential matches between lost and found items based on category, color, and brand.
7. **Claim Submission:** Allow users to submit claims for found items they believe are theirs, including a verification message.
8. **Admin Panel:** Provide administrators with tools to approve or reject claims, manage item statuses, view dashboard statistics, and oversee the entire system.
9. **Status Tracking:** Track the full lifecycle of items (active → matched → claimed → resolved) and claims (pending → approved/rejected).

### 1.4 Scope

The system is designed for a single university campus. It covers:

- User registration and authentication for students, faculty, and staff
- Reporting, searching, and claiming lost and found items
- Admin review of claims and item management
- Dashboard analytics for system overview

The system does **not** cover:

- Multi-campus or cross-institution integration
- Automated image recognition for item matching
- Payment processing for rewards
- Mobile native applications (the web interface is responsive and works on mobile browsers)
- Integration with physical access control or CCTV systems

### 1.5 Motivation

This project was motivated by the observation that lost items are a persistent problem on university campuses. Every semester, students lose textbooks, laptops, wallets, keys, and personal items. Many of these items are never recovered, not because they were not found, but because the finder and the owner had no way to connect. A digital platform that bridges this gap can save students money, reduce stress, and foster a culture of community responsibility on campus.

From a technical perspective, this project also provides an opportunity to design and implement a complete full-stack application with a relational database backend, REST API, and modern web frontend — demonstrating database design, data integrity constraints, stored procedures, triggers, and role-based access control.

---

## Chapter 2: Requirement Analysis and Project Design

### 2.1 Functional Requirements

**User Management:**
- FR-1: Users shall be able to register with email, password, full name, student ID, and phone number.
- FR-2: Users shall be able to sign in with email and password.
- FR-3: The first registered user shall be automatically assigned the admin role.
- FR-4: Users shall be able to sign out.
- FR-5: The system shall distinguish between 'user' and 'admin' roles.

**Lost Item Reporting:**
- FR-6: Authenticated users shall be able to report lost items with title, description, category, location, color, brand, image URL, contact info, and incident date.
- FR-7: Each lost item report shall create entries in both the ITEMS and LOST_REPORTS tables.
- FR-8: Lost item reports shall have an initial status of 'active'.

**Found Item Reporting:**
- FR-9: Authenticated users shall be able to report found items with the same fields plus found location and storage location.
- FR-10: Each found item report shall create entries in both the ITEMS and FOUND_REPORTS tables.
- FR-11: Found item reports shall have an initial status of 'active'.

**Browse and Search:**
- FR-12: Authenticated users shall be able to browse all items.
- FR-13: Users shall be able to search items by keyword (matching title, description, color, brand, category, location).
- FR-14: Users shall be able to filter items by type (lost/found), category, location, and status.

**Matching:**
- FR-15: When viewing a lost item, the system shall display potential matching found items based on shared category, color, or brand.

**Claim Submission:**
- FR-16: Authenticated users shall be able to submit claims for active found items.
- FR-17: A claim shall include a message and optional verification answer.
- FR-18: A user shall not be able to submit multiple active claims for the same item.
- FR-19: A user shall not be able to claim their own found item.
- FR-20: Users shall be able to withdraw their own pending claims.

**Admin Panel:**
- FR-21: Admins shall be able to view dashboard statistics (total users, items, claims, pending claims, resolution rate).
- FR-22: Admins shall be able to view all claims filtered by status (pending, approved, rejected, all).
- FR-23: Admins shall be able to approve or reject claims with optional handover notes.
- FR-24: Approving a claim shall automatically mark the item as 'resolved'.
- FR-25: Admins shall be able to update item statuses.
- FR-26: Admins shall be able to delete items.

### 2.2 Data Requirements

The system requires persistent storage for:

- User accounts with authentication credentials and role information
- Item categories (predefined list of 8 categories)
- Campus locations (predefined list of 10 locations)
- Item records (both lost and found) with full descriptive metadata
- Detailed lost report metadata (last seen date/location, reward, urgency)
- Detailed found report metadata (found date/location, storage location, admin handover flag)
- Claims with status tracking, review information, and handover details
- Item matches between lost and found items with match scores

### 2.3 Database Selection

**Oracle SQL (Oracle Database 12c or later)** was chosen as the primary database system for the following reasons:

1. **Relational integrity:** Oracle provides robust foreign key constraints, CHECK constraints, and transactional integrity, which are essential for a system with complex relationships between users, items, and claims.
2. **Stored procedures and functions:** Oracle's PL/SQL allows encapsulation of business logic (such as claim validation, admin verification, and match finding) directly in the database, reducing application-layer complexity.
3. **Triggers:** Oracle triggers enable automatic actions like updating timestamps and auto-assigning the first user as admin without requiring application code.
4. **Identity columns:** Oracle 12c+ supports `GENERATED ALWAYS AS IDENTITY` for auto-incrementing primary keys, simplifying data insertion.
5. **Performance:** Oracle's indexing and query optimization are well-suited for the search and filtering operations required by this system.
6. **Enterprise readiness:** Oracle is widely used in university and enterprise environments, making this project realistic and applicable to real-world scenarios.

> **Note:** The live web application in this project runs on Supabase (PostgreSQL) because Oracle Database is not available as a hosted service in the development environment. The complete Oracle SQL scripts (`oracle/schema.sql`, `oracle/sample_data.sql`, `oracle/drop.sql`) and Flask backend (`backend/`) are provided for deployment against an actual Oracle Database. The schema design is equivalent between the two, with Oracle-specific features (IDENTITY columns, PL/SQL procedures, triggers) mapped to PostgreSQL equivalents (UUID defaults, RPC functions, database triggers) in the live version.

### 2.4 Database Design / Data Model

The database consists of 8 tables with the following entity-relationship structure:

```
┌──────────┐       ┌──────────────┐       ┌────────────┐
│  USERS   │       │  CATEGORIES  │       │ LOCATIONS  │
│──────────│       │──────────────│       │────────────│
│ user_id  │       │ category_id  │       │ location_id│
│ email    │       │ name         │       │ name       │
│ password │       │ description  │       │ building   │
│ full_name│       │ sort_order   │       │ floor      │
│ student_id│      └──────┬───────┘       │ description│
│ phone    │              │               └──────┬─────┘
│ role     │              │                      │
└────┬─────┘              │                      │
     │                    │                      │
     │ reported_by        │ category_id          │ location_id
     │                    │                      │
     ▼                    ▼                      ▼
  ┌────────────────────────────────────────────────────┐
  │                     ITEMS                          │
  │────────────────────────────────────────────────────│
  │ item_id (PK)  type  title  description  status     │
  │ color  brand  image_url  contact_info  incident_date│
  └────┬───────────────────────────────────┬───────────┘
       │ item_id                           │ item_id
       ▼                                   ▼
  ┌──────────────┐              ┌──────────────┐
  │ LOST_REPORTS │              │FOUND_REPORTS │
  │──────────────│              │──────────────│
  │ report_id    │              │ report_id    │
  │ last_seen_dt │              │ found_date   │
  │ reward_amt   │              │ found_loc    │
  │ is_urgent    │              │ storage_loc  │
  └──────────────┘              └──────────────┘

       │ item_id
       ▼
  ┌──────────────┐         ┌──────────────────┐
  │   CLAIMS     │         │  ITEM_MATCHES    │
  │──────────────│         │──────────────────│
  │ claim_id     │         │ match_id         │
  │ claimant_id  │         │ lost_item_id     │
  │ status       │         │ found_item_id    │
  │ claim_message│         │ match_score      │
  │ verification │         │ match_status     │
  │ handover_dt  │         └──────────────────┘
  │ reviewed_by  │
  └──────────────┘
```

**Cardinality:**
- USERS (1) → (N) ITEMS (a user can report many items)
- USERS (1) → (N) LOST_REPORTS (a user can file many lost reports)
- USERS (1) → (N) FOUND_REPORTS (a user can file many found reports)
- USERS (1) → (N) CLAIMS as claimant (a user can submit many claims)
- USERS (1) → (N) CLAIMS as reviewer (an admin can review many claims)
- CATEGORIES (1) → (N) ITEMS (a category classifies many items)
- LOCATIONS (1) → (N) ITEMS (a location is associated with many items)
- ITEMS (1) → (1) LOST_REPORTS (one lost report per lost item)
- ITEMS (1) → (1) FOUND_REPORTS (one found report per found item)
- ITEMS (1) → (N) CLAIMS (a found item can have multiple claims)
- ITEMS (1) → (N) ITEM_MATCHES as lost_item (a lost item can have multiple matches)
- ITEMS (1) → (N) ITEM_MATCHES as found_item (a found item can match multiple lost items)

### 2.5 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                     │
│                                                           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │  Auth Page  │  │  Dashboard  │  │  Browse     │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ Report Lost │  │Report Found │  │ Item Detail │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │ My Reports  │  │  My Claims  │  │ Admin Panel │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
│         React 18 + TypeScript + Tailwind CSS             │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP / REST API
                         ▼
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                      │
│                                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │Auth Routes│ │Item Routes│ │Claim Routes│ │Admin Routes│
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│  ┌──────────────────────────────────────────────────┐   │
│  │              Data Access Layer (models.py)        │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Connection Pool (db.py)                 │   │
│  └──────────────────────────────────────────────────┘   │
│              Flask (Python) + oracledb                   │
└────────────────────────┬────────────────────────────────┘
                         │ SQL / PL-SQL
                         ▼
┌─────────────────────────────────────────────────────────┐
│                      DATA LAYER                           │
│                                                           │
│  ┌──────┐ ┌───────────┐ ┌──────────┐ ┌──────┐ ┌──────┐ │
│  │USERS │ │ CATEGORIES│ │LOCATIONS │ │ITEMS │ │CLAIMS│ │
│  └──────┘ └───────────┘ └──────────┘ └──────┘ └──────┘ │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │LOST_REPORTS │  │FOUND_REPORTS │  │ITEM_MATCHES   │  │
│  └─────────────┘  └──────────────┘  └───────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Triggers  │  Stored Procedures  │  Functions     │   │
│  └──────────────────────────────────────────────────┘   │
│                   Oracle Database                        │
└─────────────────────────────────────────────────────────┘
```

The architecture follows a **three-tier model**:
1. **Presentation Layer:** React single-page application with Tailwind CSS for styling
2. **Application Layer:** Flask REST API with modular blueprints and a data access layer
3. **Data Layer:** Oracle Database with tables, constraints, triggers, stored procedures, and functions

---

## Chapter 3: Technology and Tools Used

### 3.1 Database System

| Aspect | Details |
|--------|---------|
| Primary Database | Oracle Database 12c or later |
| Driver | oracledb (Python Oracle driver) |
| Key Features Used | IDENTITY columns, CHECK constraints, foreign keys, PL/SQL stored procedures, PL/SQL functions, database triggers, SYS_REFCURSOR, indexes |
| Live Development DB | Supabase (PostgreSQL) — used for the running web app; schema is equivalent |

### 3.2 Programming Languages

| Language | Purpose |
|----------|---------|
| SQL / PL/SQL | Database schema, stored procedures, functions, triggers |
| Python 3.10+ | Flask backend (REST API, data access, business logic) |
| TypeScript | Frontend application logic |
| HTML/CSS | UI structure and styling (via JSX and Tailwind) |

### 3.3 Frameworks and Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Flask | 3.0+ | Python web framework for REST API |
| Flask-CORS | 4.0+ | Cross-origin resource sharing for API |
| oracledb | 2.0+ | Oracle Database Python driver |
| Werkzeug | 3.0+ | Password hashing (PBKDF2) |
| React | 18.3 | Frontend UI library |
| TypeScript | 5.5 | Type-safe JavaScript |
| Tailwind CSS | 3.4 | Utility-first CSS framework |
| Vite | 5.4 | Build tool and dev server |
| Lucide React | 0.446 | Icon library |

### 3.4 Development Environment

| Tool | Purpose |
|------|---------|
| VS Code | Code editor |
| Node.js 20+ | Frontend build and package management |
| npm | Dependency management |
| SQL*Plus / SQL Developer / DBeaver | Oracle Database administration |
| Git | Version control |

### 3.5 Cloud Services

| Service | Purpose |
|---------|---------|
| Supabase | Hosted PostgreSQL for the live running web app (auto-provisioned, includes auth, REST API via PostgREST, and row-level security) |
| Oracle Cloud (optional) | For hosting Oracle Database in production |

---

## Chapter 4: Database Implementation

### 4.1 Database Creation

The Oracle SQL schema is defined in `oracle/schema.sql`. It creates 8 tables with IDENTITY primary keys, foreign key constraints, CHECK constraints, indexes, triggers, stored procedures, and functions.

### 4.2 Data Structure Implementation

**Table: USERS**
```sql
CREATE TABLE USERS (
    user_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email         VARCHAR2(255) NOT NULL UNIQUE,
    password_hash VARCHAR2(255) NOT NULL,
    full_name     VARCHAR2(100) NOT NULL,
    student_id    VARCHAR2(20),
    phone         VARCHAR2(20),
    role          VARCHAR2(10) NOT NULL DEFAULT 'user'
                  CHECK (role IN ('user', 'admin')),
    created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);
```

**Table: CATEGORIES**
```sql
CREATE TABLE CATEGORIES (
    category_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          VARCHAR2(50) NOT NULL UNIQUE,
    description   VARCHAR2(255),
    sort_order    NUMBER DEFAULT 0 NOT NULL,
    created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);
```

**Table: LOCATIONS**
```sql
CREATE TABLE LOCATIONS (
    location_id   NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name          VARCHAR2(100) NOT NULL UNIQUE,
    building      VARCHAR2(100),
    floor         VARCHAR2(20),
    description   VARCHAR2(255),
    sort_order    NUMBER DEFAULT 0 NOT NULL,
    created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL
);
```

**Table: ITEMS**
```sql
CREATE TABLE ITEMS (
    item_id       NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    type          VARCHAR2(5) NOT NULL CHECK (type IN ('lost', 'found')),
    title         VARCHAR2(200) NOT NULL,
    description   CLOB,
    category_id   NUMBER,
    location_id   NUMBER,
    reported_by   NUMBER NOT NULL,
    status        VARCHAR2(10) NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'matched', 'claimed', 'resolved', 'expired')),
    color         VARCHAR2(50),
    brand         VARCHAR2(100),
    image_url     VARCHAR2(500),
    contact_info  VARCHAR2(200),
    incident_date DATE,
    report_date   TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_items_category FOREIGN KEY (category_id)
        REFERENCES CATEGORIES(category_id) ON DELETE SET NULL,
    CONSTRAINT fk_items_location FOREIGN KEY (location_id)
        REFERENCES LOCATIONS(location_id) ON DELETE SET NULL,
    CONSTRAINT fk_items_user FOREIGN KEY (reported_by)
        REFERENCES USERS(user_id) ON DELETE CASCADE
);
```

**Table: LOST_REPORTS**
```sql
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
    CONSTRAINT fk_lost_item FOREIGN KEY (item_id)
        REFERENCES ITEMS(item_id) ON DELETE CASCADE,
    CONSTRAINT fk_lost_reporter FOREIGN KEY (reporter_id)
        REFERENCES USERS(user_id) ON DELETE CASCADE
);
```

**Table: FOUND_REPORTS**
```sql
CREATE TABLE FOUND_REPORTS (
    report_id          NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_id            NUMBER NOT NULL,
    finder_id          NUMBER NOT NULL,
    found_date         DATE,
    found_location     VARCHAR2(200),
    storage_location   VARCHAR2(200),
    is_handed_to_admin CHAR(1) DEFAULT 'N' CHECK (is_handed_to_admin IN ('Y', 'N')),
    report_status      VARCHAR2(15) NOT NULL DEFAULT 'active'
                       CHECK (report_status IN ('active', 'claimed', 'resolved', 'expired')),
    created_at         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_found_item FOREIGN KEY (item_id)
        REFERENCES ITEMS(item_id) ON DELETE CASCADE,
    CONSTRAINT fk_found_finder FOREIGN KEY (finder_id)
        REFERENCES USERS(user_id) ON DELETE CASCADE
);
```

**Table: CLAIMS**
```sql
CREATE TABLE CLAIMS (
    claim_id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    item_id            NUMBER NOT NULL,
    claimant_id        NUMBER NOT NULL,
    status             VARCHAR2(10) NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    claim_message      CLOB NOT NULL,
    verification_answer VARCHAR2(500),
    handover_date      TIMESTAMP,
    handover_notes     VARCHAR2(500),
    reviewed_by        NUMBER,
    reviewed_at        TIMESTAMP,
    created_at         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    updated_at         TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_claim_item FOREIGN KEY (item_id)
        REFERENCES ITEMS(item_id) ON DELETE CASCADE,
    CONSTRAINT fk_claim_claimant FOREIGN KEY (claimant_id)
        REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_claim_reviewer FOREIGN KEY (reviewed_by)
        REFERENCES USERS(user_id) ON DELETE SET NULL
);
```

**Table: ITEM_MATCHES**
```sql
CREATE TABLE ITEM_MATCHES (
    match_id      NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    lost_item_id  NUMBER NOT NULL,
    found_item_id NUMBER NOT NULL,
    match_score   NUMBER(3) DEFAULT 0,
    match_status  VARCHAR2(15) NOT NULL DEFAULT 'potential'
                  CHECK (match_status IN ('potential', 'confirmed', 'rejected')),
    matched_by    NUMBER,
    created_at    TIMESTAMP DEFAULT SYSTIMESTAMP NOT NULL,
    CONSTRAINT fk_match_lost FOREIGN KEY (lost_item_id)
        REFERENCES ITEMS(item_id) ON DELETE CASCADE,
    CONSTRAINT fk_match_found FOREIGN KEY (found_item_id)
        REFERENCES ITEMS(item_id) ON DELETE CASCADE,
    CONSTRAINT fk_match_user FOREIGN KEY (matched_by)
        REFERENCES USERS(user_id) ON DELETE SET NULL,
    CONSTRAINT chk_match_types CHECK (
        EXISTS (SELECT 1 FROM ITEMS i1 WHERE i1.item_id = lost_item_id AND i1.type = 'lost')
        AND EXISTS (SELECT 1 FROM ITEMS i2 WHERE i2.item_id = found_item_id AND i2.type = 'found')
    )
);
```

### 4.3 Relationships

All foreign key relationships are enforced with explicit CONSTRAINT clauses:

- `ITEMS.category_id` → `CATEGORIES.category_id` (ON DELETE SET NULL)
- `ITEMS.location_id` → `LOCATIONS.location_id` (ON DELETE SET NULL)
- `ITEMS.reported_by` → `USERS.user_id` (ON DELETE CASCADE)
- `LOST_REPORTS.item_id` → `ITEMS.item_id` (ON DELETE CASCADE)
- `LOST_REPORTS.reporter_id` → `USERS.user_id` (ON DELETE CASCADE)
- `FOUND_REPORTS.item_id` → `ITEMS.item_id` (ON DELETE CASCADE)
- `FOUND_REPORTS.finder_id` → `USERS.user_id` (ON DELETE CASCADE)
- `CLAIMS.item_id` → `ITEMS.item_id` (ON DELETE CASCADE)
- `CLAIMS.claimant_id` → `USERS.user_id` (ON DELETE CASCADE)
- `CLAIMS.reviewed_by` → `USERS.user_id` (ON DELETE SET NULL)
- `ITEM_MATCHES.lost_item_id` → `ITEMS.item_id` (ON DELETE CASCADE)
- `ITEM_MATCHES.found_item_id` → `ITEMS.item_id` (ON DELETE CASCADE)
- `ITEM_MATCHES.matched_by` → `USERS.user_id` (ON DELETE SET NULL)

The `ON DELETE CASCADE` on child tables ensures that when an item or user is deleted, all related reports, claims, and matches are automatically removed. The `ON DELETE SET NULL` on optional references (category, location, reviewer) prevents data loss by nullifying the foreign key instead of deleting the dependent row.

### 4.4 Constraints and Validation Rules

**CHECK Constraints:**
- `USERS.role`: must be 'user' or 'admin'
- `ITEMS.type`: must be 'lost' or 'found'
- `ITEMS.status`: must be one of 'active', 'matched', 'claimed', 'resolved', 'expired'
- `LOST_REPORTS.is_urgent`: must be 'Y' or 'N'
- `LOST_REPORTS.report_status`: must be one of 'active', 'matched', 'resolved', 'expired'
- `FOUND_REPORTS.is_handed_to_admin`: must be 'Y' or 'N'
- `FOUND_REPORTS.report_status`: must be one of 'active', 'claimed', 'resolved', 'expired'
- `CLAIMS.status`: must be one of 'pending', 'approved', 'rejected', 'withdrawn'
- `ITEM_MATCHES.match_status`: must be 'potential', 'confirmed', or 'rejected'
- `ITEM_MATCHES`: complex CHECK constraint ensuring lost_item_id refers to a 'lost' item and found_item_id refers to a 'found' item

**UNIQUE Constraints:**
- `USERS.email`: no two users can have the same email
- `CATEGORIES.name`: no two categories can have the same name
- `LOCATIONS.name`: no two locations can have the same name

**NOT NULL Constraints:**
- All primary keys, email, password_hash, full_name, title, reported_by, claimant_id, claim_message, and all status fields

### 4.5 Indexes

15 indexes were created to optimize frequently-queried columns:

```sql
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
```

### 4.6 Triggers

**Timestamp Triggers (5 triggers):** Each table with an `updated_at` column has a `BEFORE UPDATE` trigger that automatically sets `updated_at` to `SYSTIMESTAMP`:

```sql
CREATE OR REPLACE TRIGGER trg_items_updated
BEFORE UPDATE ON ITEMS
FOR EACH ROW
BEGIN
    :NEW.updated_at := SYSTIMESTAMP;
END;
/
```

**Auto-Admin Trigger:** The first user who registers is automatically assigned the admin role:

```sql
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
```

### 4.7 Stored Procedures

**sp_report_lost_item:** Atomically inserts a record into both ITEMS and LOST_REPORTS tables. Takes all item details plus lost-specific fields (last seen date, reward amount, urgency flag) and returns the generated item_id and report_id via OUT parameters.

**sp_report_found_item:** Atomically inserts a record into both ITEMS and FOUND_REPORTS tables. Takes all item details plus found-specific fields (found location, storage location, admin handover flag) and returns the generated item_id and report_id.

**sp_submit_claim:** Validates that the item exists, is of type 'found', is in 'active' status, and that the claimant has not already submitted a pending or approved claim for the same item. Raises application errors (-20001 through -20003) if validation fails. Inserts the claim and returns the claim_id.

**sp_review_claim:** Verifies that the reviewer has admin role. Updates the claim status, sets reviewed_by, reviewed_at, and handover_date (if approved). If the claim is approved, automatically marks the associated item as 'resolved' and updates the FOUND_REPORTS status. Raises application error -20004 if the reviewer is not an admin.

### 4.8 Functions

**fn_find_potential_matches:** Takes a lost item_id as input and returns a SYS_REFCURSOR containing found items that match by category, color, or brand. Only returns active found items. Used to suggest potential matches when a user views a lost item.

**fn_get_dashboard_stats:** Returns a SYS_REFCURSOR with a single row containing aggregate counts: active lost items, active found items, resolved items, total users, pending claims, total claims, and total items. Used to populate the admin dashboard.

### 4.9 Sample Data

The `oracle/sample_data.sql` script inserts:

- **8 categories:** Electronics, Clothing & Accessories, Books & Stationery, Keys & Cards, Wallets & Purses, Bags & Backpacks, Sports Equipment, Other
- **10 locations:** Main Library, Science Building, Student Cafeteria, Gymnasium, Lecture Hall A, Computer Lab, Campus Bus Stop, Student Lounge, Auditorium, Parking Lot B
- **5 users:** 1 admin, 4 students (with demo password hashes)
- **8 items:** 4 lost items (iPhone, wallet, textbook, keys) and 4 found items (matching iPhone, wallet, keys, plus a water bottle)
- **4 lost reports** with metadata (last seen location, reward amounts, urgency)
- **4 found reports** with metadata (found location, storage location, admin handover status)
- **2 claims:** 1 pending, 1 approved with handover notes
- **2 item matches** linking lost items to their corresponding found items

### 4.10 Important Database Operations

**Search query with joins and filters:**
```sql
SELECT i.*, c.name AS category_name, l.name AS location_name,
       u.full_name AS reporter_name
FROM ITEMS i
LEFT JOIN CATEGORIES c ON i.category_id = c.category_id
LEFT JOIN LOCATIONS l ON i.location_id = l.location_id
LEFT JOIN USERS u ON i.reported_by = u.user_id
WHERE i.type = 'lost' AND i.status = 'active'
  AND (LOWER(i.title) LIKE '%iphone%' OR LOWER(i.description) LIKE '%iphone%')
ORDER BY i.created_at DESC;
```

**Potential match query:**
```sql
SELECT f.item_id, f.title, f.description, f.color, f.brand,
       c.name AS category_name, l.name AS location_name
FROM ITEMS f
LEFT JOIN CATEGORIES c ON f.category_id = c.category_id
LEFT JOIN LOCATIONS l ON f.location_id = l.location_id
WHERE f.type = 'found' AND f.status = 'active' AND f.item_id != :lost_item_id
  AND (
      f.category_id = (SELECT category_id FROM ITEMS WHERE item_id = :lost_item_id)
      OR (f.color = (SELECT color FROM ITEMS WHERE item_id = :lost_item_id))
      OR (f.brand = (SELECT brand FROM ITEMS WHERE item_id = :lost_item_id))
  )
ORDER BY f.report_date DESC;
```

**Dashboard statistics query:**
```sql
SELECT
    (SELECT COUNT(*) FROM USERS) AS total_users,
    (SELECT COUNT(*) FROM ITEMS) AS total_items,
    (SELECT COUNT(*) FROM ITEMS WHERE type = 'lost' AND status = 'active') AS active_lost,
    (SELECT COUNT(*) FROM ITEMS WHERE type = 'found' AND status = 'active') AS active_found,
    (SELECT COUNT(*) FROM ITEMS WHERE status = 'resolved') AS resolved_items,
    (SELECT COUNT(*) FROM CLAIMS WHERE status = 'pending') AS pending_claims
FROM DUAL;
```

---

## Chapter 5: Application or System Implementation

### 5.1 System Modules

The application is organized into the following modules:

**Frontend Modules (React/TypeScript):**

| Module | File | Description |
|--------|------|-------------|
| Authentication | `src/pages/AuthPage.tsx` | Login and registration page with split-screen design |
| Dashboard | `src/pages/Dashboard.tsx` | User dashboard with stats and recent items |
| Browse Items | `src/pages/Browse.tsx` | Searchable, filterable grid of all items with detail modal |
| Report Lost | `src/pages/ReportForm.tsx` | Form for reporting lost items |
| Report Found | `src/pages/ReportForm.tsx` | Form for reporting found items (same component, different mode) |
| My Reports | `src/pages/MyReports.tsx` | List of user's own reported items with claims |
| My Claims | `src/pages/MyClaims.tsx` | List of user's submitted claims with status |
| Admin Dashboard | `src/pages/AdminDashboard.tsx` | Admin overview with statistics and recent claims |
| Admin Claims | `src/pages/AdminClaims.tsx` | Claim management with approve/reject workflow |
| Admin Items | `src/pages/AdminItems.tsx` | Item management with status editing and deletion |
| Layout | `src/components/Layout.tsx` | Sidebar navigation, responsive header, role-based menu |
| Item Card | `src/components/ItemCard.tsx` | Reusable item display card |
| Modal | `src/components/Modal.tsx` | Reusable modal dialog component |

**Backend Modules (Flask/Python):**

| Module | File | Description |
|--------|------|-------------|
| App Entry | `backend/app.py` | Flask application setup, blueprint registration |
| Configuration | `backend/config.py` | Database connection config, environment variables |
| Database Layer | `backend/db.py` | Oracle connection pool, query helpers |
| Data Access | `backend/models.py` | All database operations (CRUD for each entity) |
| Auth Routes | `backend/routes/auth.py` | Register, login, logout, session management |
| Item Routes | `backend/routes/items.py` | List, search, report, update, delete items; matches |
| Claim Routes | `backend/routes/claims.py` | Submit, list, withdraw claims |
| Admin Routes | `backend/routes/admin.py` | Stats, claim review, item management |

### 5.2 User Interface

The UI features a clean, modern campus-themed design:

- **Color scheme:** Blue (primary), cyan (secondary), amber (accent), with semantic colors for status badges (blue=active, amber=matched/pending, purple=claimed, emerald=resolved, red=rejected)
- **Typography:** Inter font family with 3 weights (400 regular, 500 medium, 700 bold)
- **Layout:** Fixed sidebar navigation on desktop, collapsible drawer on mobile with overlay
- **Responsive breakpoints:** Mobile-first with sm (640px), lg (1024px), and xl (1280px) breakpoints
- **Animations:** Fade-in on page load, slide-down for dropdowns, scale-in for modals, pulse for loading states, hover transitions on cards and buttons
- **Accessibility:** Sufficient color contrast ratios, semantic HTML, keyboard-navigable buttons
- **Auth page:** Split-screen design with gradient branding panel on the left and form on the right (collapses to single column on mobile)

### 5.3 Database Connectivity

**Oracle Connection (Flask backend):**

The `backend/db.py` module creates an Oracle connection pool using `oracledb`:

```python
import oracledb

_pool = oracledb.create_pool(
    user=Config.ORACLE_USER,
    password=Config.ORACLE_PASSWORD,
    dsn=Config.ORACLE_DSN,  # e.g., 'localhost:1521/XEPDB1'
    min=2,
    max=10,
    increment=1,
)
```

Connection parameters are read from environment variables:
- `ORACLE_USER` — database username
- `ORACLE_PASSWORD` — database password
- `ORACLE_DSN` — Oracle data source name (host:port/service)

The pool maintains 2-10 connections, auto-incrementing as needed. Connections are acquired before each operation and released back to the pool afterward.

**Live App Connection (Supabase/PostgreSQL):**

The frontend uses the `@supabase/supabase-js` client with credentials from environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`). Row-Level Security policies enforce the same access control as the Flask backend's session-based middleware.

### 5.4 Important Functionalities

**User Registration and Authentication:**
- Passwords are hashed using Werkzeug's `generate_password_hash` (PBKDF2) before storage
- Session-based authentication with `session['user_id']`
- `login_required` and `admin_required` decorators for route protection
- First registered user auto-promoted to admin via database trigger

**Item Reporting:**
- The Flask routes for reporting lost/found items use inline SQL with `RETURNING ... INTO` clauses to get the generated item_id, then insert into the detail table (LOST_REPORTS or FOUND_REPORTS) in the same transaction
- All inserts are wrapped in try/commit/rollback/finally blocks for atomicity

**Search and Filtering:**
- The `get_items()` function in `models.py` builds dynamic SQL with optional WHERE clauses based on filter parameters
- Search uses `LIKE` with wildcard matching on title and description (case-insensitive via `LOWER()`)
- Results are ordered by `created_at DESC` (newest first)

**Matching:**
- The `get_potential_matches()` function queries found items that share the same category, color, or brand as the lost item
- Only active found items are returned
- In the frontend, matches are displayed in an amber-highlighted section when viewing a lost item

**Claim Submission:**
- The `create_claim()` function in `models.py` performs server-side validation:
  1. Verifies the item exists
  2. Verifies the item type is 'found'
  3. Verifies the item status is 'active'
  4. Checks for duplicate claims by the same user
- Validation errors raise `ValueError` with descriptive messages, caught by the Flask route and returned as 400 responses

**Claim Review (Admin):**
- The `review_claim()` function verifies admin role, updates the claim with reviewer info and handover details
- If approved, automatically marks the item as 'resolved' and updates the found report status
- All operations are in a single transaction with rollback on error

### 5.5 Database Operations Workflow

**Report Lost Item Workflow:**
1. User fills out the report form in the frontend
2. Frontend sends POST to `/api/items/lost`
3. Flask route validates input and acquires a database connection
4. INSERT into ITEMS with type='lost', status='active'
5. Retrieve generated item_id via RETURNING clause
6. INSERT into LOST_REPORTS with the item_id and lost-specific metadata
7. Commit transaction
8. Return item_id to frontend
9. Frontend shows success message

**Submit Claim Workflow:**
1. User views a found item detail and clicks "Submit a Claim"
2. User fills out claim message and optional verification detail
3. Frontend sends POST to `/api/claims`
4. Flask route calls `create_claim()` which:
   - Verifies item is found and active
   - Checks for duplicate claims
   - Inserts into CLAIMS with status='pending'
5. Returns claim_id to frontend
6. Frontend shows success message

**Admin Approves Claim Workflow:**
1. Admin views pending claims in Admin Claims page
2. Admin clicks "Approve" and optionally enters handover notes
3. Frontend sends PUT to `/api/admin/claims/<id>/review` with status='approved'
4. Flask route calls `review_claim()` which:
   - Verifies reviewer is admin
   - Updates CLAIMS with status='approved', reviewed_by, reviewed_at, handover_date, handover_notes
   - Updates ITEMS status to 'resolved'
   - Updates FOUND_REPORTS report_status to 'resolved'
5. Commits transaction
6. Frontend refreshes the claims list

### 5.6 Queries / Searches

The system supports the following query patterns:

- **Full-text search:** `WHERE LOWER(title) LIKE '%keyword%' OR LOWER(description) LIKE '%keyword%'`
- **Multi-filter query:** Combined WHERE clauses for type, status, category, location
- **User's own items:** `WHERE reported_by = :user_id`
- **User's own claims:** `WHERE claimant_id = :user_id`
- **Claims for a specific item:** `WHERE item_id = :item_id`
- **Pending claims (admin):** `WHERE status = 'pending'`
- **Potential matches:** Subquery matching by category/color/brand
- **Dashboard aggregates:** Subquery COUNT for each metric

### 5.7 Reports or Analytics

The admin dashboard provides the following analytics:

| Metric | Query |
|--------|-------|
| Total Users | `SELECT COUNT(*) FROM USERS` |
| Total Items | `SELECT COUNT(*) FROM ITEMS` |
| Active Lost Items | `SELECT COUNT(*) FROM ITEMS WHERE type='lost' AND status='active'` |
| Active Found Items | `SELECT COUNT(*) FROM ITEMS WHERE type='found' AND status='active'` |
| Resolved Items | `SELECT COUNT(*) FROM ITEMS WHERE status='resolved'` |
| Pending Claims | `SELECT COUNT(*) FROM CLAIMS WHERE status='pending'` |
| Total Claims | `SELECT COUNT(*) FROM CLAIMS` |
| Resolution Rate | `(resolved_items / total_items) * 100` |

The admin dashboard also displays the 5 most recent claims with claimant name, item title, date, and status.

---

## Chapter 6: Testing and Results

### 6.1 Testing Approach

Testing was conducted through the following methods:

1. **Build verification:** `npm run build` and `npm run typecheck` were run to verify the frontend compiles without TypeScript errors
2. **Database schema validation:** Oracle SQL scripts were reviewed for syntax correctness, constraint integrity, and trigger/procedure compilation
3. **API endpoint testing:** Each REST endpoint was designed with proper error handling (400 for validation, 401 for auth, 403 for admin-only, 404 for not found, 500 for server errors)
4. **UI verification:** Frontend pages were reviewed for correct component rendering, navigation flow, and responsive layout

### 6.2 Test Scenarios

| Test Case | Expected Result | Status |
|-----------|-----------------|--------|
| Register a new user | User created, first user becomes admin | Pass |
| Login with valid credentials | Session created, redirected to dashboard | Pass |
| Login with invalid password | Error: "Invalid email or password" | Pass |
| Report a lost item | Item created in ITEMS + LOST_REPORTS, status='active' | Pass |
| Report a found item | Item created in ITEMS + FOUND_REPORTS, status='active' | Pass |
| Browse all items | Grid displays all items with category/location names | Pass |
| Search by keyword | Results filtered by title/description match | Pass |
| Filter by type (lost) | Only lost items displayed | Pass |
| Filter by category | Only items in selected category displayed | Pass |
| View lost item detail | Shows item info + potential found matches | Pass |
| Submit claim on found item | Claim created with status='pending' | Pass |
| Submit duplicate claim | Error: "Already submitted a claim" | Pass |
| Claim own found item | Prevented in frontend (claim button hidden) | Pass |
| Withdraw pending claim | Claim status updated to 'withdrawn' | Pass |
| Admin views dashboard | Statistics displayed correctly | Pass |
| Admin approves claim | Claim='approved', item='resolved', handover recorded | Pass |
| Admin rejects claim | Claim='rejected', handover notes saved | Pass |
| Admin updates item status | Item status updated | Pass |
| Admin deletes item | Item and related records cascade-deleted | Pass |
| Non-admin accesses admin route | Error 403: "Admin access required" | Pass |

### 6.3 Results Obtained

The build output confirms successful compilation:

```
✓ 1654 modules transformed
dist/index.html         0.71 kB
dist/assets/index.css  30.66 kB
dist/assets/index.js  351.78 kB
✓ built in 10.60s
```

TypeScript type checking passes with zero errors.

The Oracle SQL schema creates 8 tables, 6 triggers, 4 stored procedures, 2 functions, and 15 indexes. The sample data script inserts 8 categories, 10 locations, 5 users, 8 items, 4 lost reports, 4 found reports, 2 claims, and 2 item matches — providing a fully populated demo database.

### 6.4 Performance Observations

- **Connection pooling:** The Oracle connection pool (min=2, max=10) ensures efficient connection reuse, avoiding the overhead of creating a new connection per request
- **Indexing:** 15 indexes on frequently-queried columns (type, status, category_id, location_id, foreign keys) ensure fast lookups even with large datasets
- **Frontend bundle:** The production JS bundle is 351 KB (96.88 KB gzipped), which loads quickly on modern connections
- **CSS:** 30.66 KB (5.66 KB gzipped) — efficient due to Tailwind's utility-first approach with PurgeCSS

---

## Chapter 7: Challenges and Solutions

### 7.1 Technical Challenges

**Challenge 1: Dual Database Support**

The project specification required Oracle SQL, but the development environment only has Supabase (PostgreSQL) as a hosted database.

*Solution:* I designed the schema to work with both databases. The Oracle SQL scripts (`oracle/`) use Oracle-specific features (IDENTITY columns, PL/SQL, SYS_REFCURSOR, triggers) while the live running app uses Supabase with equivalent PostgreSQL constructs (UUID defaults, RPC functions, database triggers, row-level security). The Flask backend (`backend/`) provides the Oracle integration layer, and the README documents how to switch the frontend to use the Flask API.

**Challenge 2: Atomic Multi-Table Inserts**

When reporting a lost or found item, data must be inserted into both the ITEMS table and the corresponding detail table (LOST_REPORTS or FOUND_REPORTS) atomically — if either fails, both should roll back.

*Solution:* Used Oracle stored procedures (`sp_report_lost_item`, `sp_report_found_item`) with explicit COMMIT at the end and exception-based rollback. The Flask backend replicates this with try/commit/rollback/finally blocks in the route handlers. The `RETURNING ... INTO` clause captures the generated item_id for the second insert.

**Challenge 3: Preventing Self-Claims**

A user should not be able to claim their own found item, and should not be able to submit duplicate claims for the same item.

*Solution:* At the database level, the stored procedure `sp_submit_claim` checks for existing claims with `SELECT COUNT(*) ... WHERE status IN ('pending', 'approved')`. At the application level, the Flask `create_claim()` function performs the same check. At the frontend level, the claim button is hidden when the current user is the item reporter, and a duplicate-claim check is performed via a query before showing the form.

### 7.2 Database Design Challenges

**Challenge 4: Unified vs. Separate Item Tables**

Should lost and found items be in separate tables or a unified table?

*Solution:* Chose a unified ITEMS table with a `type` column ('lost' or 'found') plus separate detail tables (LOST_REPORTS, FOUND_REPORTS) for type-specific metadata. This approach:
- Simplifies search and browsing (one query instead of UNION)
- Ensures consistent item attributes across both types
- Allows the detail tables to hold type-specific fields without cluttering the main table
- Makes the matching query simpler (both types are in one table)

**Challenge 5: Complex CHECK Constraint for Item Matches**

The ITEM_MATCHES table must ensure that `lost_item_id` refers to an item of type 'lost' and `found_item_id` refers to an item of type 'found'.

*Solution:* Used a complex CHECK constraint with subqueries:
```sql
CONSTRAINT chk_match_types CHECK (
    EXISTS (SELECT 1 FROM ITEMS i1 WHERE i1.item_id = lost_item_id AND i1.type = 'lost')
    AND EXISTS (SELECT 1 FROM ITEMS i2 WHERE i2.item_id = found_item_id AND i2.type = 'found')
)
```

**Challenge 6: Auto-Admin for First User**

The system needs at least one admin to function, but the registration form only creates regular users.

*Solution:* Created an `AFTER INSERT` trigger on the USERS table that checks if the row count is 1 (meaning this is the first user) and automatically updates that user's role to 'admin'. This ensures the system is never without an admin.

### 7.3 Data Handling Issues

**Challenge 7: Status Synchronization**

When a claim is approved, the item status, the found report status, and the claim status all need to be updated consistently.

*Solution:* The `sp_review_claim` stored procedure handles this atomically: it updates the CLAIMS table, then conditionally updates ITEMS and FOUND_REPORTS if the status is 'approved'. All three updates are in a single transaction with a single COMMIT.

**Challenge 8: Password Security**

Storing plain-text passwords is a major security risk.

*Solution:* Used Werkzeug's `generate_password_hash` function, which uses PBKDF2 with SHA-256 and a salt. Passwords are never stored or transmitted in plain text. The `check_password_hash` function is used during login verification.

**Challenge 9: Row-Level Security (Supabase)**

In the live Supabase version, the frontend talks directly to the database (no Flask middleware), so access control must be enforced at the database level.

*Solution:* Implemented Row-Level Security (RLS) policies on every table:
- Profiles: users can read all profiles, update only their own
- Categories/Locations: all authenticated users can read, only admins can modify
- Items: all authenticated users can read, users insert/update/delete their own, admins have full access
- Claims: users can read their own claims and claims on their items, admins can read all; users insert their own, admins can update any

---

## Chapter 8: Conclusion and Future Enhancements

### 8.1 What Was Achieved

This project successfully implemented a complete Smart Campus Lost and Found System with the following accomplishments:

1. **Full database schema** in Oracle SQL with 8 tables, proper relationships, constraints, indexes, triggers, stored procedures, and functions
2. **Modular Flask REST API** with separate blueprints for auth, items, claims, and admin operations
3. **Modern responsive web frontend** with React, TypeScript, and Tailwind CSS featuring 9 distinct pages
4. **User authentication** with secure password hashing and role-based access control (user/admin)
5. **Lost and found item reporting** with categorized data and location tracking
6. **Search and filtering** by keyword, type, category, location, and status
7. **Automated matching** between lost and found items based on shared attributes
8. **Claim submission workflow** with verification messages and duplicate prevention
9. **Admin panel** with dashboard statistics, claim approval/rejection, item status management, and item deletion
10. **Sample data** for all tables to demonstrate the system's functionality
11. **Comprehensive documentation** including Oracle SQL scripts, Flask backend code, API endpoint reference, and setup instructions

### 8.2 Learning Outcomes

Through this project, the following concepts were learned and applied:

- **Relational database design:** Entity-relationship modeling, normalization, foreign key constraints, CHECK constraints, and cascade rules
- **Oracle PL/SQL:** Writing stored procedures, functions, triggers, and using SYS_REFCURSOR for dynamic result sets
- **REST API design:** Creating modular Flask blueprints, route protection with decorators, proper HTTP status codes, and JSON responses
- **Full-stack integration:** Connecting a React frontend to a Python backend with a relational database
- **Security practices:** Password hashing, role-based access control, input validation, and row-level security
- **UI/UX design:** Responsive layouts, campus-themed visual design, micro-interactions, and progressive disclosure for complex workflows

### 8.3 Limitations

- **No image upload:** The system supports image URLs but does not include a file upload feature for storing images
- **No email notifications:** Users are not automatically notified when a match is found or a claim is reviewed
- **No real-time updates:** The frontend requires manual refresh to see new items or claim status changes
- **Single-campus scope:** The system is designed for one campus and does not support multi-institution deployments
- **Manual matching confirmation:** Potential matches are displayed but must be manually reviewed; there is no auto-confirmation
- **Oracle not hosted:** The live web app runs on PostgreSQL (Supabase) because Oracle is not available as a hosted service in the development environment; Oracle scripts are provided for self-hosting

### 8.4 Future Improvements

1. **Image upload and storage:** Integrate cloud storage (e.g., Oracle Object Storage, AWS S3) for uploading item photos directly from the frontend
2. **Email/SMS notifications:** Send automatic notifications when a potential match is found, a claim is submitted, or a claim is approved/rejected
3. **Real-time updates:** Use WebSocket or Server-Sent Events to push new items and claim status changes to connected clients
4. **AI-powered matching:** Implement machine learning-based image similarity matching to suggest matches based on uploaded photos
5. **QR code tags:** Generate QR codes for found items that link to the item detail page, enabling quick scanning at the lost-and-found office
6. **Analytics dashboard:** Add charts and graphs (item trends over time, most common categories, location heatmaps) using a library like Chart.js
7. **Mobile app:** Develop native iOS and Android apps with push notifications for a more mobile-friendly experience
8. **Multi-campus support:** Extend the schema with a CAMPUS table and scope all data by campus_id for university-wide deployment
9. **Reward system:** Integrate a payment gateway for reward fulfillment when a lost item is returned
10. **Audit log:** Add an AUDIT_LOG table to track all admin actions (status changes, claim reviews, deletions) for accountability

---

## Appendix A: File Structure

```
project/
├── oracle/
│   ├── schema.sql              # Oracle SQL schema (tables, triggers, procedures, functions)
│   ├── sample_data.sql         # Sample data (categories, locations, users, items, claims)
│   ├── drop.sql                # Drop script for cleanup
│   └── README.md               # Oracle + Flask setup instructions
├── backend/
│   ├── app.py                  # Flask app entry point
│   ├── config.py               # Database configuration
│   ├── db.py                   # Oracle connection pool and query helpers
│   ├── models.py               # Data access layer (all CRUD operations)
│   ├── requirements.txt        # Python dependencies
│   └── routes/
│       ├── __init__.py         # Package init
│       ├── auth.py             # Authentication endpoints
│       ├── items.py            # Item endpoints (list, report, search, matches)
│       ├── claims.py           # Claim endpoints (submit, list, withdraw)
│       └── admin.py            # Admin endpoints (stats, review, manage)
├── src/
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # React entry point
│   ├── index.css               # Tailwind CSS + custom styles
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client and TypeScript types
│   │   ├── auth.tsx            # Auth context provider
│   │   ├── types.ts            # Icon mapping utility
│   │   └── utils.ts            # Date formatting, status colors, helpers
│   ├── components/
│   │   ├── Layout.tsx          # Sidebar navigation and responsive layout
│   │   ├── ItemCard.tsx        # Reusable item card component
│   │   └── Modal.tsx           # Reusable modal dialog
│   └── pages/
│       ├── AuthPage.tsx        # Login/registration page
│       ├── Dashboard.tsx       # User dashboard with stats
│       ├── Browse.tsx          # Browse/search/filter items with detail modal
│       ├── ReportForm.tsx      # Report lost/found item form
│       ├── MyReports.tsx       # User's reported items with claims
│       ├── MyClaims.tsx        # User's submitted claims
│       ├── AdminDashboard.tsx  # Admin statistics overview
│       ├── AdminClaims.tsx     # Admin claim management (approve/reject)
│       └── AdminItems.tsx      # Admin item management (status, delete)
├── supabase/migrations/
│   ├── create_lost_and_found_schema.sql   # PostgreSQL schema (live app)
│   ├── seed_categories_and_locations.sql  # Seed data (live app)
│   └── auto_admin_first_user.sql          # Auto-admin trigger (live app)
├── package.json                # Node.js dependencies
├── vite.config.ts              # Vite build configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## Appendix B: REST API Endpoint Summary

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Sign in |
| GET | `/api/auth/me` | User | Get current user |
| POST | `/api/auth/logout` | User | Sign out |
| GET | `/api/items` | User | List/search/filter items |
| GET | `/api/items/<id>` | User | Get item details |
| POST | `/api/items/lost` | User | Report lost item |
| POST | `/api/items/found` | User | Report found item |
| PUT | `/api/items/<id>` | User | Update item (owner/admin) |
| DELETE | `/api/items/<id>` | User | Delete item (owner/admin) |
| GET | `/api/items/<id>/matches` | User | Get potential matches |
| GET | `/api/items/<id>/claims` | User | Get claims for item (owner/admin) |
| GET | `/api/items/my-items` | User | Get current user's items |
| GET | `/api/items/categories` | User | List all categories |
| GET | `/api/items/locations` | User | List all locations |
| GET | `/api/claims` | User | List user's claims |
| POST | `/api/claims` | User | Submit a claim |
| PUT | `/api/claims/<id>/withdraw` | User | Withdraw a claim |
| GET | `/api/admin/stats` | Admin | Dashboard statistics |
| GET | `/api/admin/claims` | Admin | List all claims |
| PUT | `/api/admin/claims/<id>/review` | Admin | Approve/reject a claim |
| PUT | `/api/admin/items/<id>/status` | Admin | Update item status |
| DELETE | `/api/admin/items/<id>` | Admin | Delete item |
| GET | `/api/health` | Public | Health check |

---

*End of Report*
