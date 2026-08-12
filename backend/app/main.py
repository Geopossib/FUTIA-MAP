from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import analyze, health

app = FastAPI(
    title="GDX Earth Intelligence API",
    description=(
        "Backend for the Nigeria Flood & Land-Change Monitoring System. "
        "Currently returns mock indicators — see app/mock_analysis.py — "
        "pending Copernicus Data Space Ecosystem API integration."
    ),
    version="0.1.0",
)

allowed_origins = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(analyze.router)
