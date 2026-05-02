from sqlalchemy import text

from db.sessions import engine


def run_hotfixes():
    statements = [
        "ALTER TABLE reminders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE",
        "UPDATE reminders SET created_at = NOW() WHERE created_at IS NULL",
        "ALTER TABLE policies ADD COLUMN IF NOT EXISTS end_date DATE",
        "ALTER TABLE policies ADD COLUMN IF NOT EXISTS policy_number TEXT",
    ]

    with engine.begin() as conn:
        for statement in statements:
            conn.execute(text(statement))

    print("Database hotfix completed")


if __name__ == "__main__":
    run_hotfixes()
