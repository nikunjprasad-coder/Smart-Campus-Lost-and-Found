# Smart Campus Lost & Found System — Oracle SQL + Flask Backend

This document explains the Oracle SQL schema, the Flask REST API backend, and how to connect them.

---

## Database: Oracle SQL

### Files

| File | Purpose |
|------|---------|
| `oracle/schema.sql` | Creates all 8 tables, indexes, triggers, stored procedures, and functions |
| `oracle/sample_data.sql` | Inserts sample categories, locations, users, items, reports, claims, and matches |
| `oracle/drop.sql` | Drops everything for a clean reset |

### Tables

| Table | Description |
|-------|-------------|
| `USERS` | Campus user accounts (students/staff/admins) with email, password hash, name, student ID, phone, role |
| `CATEGORIES` | Item categories (Electronics, Clothing, Books, Keys, Wallets, Bags, Sports, Other) |
| `LOCATIONS` | Campus locations with building, floor, and description |
| `ITEMS` | Unified table for both lost and found items with status tracking |
| `LOST_REPORTS` | Detailed metadata for lost items (last seen date/location, reward, urgency) |
| `FOUND_REPORTS` | Detailed metadata for found items (found date/location, storage location, admin handover) |
| `CLAIMS` | Claims submitted by users for found items, with admin review workflow |
| `ITEM_MATCHES` | Potential matches between lost and found items with match scores |

### Relationships

```
USERS (1) ──────── (N) ITEMS (reported_by)
USERS (1) ──────── (N) LOST_REPORTS (reporter_id)
USERS (1) ──────── (N) FOUND_REPORTS (finder_id)
USERS (1) ──────── (N) CLAIMS (claimant_id)
USERS (1) ──────── (N) CLAIMS (reviewed_by)
CATEGORIES (1) ── (N) ITEMS (category_id)
LOCATIONS (1) ─── (N) ITEMS (location_id)
ITEMS (1) ──────── (N) LOST_REPORTS (item_id)
ITEMS (1) ──────── (N) FOUND_REPORTS (item_id)
ITEMS (1) ──────── (N) CLAIMS (item_id)
ITEMS (1) ──────── (N) ITEM_MATCHES (lost_item_id)
ITEMS (1) ──────── (N) ITEM_MATCHES (found_item_id)
```

### Status Flows

**Items:**
- Lost: `active` → `matched` → `resolved`
- Found: `active` → `claimed` → `resolved`
- Either can also be: `expired`

**Claims:** `pending` → `approved` or `rejected` (or `withdrawn` by claimant)

### Stored Procedures

| Procedure | Purpose |
|-----------|---------|
| `sp_report_lost_item` | Inserts a lost item into ITEMS + LOST_REPORTS atomically |
| `sp_report_found_item` | Inserts a found item into ITEMS + FOUND_REPORTS atomically |
| `sp_submit_claim` | Submits a claim with validation (item must be found/active, no duplicate claims) |
| `sp_review_claim` | Admin approves/rejects a claim, auto-marks item as resolved if approved |

### Functions

| Function | Purpose |
|----------|---------|
| `fn_find_potential_matches` | Returns a cursor of found items matching a lost item by category/color/brand |
| `fn_get_dashboard_stats` | Returns aggregate counts for the admin dashboard |

### Triggers

| Trigger | Purpose |
|---------|---------|
| `trg_*_updated` | Auto-set `updated_at` on row updates |
| `trg_auto_admin_first_user` | First registered user automatically becomes admin |

### How to Run

1. Connect to your Oracle Database using SQL*Plus, SQL Developer, or DBeaver:

```bash
sqlplus username/password@host:port/service_name
```

2. Run the schema:
```sql
@oracle/schema.sql
```

3. Load sample data:
```sql
@oracle/sample_data.sql
```

4. To reset:
```sql
@oracle/drop.sql
```

---

## Backend: Flask REST API

### File Structure

```
backend/
├── app.py              # Flask app entry point
├── config.py           # Database configuration
├── db.py               # Oracle connection pool
├── models.py           # Data access layer
├── routes/
│   ├── auth.py         # Authentication endpoints
│   ├── items.py        # Lost/found item endpoints
│   ├── claims.py       # Claim endpoints
│   └── admin.py        # Admin-only endpoints
└── requirements.txt    # Python dependencies
```

### Prerequisites

```bash
pip install flask flask-cors oracledb werkzeug
```

### Oracle Connection Setup

Install the Oracle Instant Client on your machine, then configure the connection in `config.py`:

```python
import os

class Config:
    ORACLE_USER = os.environ.get('ORACLE_USER', 'campus_user')
    ORACLE_PASSWORD = os.environ.get('ORACLE_PASSWORD', 'your_password')
    ORACLE_DSN = os.environ.get('ORACLE_DSN', 'localhost:1521/XEPDB1')
    SECRET_KEY = os.environ.get('SECRET_KEY', 'change-this-in-production')
```

### Running the Flask Server

```bash
cd backend
export ORACLE_USER=campus_user
export ORACLE_PASSWORD=your_password
export ORACLE_DSN=localhost:1521/XEPDB1
python app.py
```

The API runs at `http://localhost:5000`.

### REST API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Sign in | Public |
| GET | `/api/auth/me` | Get current user profile | User |
| GET | `/api/categories` | List all categories | User |
| GET | `/api/locations` | List all locations | User |
| GET | `/api/items` | List/search/filter items | User |
| GET | `/api/items/<id>` | Get item details | User |
| POST | `/api/items/lost` | Report a lost item | User |
| POST | `/api/items/found` | Report a found item | User |
| PUT | `/api/items/<id>` | Update item (owner or admin) | User |
| DELETE | `/api/items/<id>` | Delete item (owner or admin) | User |
| GET | `/api/items/<id>/matches` | Get potential matches for a lost item | User |
| POST | `/api/claims` | Submit a claim for a found item | User |
| GET | `/api/claims` | List claims (user sees own, admin sees all) | User |
| PUT | `/api/claims/<id>/withdraw` | Withdraw own claim | User |
| PUT | `/api/claims/<id>/review` | Approve/reject a claim | Admin |
| GET | `/api/admin/stats` | Dashboard statistics | Admin |
| GET | `/api/admin/items` | Manage all items | Admin |
| PUT | `/api/admin/items/<id>/status` | Update item status | Admin |
```

---

## Frontend Note

The live web app in this project uses **Supabase (PostgreSQL)** as its running database because Oracle is not available as a hosted backend in this environment. The Oracle SQL scripts (`oracle/schema.sql`, `oracle/sample_data.sql`, `oracle/drop.sql`) and Flask backend code (`backend/`) are provided so you can deploy the full system against an Oracle Database in your own environment.

To switch the frontend from Supabase to the Flask/Oracle backend, replace the Supabase client calls in `src/lib/` with `fetch()` calls to the Flask API endpoints listed above.
