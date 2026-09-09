# Salsabilah Amin Group - Central ERP & Control Engine

## 🌐 Overview
Central Business ERP, Inventory Controller, and Automated VAT Management Engine for **Salsabilah Amin Group**, powered by Gemini AI Architecture.

## 🏢 Business Operations & Integrations
- **Core Subsidiaries:** salsabilah.com & salsabilahelectronics.com
- **Strategic Partners:** Minister Hi-Tech Park (Minister Myone Group) & Butterfly Marketing Ltd.
- **Modules:** ERP Management, SAP Data Sync, Ledger Audit, VAT & Margin Automated Engine.

## 🚀 Deployment Status
- **Platform:** Netlify Production
- **Live URL:** https://salsabilah-erp.netlify.app
- **Status:** Active & Online
-business-erp-engine/
├── .github/
│   └── workflows/
│       └── salsabilah-automation.yml   # ব্যাকগ্রাউন্ড শিডিউল ও ক্রন জব
├── payloads/
│   └── transactions_payload.json       # ব্যাংকিং ও SAP ট্রানজেকশন ডেটা
├── worker.py                           # Gemini API ও ব্যাংক API অডিটিং স্ক্রিপ্ট
├── sync_engine.py                      # রিয়েল-টাইম লেজার সিঙ্ক্রোনাইজেশন ইঞ্জিন
├── sap.html                            # SAP লেজার ভেরিফিকেশন প্যানেল (Frontend)
├── index.html                          # সেন্ট্রাল ট্রিজারি ড্যাশবোর্ড
├── requirements.txt                    # পাইথন ডিপেন্ডেন্সি (requests, google-genai ইত্যাদি)
└── README.md                           # প্রোজেক্ট ডকুমেন্টেশন
