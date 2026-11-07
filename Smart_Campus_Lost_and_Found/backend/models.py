"""
Data access layer for Oracle SQL operations.
Provides functions for users, items, claims, categories, and locations.
"""
from db import execute_query, execute_dml
import oracledb


# ============================================================
# USERS
# ============================================================

def get_user_by_email(email):
    return execute_query(
        "SELECT * FROM USERS WHERE email = :email",
        {'email': email},
        fetch='one'
    )


def get_user_by_id(user_id):
    return execute_query(
        "SELECT user_id, email, full_name, student_id, phone, role, created_at FROM USERS WHERE user_id = :user_id",
        {'user_id': user_id},
        fetch='one'
    )


def create_user(email, password_hash, full_name, student_id, phone):
    conn = None
    try:
        from db import get_connection, release_connection
        conn = get_connection()
        cursor = conn.cursor()

        # Call the stored procedure
        p_user_id = cursor.var(int)

        cursor.execute(
            """INSERT INTO USERS (email, password_hash, full_name, student_id, phone, role)
               VALUES (:email, :password_hash, :full_name, :student_id, :phone, 'user')
               RETURNING user_id INTO :user_id_out""",
            {
                'email': email,
                'password_hash': password_hash,
                'full_name': full_name,
                'student_id': student_id,
                'phone': phone,
                'user_id_out': p_user_id,
            }
        )
        conn.commit()
        return p_user_id.getvalue()[0]
    except Exception:
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            from db import release_connection
            release_connection(conn)


# ============================================================
# CATEGORIES & LOCATIONS
# ============================================================

def get_all_categories():
    return execute_query(
        "SELECT * FROM CATEGORIES ORDER BY sort_order",
        fetch='all'
    )


def get_all_locations():
    return execute_query(
        "SELECT * FROM LOCATIONS ORDER BY sort_order",
        fetch='all'
    )


# ============================================================
# ITEMS
# ============================================================

def get_items(filters=None):
    """Get items with optional filters: type, status, category_id, location_id, search."""
    sql = """
        SELECT i.*, c.name AS category_name, l.name AS location_name,
               u.full_name AS reporter_name
        FROM ITEMS i
        LEFT JOIN CATEGORIES c ON i.category_id = c.category_id
        LEFT JOIN LOCATIONS l ON i.location_id = l.location_id
        LEFT JOIN USERS u ON i.reported_by = u.user_id
        WHERE 1=1
    """
    params = {}

    if filters:
        if filters.get('type'):
            sql += " AND i.type = :type"
            params['type'] = filters['type']
        if filters.get('status'):
            sql += " AND i.status = :status"
            params['status'] = filters['status']
        if filters.get('category_id'):
            sql += " AND i.category_id = :category_id"
            params['category_id'] = filters['category_id']
        if filters.get('location_id'):
            sql += " AND i.location_id = :location_id"
            params['location_id'] = filters['location_id']
        if filters.get('search'):
            sql += " AND (LOWER(i.title) LIKE :search OR LOWER(i.description) LIKE :search2)"
            search_term = f"%{filters['search'].lower()}%"
            params['search'] = search_term
            params['search2'] = search_term

    sql += " ORDER BY i.created_at DESC"
    return execute_query(sql, params, fetch='all')


def get_item_by_id(item_id):
    sql = """
        SELECT i.*, c.name AS category_name, l.name AS location_name,
               u.full_name AS reporter_name, u.email AS reporter_email
        FROM ITEMS i
        LEFT JOIN CATEGORIES c ON i.category_id = c.category_id
        LEFT JOIN LOCATIONS l ON i.location_id = l.location_id
        LEFT JOIN USERS u ON i.reported_by = u.user_id
        WHERE i.item_id = :item_id
    """
    return execute_query(sql, {'item_id': item_id}, fetch='one')


