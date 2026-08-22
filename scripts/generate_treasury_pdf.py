# scripts/generate_treasury_pdf.py
from weasyprint import HTML

# ==========================================
# এখানে আপনি যেকোনো সময় মানগুলো পরিবর্তন (Update) করতে পারবেন
# ==========================================
dealer_code = "3000002272"
submission_date = "23 August 2026"
beneficiary = "Butterfly Marketing Ltd"
ledger_status = "-19,000,209.00 BDT (Updated Butterfly Ledger Advance)"

# ট্রানজ্যাকশন শিডিউল ডেটা
transactions = [
    {"sl": 1, "bank": "The City Bank PLC", "ref": "CBL-RTGS-TRX-01", "amount": "50,00,000.00", "status": "Sealed"},
    {"sl": 2, "bank": "The City Bank PLC", "ref": "CBL-RTGS-TRX-02", "amount": "50,00,000.00", "status": "Sealed"},
    {"sl": 3, "bank": "The City Bank PLC", "ref": "CBL-RTGS-TRX-03", "amount": "72,00,000.00", "status": "Sealed"},
    {"sl": 4, "bank": "Sonali Bank PLC", "ref": "SBL-RTGS-TRX-04", "amount": "66,00,000.00", "status": "Sealed"},
    {"sl": 5, "bank": "Sonali Bank PLC", "ref": "SBL-RTGS-TRX-05", "amount": "66,00,000.00", "status": "Sealed"}
]

total_amount = "3,04,00,000.00"

# টেবিল রো ডাইনামিকালি জেনারেট করার লজিক
rows_html = ""
for tx in transactions:
    rows_html += f"""
      <tr>
        <td>{tx['sl']}</td>
        <td>{tx['bank']}</td>
        <td>{tx['ref']}</td>
        <td class="text-right">{tx['amount']}</td>
        <td class="text-center">{tx['status']}</td>
      </tr>
    """

# HTML টেমপ্লেট
html_content = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Treasury Submission Checklist</title>
  <style>
    @page {{ size: A4 portrait; margin: 15mm; background-color: #faf8f5; }}
    *, *::before, *::after {{ box-sizing: border-box; }}
    body {{ font-family: Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 0; font-size: 11pt; line-height: 1.4; background-color: #faf8f5; }}
    .header {{ border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 15px; }}
    .title {{ font-size: 16pt; font-weight: bold; color: #0f172a; }}
    .subtitle {{ font-size: 10pt; color: #475569; }}
    .meta-table {{ width: 100%; border-collapse: collapse; margin-bottom: 15px; background: #ffffff; }}
    .meta-table td {{ padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 10.5pt; }}
    .section-title {{ font-size: 11pt; font-weight: bold; color: #0f172a; margin-top: 15px; margin-bottom: 8px; border-left: 4px solid #0f172a; padding-left: 6px; }}
    table.data {{ width: 100%; border-collapse: collapse; margin-bottom: 15px; background: #ffffff; }}
    table.data th {{ background: #0f172a; color: #ffffff; padding: 8px 10px; text-align: left; font-size: 10pt; border: 1px solid #0f172a; }}
    table.data td {{ padding: 8px 10px; border: 1px solid #cbd5e1; font-size: 10pt; }}
    .text-right {{ text-align: right; }}
    .text-center {{ text-align: center; }}
    .total-row {{ background: #f1f5f9; font-weight: bold; }}
    .checklist-item {{ margin-bottom: 6px; font-size: 10.5pt; }}
    .box {{ width: 12px; height: 12px; border: 1px solid #0f172a; display: inline-block; margin-right: 8px; vertical-align: middle; background: #ffffff; }}
    .sig-table {{ width: 100%; margin-top: 45px; border-collapse: collapse; }}
    .sig-table td {{ width: 50%; vertical-align: top; text-align: center; padding-top: 30px; font-size: 10pt; }}
  </style>
</head>
<body>
  <div class="header">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="border: none; padding: 0;">
          <div class="title">SR ELECTRONICS PARK</div>
          <div class="subtitle">Hatboalia Bazar, Chuadanga | MD. AL AMIN SOHAG</div>
        </td>
        <td style="text-align: right; vertical-align: bottom; border: none; padding: 0;">
          <strong style="font-size: 12pt; color: #0f172a;">TREASURY SUBMISSION ADVICE</strong>
        </td>
      </tr>
    </table>
  </div>

  <table class="meta-table">
    <tr>
      <td><strong>Dealer Code:</strong> {dealer_code}</td>
      <td><strong>Submission Date:</strong> {submission_date}</td>
    </tr>
    <tr>
      <td><strong>Beneficiary:</strong> {beneficiary}</td>
      <td><strong>Ledger Status:</strong> {ledger_status}</td>
    </tr>
  </table>

  <div class="section-title">ENCLOSED RTGS SCHEDULE (BDT {total_amount})</div>
  <table class="data">
    <thead>
      <tr>
        <th style="width: 8%;">#</th>
        <th style="width: 32%;">Originating Bank</th>
        <th style="width: 30%;">Reference / Voucher</th>
        <th class="text-right" style="width: 18%;">Amount (BDT)</th>
        <th class="text-center" style="width: 12%;">Status</th>
      </tr>
    </thead>
    <tbody>
      {rows_html}
      <tr class="total-row">
        <td colspan="3">TOTAL CENTRAL ALLOCATION</td>
        <td class="text-right">{total_amount}</td>
        <td class="text-center">Cleared</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">DOCUMENT CHECKLIST</div>
  <div class="checklist-item"><span class="box"></span> 5x Bank Stamped & Signed RTGS Advice Vouchers</div>
  <div class="checklist-item"><span class="box"></span> DBBL Payment Confirmation Summary (BDT 10,29,000.00)</div>
  <div class="checklist-item"><span class="box"></span> Official Butterfly SAP Ledger Statement ({ledger_status})</div>

  <table class="sig-table">
    <tr>
      <td>
        _____________________________________<br>
        <strong>MD. AL AMIN SOHAG</strong><br>
        Managing Director, SR Electronics Park
      </td>
      <td>
        _____________________________________<br>
        <strong>Authorized Officer & Seal</strong><br>
        Butterfly Marketing Limited
      </td>
    </tr>
  </table>
</body>
</html>
"""

# পিডিএফ ফাইল রেন্ডার ও সেভ করার এক্সিকিউশন
if __name__ == "__main__":
    output_filename = "Treasury_Submission_Checklist.pdf"
    HTML(string=html_content).write_pdf(output_filename)
    print(f"✅ PDF updated and generated successfully: {output_filename}")
