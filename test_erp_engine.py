import io
import pytest
import pandas as pd
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.fixture
def mock_redis():
    """Mocks Redis client operations for isolated unit testing."""
    with patch("app.database.redis_client", new_callable=AsyncMock) as mock:
        mock.get.return_value = None
        mock.set.return_value = True
        yield mock


@pytest.fixture
def mock_ai_engine():
    """Mocks Gemini 2.5 Flash API calls inside AIControlEngine."""
    with patch("app.services.ai_engine.AIControlEngine.audit_transaction", new_callable=AsyncMock) as mock_audit, \
         patch("app.services.ai_engine.AIControlEngine.generate_dispute_notice", new_callable=AsyncMock) as mock_dispute:
        
        mock_audit.return_value = "AUDIT PASSED: Transaction details compliant with VAT and ERP guidelines."
        mock_dispute.return_value = "REF: DBBL/DISPUTE/2026 - Formal Dispute Notice for Trace ID TRC-9988231."
        yield {"audit": mock_audit, "dispute": mock_dispute}


@pytest.fixture
def mock_db_session():
    """Mocks AsyncSession database dependency."""
    with patch("app.database.get_db") as mock_get_db:
        mock_session = AsyncMock()
        mock_get_db.return_value = mock_session
        yield mock_session


@pytest.mark.asyncio
async def test_root_endpoint():
    """Verifies engine health and system identity root status."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/")
    
    assert response.status_code == 200
    data = response.json()
    assert data["group"] == "Salsabilah Amin Group"
    assert data["engine"] == "Business ERP Engine"
    assert data["status"] == "ONLINE"
    assert data["control_head"] == "Gemini Active"


@pytest.mark.asyncio
async def test_perform_audit(mock_redis, mock_ai_engine):
    """Tests AI compliance audit endpoint with mocked Gemini response."""
    payload = {
        "transaction_id": "TXN-2026-8849",
        "amount": 150000.0,
        "vat_percentage": 15.0,
        "metadata": {"vendor": "Minister High-Tech Electronics"}
    }
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/control/audit", json=payload)
    
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "AUDIT PASSED" in data["audit_report"]


@pytest.mark.asyncio
async def test_eft_upload(mock_redis):
    """Tests DBBL EFT Excel file parsing, batch ID creation, and Redis caching."""
    df = pd.DataFrame([
        {"Trace Id": "TRC-1001", "Dealer Id": "DLR-DBBL-4402", "Amount Bdt": 250000.0},
        {"Trace Id": "TRC-1002", "Dealer Id": "DLR-DBBL-4403", "Amount Bdt": 350000.0}
    ])
    excel_buffer = io.BytesIO()
    df.to_excel(excel_buffer, index=False)
    excel_buffer.seek(0)

    files = {
        "file": ("DBBL_EFT_SETTLEMENT.xlsx", excel_buffer, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    }
    data = {
        "statement_date": "2026-08-31",
        "bank_code": "DBBL"
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/eft/upload", data=data, files=files)

    assert response.status_code == 202
    res = response.json()
    assert res["status"] == "PROCESSING"
    assert res["total_records"] == 2
    assert res["total_amount_bdt"] == 600000.0
    assert res["batch_id"].startswith("EFT-20260831-")


@pytest.mark.asyncio
async def test_dual_key_reconciliation(mock_db_session):
    """Tests batch reconciliation execution endpoint."""
    with patch("app.services.reconciliation.DualKeyReconciliationEngine.reconcile_batch", new_callable=AsyncMock) as mock_rec:
        mock_rec.return_value = {
            "total_processed": 10,
            "matched": 8,
            "mismatched": 2
        }
        
        payload = {"batch_id": "EFT-20260831-A1B2C"}
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/reconcile/dual-key", json=payload)
            
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["matched_count"] == 8
        assert data["mismatched_count"] == 2


@pytest.mark.asyncio
async def test_get_dealer_balance(mock_db_session):
    """Tests True Advance Balance calculation query."""
    with patch("app.services.balance_calculator.BalanceCalculatorEngine.get_true_advance_balance", new_callable=AsyncMock) as mock_bal:
        mock_bal.return_value = {
            "dealer_id": "DLR-DBBL-4402",
            "sap_ledger_balance": 100000.0,
            "pending_eft_bdt": 50000.0,
            "pending_delivery_orders_bdt": 30000.0,
            "true_advance_balance": 120000.0
        }
        
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/balance/DLR-DBBL-4402")
            
        assert response.status_code == 200
        data = response.json()
        assert data["dealer_id"] == "DLR-DBBL-4402"
        assert data["true_advance_balance"] == 120000.0


@pytest.mark.asyncio
async def test_generate_dispute_notice(mock_redis, mock_ai_engine):
    """Tests AI dispute letter generation for DBBL Dual-Key mismatches."""
    payload = {
        "trace_id": "TRC-9988231",
        "dealer_id": "DLR-DBBL-4402",
        "dbbl_amount": 500000.00,
        "sap_amount": 450000.00,
        "variance_bdt": 50000.00,
        "settlement_date": "2026-08-15"
    }

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/ai/dispute-notice", json=payload)

    assert response.status_code == 200
    res = response.json()
    assert res["success"] is True
    assert res["trace_id"] == "TRC-9988231"
    assert "REF: DBBL/DISPUTE" in res["dispute_notice_letter"]
