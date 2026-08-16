from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db

router = APIRouter(prefix="/api/v1/balance", tags=["Dealer Credit & Balance"])


class BalanceResponse(BaseModel):
    dealer_id: str = Field(..., example="DLR-DBBL-4402")
    ledger_balance: float = Field(..., example=1000000.00)
    unsettled_eft_bdt: float = Field(..., example=500000.00)
    pending_do_bdt: float = Field(..., example=300000.00)
    true_advance_balance: float = Field(..., example=1200000.00)


@router.get(
    "/{dealer_id}",
    response_model=BalanceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get True Advance Balance for Dealer"
)
async def get_dealer_balance(
    dealer_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Calculates and returns the real-time True Advance Balance:
    (Ledger Balance + Unsettled EFTs - Pending DOs)
    """
    # ডাটাবেজ থেকে ডেটা ফেচ করার লজিক
    ledger_balance = 1000000.00
    unsettled_eft = 500000.00
    pending_do = 300000.00

    true_advance = ledger_balance + unsettled_eft - pending_do

    return BalanceResponse(
        dealer_id=dealer_id,
        ledger_balance=ledger_balance,
        unsettled_eft_bdt=unsettled_eft,
        pending_do_bdt=pending_do,
        true_advance_balance=round(true_advance, 2)
    )
