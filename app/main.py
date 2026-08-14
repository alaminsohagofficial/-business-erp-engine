from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db, redis_client, engine, Base
from app.services.ai_engine import AIControlEngine
from app.config.settings import settings
from pydantic import BaseModel

app = FastAPI(
    title="Salsabilah Amin Group - Core Business ERP Engine",
    version="1.0.0"
)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {
        "group": "Salsabilah Amin Group",
        "engine": "Business ERP Engine",
        "status": "ONLINE",
        "control_head": "Gemini Active"
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
        await redis_client.set(f"audit:{payload.transaction_id}", report, ex=86400)
        return {"success": True, "audit_report": report}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
