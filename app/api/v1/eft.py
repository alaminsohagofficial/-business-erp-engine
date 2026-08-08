import io
import uuid
from datetime import date
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, status, BackgroundTasks
from pydantic import BaseModel, Field
import pandas as pd

router = APIRouter(prefix="/eft", tags=["DBBL EFT Ingestion"])

# ==========================================
# Pydantic Response Schemas
# ==========================================

class FileUploadResponse(BaseModel):
    batch_id: str = Field(..., example="EFT-20260808-88392")
    status: str = Field(..., example="PROCESSING")
    filename: str = Field(..., example="DBBL_EFT_SETTLEMENT_20260808.xlsx")
    total_records_detected: int = Field(..., example=1250)
    total_volume_bdt: float = Field(..., example=45890000.00)
    message: str = Field(..., example="File ingested successfully. Background parsing and normalization initiated.")

class ErrorResponse(BaseModel):
    code: str
    message: str
    timestamp: str

# ==========================================
# Parsing Helper Functions
# ==========================================

def parse_and_validate_dbbl_file(contents: bytes, filename: str) -> tuple[int, float]:
    """
    Parses the DBBL EFT settlement file (.csv or .xlsx) and validates required headers.
    Returns (total_records, total_volume_bdt).
    """
    try:
        if filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        elif filename.endswith((".xlsx", ".xls")):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported file format. Please upload a .csv or .xlsx file."
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read file contents: {str(e)}"
        )

    # Required DBBL Standard Settlement Columns
    required_columns = {"Trace ID", "Dealer ID", "Amount BDT", "Transaction Date"}
    
    # Normalize column names for flexible matching
    df.columns = [col.strip().title() for col in df.columns]
    
    # Check if essential columns exist
    missing_cols = [col for col in ["Trace Id", "Dealer Id", "Amount Bdt"] if col not in df.columns]
    if missing_cols:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid DBBL EFT format. Missing required columns: {missing_cols}"
        )

    total_records = len(df)
    total_volume = float(df["Amount Bdt"].sum())

    return total_records, total_volume


async def trigger_background_reconciliation(batch_id: str):
    """
    Background Task: Ingests normalized records into PostgreSQL
    and executes dual-key trace matching against SAP line items.
    """
    # Logic for database insertion & reconciliation engine run
    print(f"[BACKGROUND JOB] Starting processing for Batch ID: {batch_id}")


# ==========================================
# Endpoint Handler
# ==========================================

@router.post(
    "/upload",
    response_model=FileUploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Upload DBBL EFT Settlement File",
    responses={
        202: {"description": "File accepted and processing queued."},
        400: {"model": ErrorResponse, "description": "Invalid file extension or corrupt file."},
        422: {"model": ErrorResponse, "description": "Missing required DBBL settlement headers."},
    }
)
async def upload_eft_file(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(..., description="DBBL settlement file (.csv or .xlsx)"),
    statement_date: date = Form(..., description="Statement date (YYYY-MM-DD)"),
    bank_branch_code: Optional[str] = Form(None, description="Optional DBBL branch code"),
    auto_reconcile: bool = Form(True, description="Trigger automatic dual-key matching upon completion")
):
    """
    **Ingests and normalizes raw DBBL Electronic Fund Transfer (EFT) files:**
    
    1. Validates file extension and required schema headers (`Trace ID`, `Dealer ID`, `Amount BDT`).
    2. Generates a unique Batch ID (`EFT-YYYYMMDD-XXXX`).
    3. Calculates raw transaction totals and enqueues background reconciliation if `auto_reconcile=True`.
    """
    # Read file stream
    contents = await file.read()
    
    if not contents:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty."
        )

    # Validate file contents and compute totals
    total_records, total_volume = parse_and_validate_dbbl_file(contents, file.filename)

    # Generate unique Batch Reference
    date_str = statement_date.strftime("%Y%m%d")
    short_uuid = str(uuid.uuid4())[:5].upper()
    batch_id = f"EFT-{date_str}-{short_uuid}"

    # Queue background task
    if auto_reconcile:
        background_tasks.add_task(trigger_background_reconciliation, batch_id)

    return FileUploadResponse(
        batch_id=batch_id,
        status="PROCESSING",
        filename=file.filename,
        total_records_detected=total_records,
        total_volume_bdt=round(total_volume, 2),
        message="File ingested successfully. Background parsing and normalization initiated."
    )
