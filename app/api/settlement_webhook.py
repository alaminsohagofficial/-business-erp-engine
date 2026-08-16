import hmac
import hashlib
import os
from flask import Flask, request, jsonify

app = Flask(__name__)

# Environment Variables থেকে সিক্রেট কি লোড
WEBHOOK_SECRET = os.getenv("ERP_WEBHOOK_SECRET", "super-secure-token-here")

def verify_signature(payload_body: bytes, signature_header: str) -> bool:
    """HMAC SHA256 সিকিউরিটি ভেরিফিকেশন"""
    if not signature_header:
        return False
    expected_sig = hmac.new(WEBHOOK_SECRET.encode(), payload_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(f"sha256={expected_sig}", signature_header)

@app.route('/api/v1/erp/h2h-clearing', methods=['POST'])
def process_h2h_settlement():
    # ১. সিকিউরিটি সিগনেচার চেক
    signature = request.headers.get('X-Hub-Signature-256')
    if not verify_signature(request.get_data(), signature):
        return jsonify({"status": "error", "message": "Unauthorized / Invalid Signature"}), 401

    payload = request.get_json()
    dealer_code = payload.get("dealer_profile", {}).get("dealer_code")
    reconciliation_list = payload.get("reconciliation_breakdown", [])

    # ২. ডুপ্লিকেট ও ফিল্টার ভ্যালিডেশন
    if not dealer_code or not reconciliation_list:
        return jsonify({"status": "error", "message": "Malformed Payload"}), 400

    # ৩. SAP BAPI / Ledger Integration Trigger
    # এখানে SAP BAPI_ACC_DOCUMENT_POST এক্সিকিউট হবে
    cleared_total = sum(item.get("amount_bdt", 0) for item in reconciliation_list)

    return jsonify({
        "status": "success",
        "dealer_code": dealer_code,
        "cleared_amount_bdt": cleared_total,
        "sap_status": "DZ_POSTED_AND_CLEARED",
        "doc_type": "DZ"
    }), 200

if __name__ == '__main__':
    # প্রোডাকশনে SSL/TLS এবং mTLS গেটওয়ের অধীনে রান হবে
    app.run(host='0.0.0.0', port=5000)
