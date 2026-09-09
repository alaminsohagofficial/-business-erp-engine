# Salsabilah Enterprise ERP & Treasury Engine

A dual-stack enterprise-grade ERP and treasury management backend designed for automated SAP ECC 6.0 ledger synchronization, AI-powered transaction auditing, and real-time financial tracking.

---

## 🚀 System Architecture & Tech Stack

* **Frontend:** Centralized Treasury Dashboard & SAP Ledger Audit Panel (`index.html`, `sap.html` built with Tailwind CSS v4)
* **Backend API (Node.js):** Express.js server with MongoDB (Mongoose), featuring cryptographic SHA-256 payload verification and real-time treasury endpoints.
* **Sync & Automation Engine (Python):** Python-based worker & API sync controller (`worker.py`, `api_sync_engine.py`) integrating with Google GenAI for automated audit insights.
* **Infrastructure & CI/CD:** GitHub Actions (`salsabilah-automation.yml`) for cron jobs and Render Blueprint (`render.yaml`) for production deployment.

---

## 🏢 Tracked Enterprise Entities

1. **Minister Hi-Tech Park Electronics Ltd.**
   * **Dealer Code:** `DEAL002905`
   * **Primary Ledger Focus:** Real-time net advance buffer and zero-debt sub-ledger reconciliation.
2. **Butterfly Marketing Limited**
   * **Dealer Code:** `3000002272`
   * **Primary Ledger Focus:** Verified credit release and banking channel tracking.

---

## 🛠️ Project Structure

```text
-business-erp-engine/
├── .github/
│   └── workflows/
│       └── salsabilah-automation.yml  # Background automation & cron jobs
├── models/
│   └── ledger.js                      # Mongoose Ledger schema
├── payloads/
│   └── transactions_payload.json      # Sample batch transaction data
├── api_sync_engine.py                 # Python SAP-to-Node sync controller
├── database.py                        # SQLAlchemy & Redis async configuration
├── worker.py                          # AI Audit & transaction processing worker
├── server.js                          # Node.js Express webhook & API server
├── index.html                         # Central Treasury Dashboard
├── sap.html                           # SAP ECC 6.0 Ledger Verification Panel
├── requirements.txt                   # Python dependencies
├── package.json                       # Node.js dependencies
└── render.yaml                        # Render cloud deployment blueprint