def get_potential_matches(lost_item_id):
    """Find found items matching a lost item by category, color, or brand."""
    sql = """
        SELECT f.item_id, f.title, f.description, f.color, f.brand,
               c.name AS category_name, l.name AS location_name,
               f.incident_date, f.report_date, f.status
        FROM ITEMS f
        LEFT JOIN CATEGORIES c ON f.category_id = c.category_id
        LEFT JOIN LOCATIONS l ON f.location_id = l.location_id
        WHERE f.type = 'found' AND f.status = 'active' AND f.item_id != :lost_item_id
          AND (
              f.category_id = (SELECT category_id FROM ITEMS WHERE item_id = :lost_item_id2)
              OR (f.color IS NOT NULL AND LOWER(f.color) = LOWER((SELECT color FROM ITEMS WHERE item_id = :lost_item_id3)))
              OR (f.brand IS NOT NULL AND LOWER(f.brand) = LOWER((SELECT brand FROM ITEMS WHERE item_id = :lost_item_id4)))
          )
        ORDER BY f.report_date DESC
    """
    return execute_query(sql, {
        'lost_item_id': lost_item_id,
        'lost_item_id2': lost_item_id,
        'lost_item_id3': lost_item_id,
        'lost_item_id4': lost_item_id,
    }, fetch='all')


def update_item_status(item_id, status):
    return execute_dml(
        "UPDATE ITEMS SET status = :status WHERE item_id = :item_id",
        {'status': status, 'item_id': item_id}
    )


def delete_item(item_id):
    return execute_dml(
        "DELETE FROM ITEMS WHERE item_id = :item_id",
        {'item_id': item_id}
    )


def get_items_by_user(user_id):
    sql = """
        SELECT i.*, c.name AS category_name, l.name AS location_name
        FROM ITEMS i
        LEFT JOIN CATEGORIES c ON i.category_id = c.category_id
        LEFT JOIN LOCATIONS l ON i.location_id = l.location_id
        WHERE i.reported_by = :user_id
        ORDER BY i.created_at DESC
    """
    return execute_query(sql, {'user_id': user_id}, fetch='all')


# ============================================================
# CLAIMS
# ============================================================

def get_claims_by_user(user_id):
    sql = """
        SELECT cl.*, i.title AS item_title, i.type AS item_type,
               u.full_name AS reviewer_name
        FROM CLAIMS cl
        JOIN ITEMS i ON cl.item_id = i.item_id
        LEFT JOIN USERS u ON cl.reviewed_by = u.user_id
        WHERE cl.claimant_id = :user_id
        ORDER BY cl.created_at DESC
    """
    return execute_query(sql, {'user_id': user_id}, fetch='all')


def get_all_claims(status_filter=None):
    sql = """
        SELECT cl.*, i.title AS item_title, i.type AS item_type,
               cu.full_name AS claimant_name, cu.student_id AS claimant_student_id,
               ru.full_name AS reviewer_name
        FROM CLAIMS cl
        JOIN ITEMS i ON cl.item_id = i.item_id
        JOIN USERS cu ON cl.claimant_id = cu.user_id
        LEFT JOIN USERS ru ON cl.reviewed_by = ru.user_id
    """
    params = {}
    if status_filter and status_filter != 'all':
        sql += " WHERE cl.status = :status"
        params['status'] = status_filter
    sql += " ORDER BY cl.created_at DESC"
    return execute_query(sql, params, fetch='all')


def get_claims_for_item(item_id):
    sql = """
        SELECT cl.*, u.full_name AS claimant_name, u.student_id AS claimant_student_id
        FROM CLAIMS cl
        JOIN USERS u ON cl.claimant_id = u.user_id
        WHERE cl.item_id = :item_id
        ORDER BY cl.created_at DESC
    """
    return execute_query(sql, {'item_id': item_id}, fetch='all')


