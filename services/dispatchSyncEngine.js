/**
 * File: services/dispatchSyncEngine.js
 * Repository: alaminsohagofficial/-business-erp-engine
 * Target: Multi-Channel Dispatch & Salsabilah Sync Engine
 */

const nodemailer = require('nodemailer');

const dealerPayload = {
  dealerCode: "DEAL002905",
  businessName: "S.R. ELECTRONICS PARK",
  proprietor: "Md. Al Amin Sohag",
  location: "Hat Boaliya Bazar, Alamdanga, Chuadanga",
  mobile: "+8801719732134",
  email: "alaminsohag2024@gmail.com",
  financials: {
    outstandingBalance: 0.00,
    allocatedValue: 30683180.00,
    retainedBuffer: 3117.00,
    clearanceRef: "MHPIL/FIN-SAP/2026/08-018"
  },
  logistics: {
    manifestId: "MHPIL/MANIFEST-SEC-2026/08-9941",
    gatePass: "MHPIL/GATEPASS-TRISHAL-77102",
    fleetCount: 14,
    dispatchDepot: "Trishal Central Warehouse",
    status: "DISPATCHED / EN ROUTE"
  }
};

async function executeEmailNotification() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <h2 style="color: #0f172a;">Minister Myone Group - Account Clearance & Fleet Dispatch</h2>
      <p><strong>Dealer:</strong> ${dealerPayload.businessName} (${dealerPayload.proprietor})</p>
      <p><strong>Dealer Code:</strong> ${dealerPayload.dealerCode}</p>
      <hr/>
      <p><strong>Outstanding Balance:</strong> ${dealerPayload.financials.outstandingBalance} BDT (Cleared)</p>
      <p><strong>Allocated Stock Value:</strong> ${dealerPayload.financials.allocatedValue} BDT</p>
      <p><strong>Retained Reserve Buffer:</strong> (+) ${dealerPayload.financials.retainedBuffer} BDT</p>
      <p><strong>Logistics Fleet:</strong> ${dealerPayload.logistics.fleetCount} Carriers (Manifest: ${dealerPayload.logistics.manifestId})</p>
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Central Operations" <${process.env.SMTP_USER}>`,
      to: dealerPayload.email,
      subject: `Official Clearance & Fleet Dispatch [${dealerPayload.dealerCode}]`,
      html: htmlBody
    });
    console.log(`[EMAIL DISPATCHED] ID: ${info.messageId}`);
  } catch (err) {
    console.error(`[EMAIL ERROR]: ${err.message}`);
  }
}

function executeSmsNotification() {
  const smsText = `[MINISTER-MYONE] Dear ${dealerPayload.proprietor}, Account Audit Complete. Balance: 0.00 BDT. Reserve Buffer: ${dealerPayload.financials.retainedBuffer} BDT. 14-Vehicle Fleet (Manifest: ${dealerPayload.logistics.manifestId}) dispatched to Chuadanga.`;
  console.log(`[SMS DISPATCHED] Recipient: ${dealerPayload.mobile}`);
  console.log(`[PAYLOAD]: ${smsText}`);
}

async function runEngine() {
  console.log("== Starting Business ERP Notification Engine ==");
  executeSmsNotification();
  await executeEmailNotification();
  console.log("== Engine Execution Completed ==");
}

module.exports = { runEngine, dealerPayload };
