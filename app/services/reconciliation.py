from decimal import Decimal
from typing import Dict, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ledger import DBBLEFTRecord, MatchStatus, SAPLedgerEntry


class DualKeyReconciliationEngine:
    """
    Trace ID + Dealer ID সমন্বয়ে DBBL এবং SAP রেকর্ড সমূহের Dual-Key Matching সম্পন্ন করে।
    """

    @staticmethod
    async def reconcile_batch(
        batch_id: str, db: AsyncSession
    ) -> Dict[str, int]:
        # ১. নির্দিষ্ট ব্যাচের সব EFT রেকর্ড লোড
        eft_stmt = select(DBBLEFTRecord).where(
            DBBLEFTRecord.batch_id == batch_id
        )
        eft_result = await db.execute(eft_stmt)
        eft_records = eft_result.scalars().all()

        matched_count = 0
        mismatched_count = 0

        for record in eft_records:
            # ২. Trace ID এবং Dealer ID দিয়ে SAP লেজারে ম্যাচিং খোজা
            sap_stmt = select(SAPLedgerEntry).where(
                SAPLedgerEntry.trace_id == record.trace_id,
                SAPLedgerEntry.dealer_id == record.dealer_id,
            )
            sap_result = await db.execute(sap_stmt)
            sap_entry = sap_result.scalars().first()

            # ৩. Dual-Key ভ্যালিডেশন চেক
            if sap_entry and Decimal(str(record.amount_bdt)) == Decimal(
                str(sap_entry.amount_bdt)
            ):
                record.status = MatchStatus.MATCHED
                matched_count += 1
            else:
                record.status = MatchStatus.MISMATCHED
                mismatched_count += 1

        await db.commit()

        return {
            "total_processed": len(eft_records),
            "matched": matched_count,
            "mismatched": mismatched_count,
        }