def create_claim(item_id, claimant_id, message, verification_answer):
    conn = None
    try:
        from db import get_connection, release_connection
        conn = get_connection()
        cursor = conn.cursor()

        # Verify item is found and active
        cursor.execute(
            "SELECT type, status FROM ITEMS WHERE item_id = :item_id",
            {'item_id': item_id}
        )
        row = cursor.fetchone()
        if not row:
            raise ValueError("Item not found")
        if row[0] != 'found':
            raise ValueError("Claims can only be submitted for found items")
        if row[1] != 'active':
            raise ValueError("This item is no longer available for claims")

        # Check for existing claim
        cursor.execute(
            "SELECT COUNT(*) FROM CLAIMS WHERE item_id = :item_id AND claimant_id = :claimant_id AND status IN ('pending', 'approved')",
            {'item_id': item_id, 'claimant_id': claimant_id}
        )
        if cursor.fetchone()[0] > 0:
            raise ValueError("You have already submitted a claim for this item")

        p_claim_id = cursor.var(int)
        cursor.execute(
            """INSERT INTO CLAIMS (item_id, claimant_id, status, claim_message, verification_answer)
               VALUES (:item_id, :claimant_id, 'pending', :message, :verification)
               RETURNING claim_id INTO :claim_id_out""",
            {
                'item_id': item_id,
                'claimant_id': claimant_id,
                'message': message,
                'verification': verification_answer,
                'claim_id_out': p_claim_id,
            }
        )
        conn.commit()
        return p_claim_id.getvalue()[0]
    except Exception:
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            from db import release_connection
            release_connection(conn)


def review_claim(claim_id, admin_id, new_status, handover_notes=None):
    conn = None
    try:
        from db import get_connection, release_connection
        conn = get_connection()
        cursor = conn.cursor()

        # Verify admin role
        cursor.execute("SELECT role FROM USERS WHERE user_id = :user_id", {'user_id': admin_id})
        row = cursor.fetchone()
        if not row or row[0] != 'admin':
            raise PermissionError("Only administrators can review claims")

        # Get item_id
        cursor.execute("SELECT item_id FROM CLAIMS WHERE claim_id = :claim_id", {'claim_id': claim_id})
        row = cursor.fetchone()
        if not row:
            raise ValueError("Claim not found")
        item_id = row[0]

        # Update claim
        handover_date_sql = "SYSTIMESTAMP" if new_status == 'approved' else "NULL"
        cursor.execute(
            f"""UPDATE CLAIMS
                SET status = :status,
                    reviewed_by = :admin_id,
                    reviewed_at = SYSTIMESTAMP,
                    handover_notes = :notes,
                    handover_date = {handover_date_sql}
                WHERE claim_id = :claim_id""",
            {
                'status': new_status,
                'admin_id': admin_id,
                'notes': handover_notes,
                'claim_id': claim_id,
            }
        )

        # If approved, mark item as resolved
        if new_status == 'approved':
            cursor.execute("UPDATE ITEMS SET status = 'resolved' WHERE item_id = :item_id", {'item_id': item_id})
            cursor.execute("UPDATE FOUND_REPORTS SET report_status = 'resolved' WHERE item_id = :item_id", {'item_id': item_id})

        conn.commit()
    except Exception:
        if conn:
            conn.rollback()
        raise
    finally:
        if conn:
            from db import release_connection
            release_connection(conn)


def withdraw_claim(claim_id, user_id):
    return execute_dml(
        "UPDATE CLAIMS SET status = 'withdrawn' WHERE claim_id = :claim_id AND claimant_id = :user_id",
        {'claim_id': claim_id, 'user_id': user_id}
    )


# ============================================================
# ADMIN STATS
# ============================================================

def get_dashboard_stats():
    return execute_query(
        """
        SELECT
            (SELECT COUNT(*) FROM USERS) AS total_users,
            (SELECT COUNT(*) FROM ITEMS) AS total_items,
            (SELECT COUNT(*) FROM ITEMS WHERE type = 'lost' AND status = 'active') AS active_lost,
            (SELECT COUNT(*) FROM ITEMS WHERE type = 'found' AND status = 'active') AS active_found,
            (SELECT COUNT(*) FROM ITEMS WHERE status = 'resolved') AS resolved_items,
            (SELECT COUNT(*) FROM CLAIMS) AS total_claims,
            (SELECT COUNT(*) FROM CLAIMS WHERE status = 'pending') AS pending_claims
        FROM DUAL
        """,
        fetch='one'
    )
