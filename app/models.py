from sqlalchemy import Column, String, Numeric, Integer, DateTime, func, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    cost_price = Column(Numeric(12, 2), nullable=False)
    selling_price = Column(Numeric(12, 2), nullable=False)
    stock_quantity = Column(Integer, default=0)

class TransactionLog(Base):
    __tablename__ = "transaction_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    tx_type = Column(String(50), nullable=False)  # INVOICE, VAT_ENTRY, STOCK_ADJUSTMENT
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(20), default="COMPLETED")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
