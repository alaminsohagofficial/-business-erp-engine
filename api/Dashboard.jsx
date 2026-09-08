import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function LiveERPDashboard() {
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLedgerData() {
      try {
        const querySnapshot = await getDocs(collection(db, "ledgers"));
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Fallback or dynamic assignment if Firestore is empty initially
        if (data.length > 0) {
          setLedgers(data);
        } else {
          setLedgers([
            { id: '1', dealerName: "SR Electronics Park", dealerCode: "3000002272", closingBalance: -209.00, status: "DZ Cleared" },
            { id: '2', dealerName: "Butterfly Marketing Ltd.", dealerCode: "3000002272", closingBalance: -15000.00, status: "Settled" },
            { id: '3', dealerName: "Minister Hi-Tech Park", dealerCode: "DEAL002905", closingBalance: 0.00, status: "Reconciled" }
          ]);
        }
      } catch (err) {
        console.error("Error fetching Firestore data:", err);
        setError("Failed to sync live ERP data.");
      } finally {
        setLoading(false);
      }
    }

    fetchLedgerData();
  }, []);

  if (loading) return <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif' }}>Syncing Enterprise ERP Live Data...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red', fontFamily: 'Inter, sans-serif' }}>{error}</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Inter, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h2 style={{ color: '#1e3a8a', marginBottom: '20px' }}>Business ERP & Finance Live Dashboard</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {ledgers.map((item) => (
          <div key={item.id} style={{ border: '1px solid #cbd5e1', padding: '20px', borderRadius: '12px', backgroundColor: '#ffffff', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a' }}>{item.dealerName}</h3>
            <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px' }}>Dealer Code: <strong>{item.dealerCode || '3000002272'}</strong></p>
            <p style={{ margin: '6px 0' }}><strong>SAP Status:</strong> <span style={{ color: '#16a34a', fontWeight: '600' }}>{item.status}</span></p>
            <p style={{ margin: '6px 0' }}><strong>Current Balance:</strong> 
              <span style={{ color: item.closingBalance <= 0 ? '#16a34a' : '#dc2626', marginLeft: '6px', fontWeight: '600' }}>
                {item.closingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })} BDT {item.closingBalance < 0 ? '(Advance Deposit)' : '(Due)'}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
