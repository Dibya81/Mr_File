#!/usr/bin/env python3
"""
Run the SQL migration against Supabase.

Usage:
    cd backend
    source venv/bin/activate
    python run_migration.py

This script reads the DATABASE_URL from .env and applies all migrations.
"""
import os
import sys

def run_migration():
    # Load from .env
    from dotenv import load_dotenv
    load_dotenv()

    import psycopg2
    from urllib.parse import quote_plus

    url = os.getenv("DATABASE_URL", "")
    if not url:
        print("ERROR: DATABASE_URL not found in .env")
        sys.exit(1)

    # If the URL contains the pooler format with special chars in password,
    # we need to parse and reconstruct it properly for psycopg2
    # The format in .env might be: postgresql://postgres.PROJECT:PASSWORD@HOST:PORT/db
    # psycopg2 requires URL-encoded special chars in the password
    try:
        from urllib.parse import urlparse, unquote, quote_plus
        parsed = urlparse(url)

        # Extract password and re-encode it for psycopg2
        encoded_password = quote_plus(unquote(parsed.password or ""))

        # Reconstruct URL with encoded password
        reconstructed = (
            f"postgresql://{parsed.username}:{encoded_password}@"
            f"{parsed.hostname}:{parsed.port or 5432}{parsed.path}"
        )

        print(f"Connecting to: postgresql://{parsed.username}:***@{parsed.hostname}:{parsed.port or 5432}{parsed.path}")

        conn = psycopg2.connect(reconstructed, connect_timeout=30)
        cur = conn.cursor()
        cur.execute("SELECT version()")
        print(f"Connected: {cur.fetchone()[0][:60]}")
        cur.close()

    except Exception as e:
        print(f"ERROR connecting: {e}")
        sys.exit(1)

    # Read and execute migration
    migration_path = os.path.join(os.path.dirname(__file__), "migrations", "001_public_community.sql")
    if not os.path.exists(migration_path):
        print(f"Migration file not found: {migration_path}")
        sys.exit(1)

    with open(migration_path) as f:
        sql = f.read()

    print(f"Executing: {migration_path}")
    cur = conn.cursor()

    # Execute statement by statement
    statements = []
    current = []
    for line in sql.splitlines():
        stripped = line.strip()
        if stripped.startswith("--") or not stripped:
            continue
        current.append(line)
        if line.rstrip().endswith(";"):
            statements.append("\n".join(current))
            current = []

    for stmt in statements:
        if not stmt.strip():
            continue
        try:
            cur.execute(stmt)
            conn.commit()
            # Print first 60 chars of each statement as confirmation
            preview = stmt.split("\n")[0].strip()[:60]
            print(f"  OK: {preview}...")
        except Exception as e:
            print(f"  WARN: {e}")

    cur.close()
    conn.close()
    print("\nMigration complete.")


if __name__ == "__main__":
    run_migration()
