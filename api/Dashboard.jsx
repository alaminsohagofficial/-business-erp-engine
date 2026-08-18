import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function LiveERPDashboard() {
  const [ledger, setLedger] = useState({
    dealerName: "SR Electronics Park",
    closingBalance: -209.00,
    status: "DZ Cleared"
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>Business ERP & Finance Live Dashboard</h2>
      <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', maxWidth: '400px' }}>
        <h3>{ledger.dealerName} (ID: 3000002272)</h3>
        <p><strong>SAP Status:</strong> <span style={{ color: 'green' }}>{ledger.status}</span></p>
        <p><strong>Current Balance:</strong> 
          <span style={{ color: ledger.closingBalance <= 0 ? 'green' : 'red', marginLeft: '5px' }}>
            {ledger.closingBalance} BDT {ledger.closingBalance < 0 ? '(Advance Deposit)' : '(Due)'}
          </span>
        </p>
      </div>
    </div>
  );
}
