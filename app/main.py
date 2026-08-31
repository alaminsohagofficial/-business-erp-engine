from contextlib import asynccontextmanager
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.balance import router as balance_router
from app.api.v1.disputes import router as dispute_router
from app.api.v1.eft import router as eft_router
from app.api.v1.reconcile import router as reconcile_router
from app.config.settings import settings
from app.database import Base, engine, get_db, redis_client
from app.services.ai_engine import AIControlEngine


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database Tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown logic if needed


app = FastAPI(
    title="Salsabilah Amin Group - Core Business ERP Engine",
    version="1.0.0",
    lifespan=lifespan,
)

# Registering Enterprise Module Routers
app.include_router(eft_router)
app.include_router(reconcile_router)
app.include_router(balance_router)
app.include_router(dispute_router)


@app.get("/")
async def root():
    return {
        "group": "Salsabilah Amin Group",
        "engine": "Business ERP Engine",
        "status": "ONLINE",
        "control_head": "Gemini Active",
    }


class AuditRequest(BaseModel):
    transaction_id: str
    amount: float
    vat_percentage: float
    metadata: dict


@app.post("/api/v1/control/audit")
async def perform_audit(payload: AuditRequest):
    try:
        report = await AIControlEngine.audit_transaction(payload.dict())
        await redis_client.set(
            f"audit:{payload.transaction_id}", report, ex=86400
        )
        return {"success": True, "audit_report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
