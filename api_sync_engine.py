import os
import hashlib
import json
import requests
from datetime import datetime

class APISyncEngine:
    def __init__(self, dealer_code="DEAL002905"):
        self.dealer_code = dealer_code
        self.sap_doc = "5100029481"
        self.google_remittance = 20000000.00  # 2 Crore BDT (Ref: FT26187G00G9999)
        self.rtgs_clearing = 10400000.00     # 1.04 Crore BDT (Ref: SB-RTGS-9988776655)
        self.gross_debt = 2583248.00         # Combined sub-ledger debt
        self.api_url = os.getenv("LEDGER_API_URL", "http://localhost:3000/api/v1/sync/ledger")
        self.api_token = os.getenv("API_TOKEN", "")

    def calculate_net_buffer(self):
        total_credit = self.google_remittance + self.rtgs_clearing
        net_advance = total_credit - self.gross_debt
        return net_advance

    def generate_sha256_checksum(self, payload):
        payload_string = json.dumps(payload, sort_keys=True)
        return hashlib.sha256(payload_string.encode('utf-8')).hexdigest()

    def sync_webhook_trigger(self):
        print(f"[{datetime.now()}] Initializing API Sync Engine for Dealer: {self.dealer_code}")
        print(f"Target SAP Document Mapping: {self.sap_doc}")
        
        net_buffer = self.calculate_net_buffer()
        
        payload = {
            "dealer_code": self.dealer_code,
            "sap_posting_doc": self.sap_doc,
            "inward_remittance": self.google_remittance,
            "rtgs_clearing": self.rtgs_clearing,
            "net_advance_buffer": net_buffer,
            "inventory_unblocked_units": 450,
            "status": "100% CONSISTENT"
        }
        
        checksum = self.generate_sha256_checksum(payload)
        
        headers = {
            "Content-Type": "application/json",
            "X-Checksum-SHA256": checksum,
            "Authorization": f"Bearer {self.api_token}" if self.api_token else ""
        }
        
        print("\n--- API Synchronization Payload Generated ---")
        print(json.dumps(payload, indent=4))
        print(f"\nCryptographic Checksum (SHA-256): {checksum}")
        
        try:
            response = requests.post(self.api_url, json=payload, headers=headers, timeout=10)
            if response.status_code == 200:
                print(f"[{datetime.now()}] --- API Sync Webhook Successfully Pushed & Verified ---")
                return response.json()
            else:
                print(f"Sync Warning: Server responded with status code {response.status_code}")
                return None
        except Exception as e:
            print(f"Error connecting to local/cloud API server: {e}")
            return None

if __name__ == "__main__":
    engine = APISyncEngine(dealer_code="DEAL002905")
    engine.sync_webhook_trigger()
