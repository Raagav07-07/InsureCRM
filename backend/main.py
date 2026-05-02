import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import clients, policies, upload, reminders, analytics

app = FastAPI()

frontend_origins = os.getenv(
    "FRONTEND_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173",
)

origins = [origin.strip() for origin in frontend_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(clients.router)
app.include_router(policies.router)
app.include_router(reminders.router)
app.include_router(analytics.router)
