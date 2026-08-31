from decimal import Decimal
from typing import Dict
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ledger import DBBLEFTRecord, MatchStatus, SAPLedgerEntry


class BalanceCalculatorEngine:
    """
    ডিলারের True Advance Balance গণনা করে:
    True Advance Balance = (SAP Ledger Balance + Pending DBBL EFTs) - Pending Delivery Orders
    """

    @staticmethod
    async def get_true_advance_balance(
        dealer_id: str, db: AsyncSession
    ) -> Dict[str, float]:
        # 1. SAP Ledger Total Balance
        sap_stmt = select(func.coalesce(func.sum(SAPLedgerEntry.amount_bdt), 0)).where(
            SAPLedgerEntry.dealer_id == dealer_id
        )
        sap_res = await db.execute(sap_stmt)
        sap_ledger_balance = Decimal(str(sap_res.scalar()))

        # 2. Unsettled / Pending DBBL EFT Funds
        eft_stmt = select(func.coalesce(func.sum(DBBLEFTRecord.amount_bdt), 0)).where(
            DBBLEFTRecord.dealer_id == dealer_id,
            DBBLEFTRecord.status == MatchStatus.PENDING,
        )
        eft_res = await db.execute(eft_stmt)
        pending_eft_bdt = Decimal(str(eft_res.scalar()))

        # 3. Dummy Pending Delivery Orders (বা আপনার DO টেবিল থেকে কোয়েরি)
        pending_do_bdt = Decimal("0.00")

        # True Advance Balance Calculation
        true_advance_balance = (
            sap_ledger_balance + pending_eft_bdt - pending_do_bdt
        )

        return {
            "dealer_id": dealer_id,
            "sap_ledger_balance": float(sap_ledger_balance),
            "pending_eft_bdt": float(pending_eft_bdt),
            "pending_delivery_orders_bdt": float(pending_do_bdt),
            "true_advance_balance": float(true_advance_balance),
        }
