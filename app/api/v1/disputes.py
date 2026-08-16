from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db, redis_client
from app.services.ai_engine import AIControlEngine

router = APIRouter(prefix="/api/v1/ai", tags=["AI Control & Disputes"])


class DisputeNoticeRequest(BaseModel):
    trace_id: str = Field(..., example="TRC-9988231")
    dealer_id: str = Field(..., example="DLR-DBBL-4402")
    dbbl_amount: float = Field(..., example="500000.00")
    sap_amount: float = Field(..., example="450000.00")
    variance_bdt: float = Field(..., example="50000.00")
    settlement_date: str = Field(..., example="2026-08-15")


class DisputeNoticeResponse(BaseModel):
    success: bool
    trace_id: str
    dispute_notice_letter: str


@router.post(
    "/dispute-notice",
    response_model=DisputeNoticeResponse,
    status_code=status.HTTP_200_OK,
)
async def generate_dispute_notice(
    payload: DisputeNoticeRequest, db: AsyncSession = Depends(get_db)
):
    try:
        notice_text = await AIControlEngine.generate_dispute_notice(
            payload.dict()
        )

        # Redis-এ ডিসপিউট লেটার ক্যাশ করা হচ্ছে (TTL: 7 দিন)
        await redis_client.set(
            f"dispute:{payload.trace_id}", notice_text, ex=604800
        )

        return DisputeNoticeResponse(
            success=True,
            trace_id=payload.trace_id,
            dispute_notice_letter=notice_text,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
