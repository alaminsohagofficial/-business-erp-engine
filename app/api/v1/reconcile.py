from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.services.reconciliation import DualKeyReconciliationEngine

router = APIRouter(prefix="/api/v1/reconcile", tags=["Dual-Key Reconciliation"])


class ReconcileRequest(BaseModel):
    batch_id: str


class ReconcileResponse(BaseModel):
    success: bool
    batch_id: str
    total_processed: int
    matched_count: int
    mismatched_count: int


@router.post(
    "/dual-key",
    response_model=ReconcileResponse,
    status_code=status.HTTP_200_OK,
)
async def trigger_dual_key_reconciliation(
    payload: ReconcileRequest, db: AsyncSession = Depends(get_db)
):
    try:
        results = await DualKeyReconciliationEngine.reconcile_batch(
            payload.batch_id, db
        )

        return ReconcileResponse(
            success=True,
            batch_id=payload.batch_id,
            total_processed=results["total_processed"],
            matched_count=results["matched"],
            mismatched_count=results["mismatched"],
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
