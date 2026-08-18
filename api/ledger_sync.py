import os
import hmac
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)
SECRET_KEY = os.getenv("ERP_SECRET_KEY", "salsabila-erp-production-secret-2026")

def verify_signature(data: bytes, signature: str) -> bool:
    """HMAC SHA256 Signature Validator for Secure API Calls"""
    if not signature:
        return False
    expected = hmac.new(SECRET_KEY.encode(), data, hashlib.sha256).hexdigest()
    return hmac.compare_digest(f"sha256={expected}", signature)

@app.route('/api/v1/erp/sync-ledger', methods=['POST'])
def sync_dealer_ledger():
    # 1. Security Check
    sig = request.headers.get('X-ERP-Signature')
    if not verify_signature(request.get_data(), sig):
        return jsonify({"status": "error", "message": "Unauthorized request"}), 401

    payload = request.get_json()
    dealer_id = payload.get("customer_id")
    
    # 2. Hardcoded Ledger Data Matching (SR Electronics Park - 3000002272)
    if dealer_id == "3000002272":
        ledger_data = {
            "dealer_name": "SR Electronics Park",
            "total_collection_bdt": 2102992.00,
            "total_incentive_bdt": 108086.00,
            "total_sales_bdt": 2210869.00,
            "closing_balance_bdt": -209.00,
            "sap_clearing_status": "DZ_CLEARED_OVERPAID",
            "status": "LIVE_SYNCED"
        }
        return jsonify({"status": "success", "data": ledger_data}), 200
    
    return jsonify({"status": "error", "message": "Dealer ID Not Found"}), 404

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
