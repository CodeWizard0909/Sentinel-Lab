"""Vulnerable app with SQL injection — sample for SentinelLab demo.

WARNING: This code is INTENTIONALLY vulnerable for testing purposes.
Do NOT use this pattern in production code.
"""

import sqlite3


def get_user(username):
    """Get user by username — VULNERABLE to SQL injection."""
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    # VULNERABILITY: User input directly interpolated into SQL query
    query = f"SELECT * FROM users WHERE username = '{username}'"
    cursor.execute(query)
    result = cursor.fetchone()
    conn.close()
    return result


def create_user(username, email):
    """Create a new user — VULNERABLE to SQL injection."""
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    # VULNERABILITY: User input directly interpolated into SQL query
    query = f"INSERT INTO users (username, email) VALUES ('{username}', '{email}')"
    cursor.execute(query)
    conn.commit()
    conn.close()


def init_db():
    """Initialize the database with sample data."""
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    cursor.execute(
        "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, email TEXT)"
    )
    cursor.execute("INSERT OR IGNORE INTO users VALUES (1, 'alice', 'alice@example.com')")
    cursor.execute("INSERT OR IGNORE INTO users VALUES (2, 'bob', 'bob@example.com')")
    conn.commit()
    conn.close()


if __name__ == "__main__":
    init_db()
    print(get_user("alice"))
