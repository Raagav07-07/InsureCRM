import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from db.sessions import engine
from routes import clients, policies, upload, reminders, analytics
import traceback

app = FastAPI()


def run_migrations():
    statements = [
        "ALTER TABLE reminders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE",
        "UPDATE reminders SET created_at = NOW() WHERE created_at IS NULL",
        "ALTER TABLE policies ADD COLUMN IF NOT EXISTS end_date DATE",
        "ALTER TABLE policies ADD COLUMN IF NOT EXISTS policy_number TEXT",
    ]
    with engine.begin() as conn:
        for statement in statements:
            conn.execute(text(statement))


run_migrations()

frontend_origins = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173,https://insure-crm-gamma.vercel.app",
)

origins = [o.strip() for o in frontend_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def catch_errors(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        traceback.print_exc()
        from fastapi.responses import JSONResponse

        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error", "error": str(exc)},
        )


app.include_router(upload.router)
app.include_router(clients.router)
app.include_router(policies.router)
app.include_router(reminders.router)
app.include_router(analytics.router)
