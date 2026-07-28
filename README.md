# VatOne ERP & DBBL Smart Reconciliation Engine

![Version](https://img.shields.io/badge/version-2.5.0-blue.svg)
![Build](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Node](https://img.shields.io/badge/node->=%2018.0.0-green.svg)
![AI](https://img.shields.io/badge/Gemini%20AI-Integrated-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

An enterprise-grade financial synchronization and bank-ledger reconciliation gateway. Designed specifically for seamless SAP/ERP ledger alignment, Dutch-Bangla Bank PLC (DBBL) Electronic Fund Transfer (EFT) parsing, and Gemini AI-powered dispute resolution.

---

## 📌 Problem Statement & Core Solution

In corporate distribution operations (e.g., **Minister MyOne Group**, **Butterfly Marketing Limited**), discrepancies frequently occur between real-time DBBL bank settlements and internal SAP/ERP ledger postings. Unposted credits, split-posting delays, or missing SAP Line Item Document (LID) numbers often cause false credit holds, halting warehouse gatepass issuance.

**VatOne ERP Engine** acts as intelligent middleware that:
1. **Parses & Matches:** Validates incoming bank transactions against SAP/ERP posted entries using `Trace ID` and `LID`.
2. **Calculates True Advance Balance:** Accounts for stuck/unposted bank credits to ascertain the dealer's real-time purchasing power.
3. **Automates AI Audit Notices:** Integrates Google Gemini 2.5 Flash to generate instant dispute notices for unresolved accounting blocks.

---

## 🏗️ System Architecture & Workflow

