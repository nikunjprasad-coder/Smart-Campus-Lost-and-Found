"""
Oracle Database connection pool using oracledb.
Provides a shared connection pool for all routes.
"""
import oracledb
from config import Config

_pool = None


def init_pool():
    """Initialize the Oracle connection pool. Call once at startup."""
    global _pool
    if _pool is None:
        _pool = oracledb.create_pool(
            user=Config.ORACLE_USER,
            password=Config.ORACLE_PASSWORD,
            dsn=Config.ORACLE_DSN,
            min=2,
            max=10,
            increment=1,
        )
    return _pool


def get_connection():
    """Get a connection from the pool."""
    if _pool is None:
        init_pool()
    return _pool.acquire()


def release_connection(conn):
    """Release a connection back to the pool."""
    if _pool and conn:
        _pool.release(conn)


def execute_query(sql, params=None, fetch='all'):
    """
    Execute a SELECT query and return results.

    Args:
        sql: SQL query string
        params: dict of bind parameters
        fetch: 'all' for all rows, 'one' for single row, 'none' for no fetch

    Returns:
        List of dicts for fetch='all', single dict for fetch='one', None for fetch='none'
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(sql, params or {})
        columns = [col[0].lower() for col in cursor.description] if cursor.description else []

        if fetch == 'all':
            rows = cursor.fetchall()
            return [dict(zip(columns, row)) for row in rows]
        elif fetch == 'one':
            row = cursor.fetchone()
            return dict(zip(columns, row)) if row else None
        else:
            return None
    finally:
        release_connection(conn)


def execute_dml(sql, params=None):
    """
    Execute an INSERT/UPDATE/DELETE and commit.

    Returns:
        Number of rows affected
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        cursor.execute(sql, params or {})
        conn.commit()
        return cursor.rowcount
    except Exception:
        conn.rollback()
        raise
    finally:
        release_connection(conn)


def execute_insert_returning(sql, params=None, returning_column='item_id'):
    """
    Execute an INSERT with a RETURNING clause and return the generated ID.

    Args:
        sql: SQL with RETURNING clause
        params: bind parameters dict
        returning_column: name of the returning bind variable

    Returns:
        The generated ID value
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        bind_vars = dict(params or {})
        ret_var = cursor.var(int)
        bind_vars[returning_column + '_out'] = ret_var

        # Replace :RETURNING_COLUMN placeholder in SQL with the bind var
        sql_with_returning = sql.replace(f':{returning_column}_out_placeholder', f':{returning_column}_out')
        cursor.execute(sql_with_returning, bind_vars)
        conn.commit()
        return ret_var.getvalue()[0]
    except Exception:
        conn.rollback()
        raise
    finally:
        release_connection(conn)


def call_procedure(proc_name, params=None):
    """
    Call a stored procedure with bind parameters.

    Args:
        proc_name: name of the procedure
        params: dict of bind parameters (IN params as regular values,
                OUT params as oracledb.Var objects with '_out' suffix)

    Returns:
        dict of OUT parameter values
    """
    conn = get_connection()
    try:
        cursor = conn.cursor()
        bind_vars = {}

        for key, value in (params or {}).items():
            if key.endswith('_out'):
                var = cursor.var(value)
                bind_vars[key] = var
            else:
                bind_vars[key] = value

        cursor.callproc(proc_name, keywordParameters=bind_vars)
        conn.commit()

        result = {}
        for key, val in bind_vars.items():
            if key.endswith('_out'):
                result[key] = val.getvalue()

        return result
    except Exception:
        conn.rollback()
        raise
    finally:
        release_connection(conn)
