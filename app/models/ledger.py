import enum
from datetime import datetime
from sqlalchemy import Column, DateTime, Enum, Numeric, String
from app.database import Base


class MatchStatus(str, enum.Enum):
    MATCHED = "MATCHED"
    MISMATCHED = "MISMATCHED"
    PENDING = "PENDING"


class DBBLEFTRecord(Base):
    __tablename__ = "dbbl_eft_records"

    id = Column(String, primary_key=True)
    batch_id = Column(String, index=True, nullable=False)
    trace_id = Column(String, index=True, nullable=False)
    dealer_id = Column(String, index=True, nullable=False)
    amount_bdt = Column(Numeric(14, 2), nullable=False)
    status = Column(Enum(MatchStatus), default=MatchStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)


class SAPLedgerEntry(Base):
    __tablename__ = "sap_ledger_entries"

    id = Column(String, primary_key=True)
    dealer_id = Column(String, index=True, nullable=False)
    document_no = Column(String, unique=True, nullable=False)
    trace_id = Column(String, index=True, nullable=False)
    amount_bdt = Column(Numeric(14, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
