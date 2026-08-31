from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.services.balance_calculator import BalanceCalculatorEngine

router = APIRouter(prefix="/api/v1/balance", tags=["True Advance Balance"])


class BalanceResponse(BaseModel):
    dealer_id: str = Field(..., example="DLR-DBBL-4402")
    sap_ledger_balance: float = Field(..., example=100000.00)
    pending_eft_bdt: float = Field(..., example=50000.00)
    pending_delivery_orders_bdt: float = Field(..., example=30000.00)
    true_advance_balance: float = Field(..., example=120000.00)


@router.get(
    "/{dealer_id}",
    response_model=BalanceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Dealer Real-time True Advance Balance",
)
async def get_dealer_balance(
    dealer_id: str, db: AsyncSession = Depends(get_db)
):
    try:
        balance_data = await BalanceCalculatorEngine.get_true_advance_balance(
            dealer_id, db
        )
        return BalanceResponse(**balance_data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
