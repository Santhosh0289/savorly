"""One-time PostgreSQL migration for the OTP, Google, and phone auth upgrade.

Run `python migrate_auth.py` once against the deployment database before using
Google or phone-only accounts. It does not delete users or orders.
"""
from sqlalchemy import text

from app import app
from extensions import db


STATEMENTS = [
    "ALTER TABLE users ALTER COLUMN email DROP NOT NULL",
    "ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_provider VARCHAR(20) DEFAULT 'password'",
    "ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE",
    "CREATE UNIQUE INDEX IF NOT EXISTS uq_users_phone ON users(phone) WHERE phone IS NOT NULL",
]


with app.app_context(), db.engine.begin() as connection:
    if db.engine.dialect.name != "postgresql":
        raise RuntimeError("This migration targets the deployed PostgreSQL database.")
    for statement in STATEMENTS:
        connection.execute(text(statement))
    print("Authentication schema migration completed.")
