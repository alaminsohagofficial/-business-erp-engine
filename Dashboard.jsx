import React, { useState, useEffect } from 'react';

const Dashboard = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [dealerId, setDealerId] = useState('DLR-MINISTER-MYONE-01');

  // Fetch disputes on load
  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      const res = await fetch('/reconciliation/disputes');
      const data = await res.json();
      if (data.records) setDisputes(data.records);
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
    }
  };

  const handleRunAiAudit = async () => {
    setLoading(true);
    setAuditResult(null);

    const payload = {
      dealer_id: dealerId,
      central_ledger: [
        { invoice_no: 'INV-2026-001', amount: 250000, trace_id: 'TRC-101', status: 'POSTED' },
        { invoice_no: 'INV-2026-002', amount: 180000, trace_id: 'TRC-102', status: 'POSTED' }
      ],
      partner_invoices: [
        { invoice_no: 'INV-2026-001', amount: 250000, trace_id: 'TRC-101' },
        { invoice_no: 'INV-2026-002', amount: 200000, trace_id: 'TRC-102' }
      ]
    };

    try {
      const res = await fetch('/reconciliation/disputes/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setAuditResult(data);
    } catch (err) {
      console.error('AI Audit execution failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>
        Salsabilah Amin Group - Central ERP & Audit Dashboard
      </h1>
      <p style={{ color: '#64748b', marginBottom: '24px' }}>
        Automated SAP Reconciliation & AI Dispute Auditor (Minister MyOne & Butterfly Electronics)
      </p>

      {/* Action Bar */}
      <div style={{ backgroundColor: '#fff', padding: '16px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
        <label style={{ fontWeight: '600', marginRight: '12px' }}>Target Partner/Dealer ID:</label>
        <input 
          type="text" 
          value={dealerId} 
          onChange={(e) => setDealerId(e.target.value)} 
          style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', marginRight: '12px' }}
        />
        <button 
          onClick={handleRunAiAudit} 
          disabled={loading}
          style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
        >
          {loading ? 'Analyzing with Gemini AI...' : 'Run Automated AI Audit'}
        </button>
      </div>

      {/* AI Audit Result Box */}
      {auditResult && (
        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', borderLeft: '4px solid #2563eb', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
            Gemini AI Reconciliation Result ({auditResult.audit_notice_ref})
          </h2>
          <p><strong>Status:</strong> {auditResult.analysis?.is_balanced ? '✅ Balanced' : '⚠️ Discrepancy Found'}</p>
          <p><strong>Total Discrepancy:</strong> BDT {auditResult.analysis?.total_discrepancy_bdt?.toLocaleString()}</p>
          <p><strong>Summary:</strong> {auditResult.analysis?.audit_summary}</p>
        </div>
      )}

      {/* Disputes Table */}
      <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Active Financial Disputes</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
              <th style={{ padding: '10px' }}>Dispute ID</th>
              <th style={{ padding: '10px' }}>Trace ID</th>
              <th style={{ padding: '10px' }}>Dealer ID</th>
              <th style={{ padding: '10px' }}>Amount (BDT)</th>
              <th style={{ padding: '10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map((item) => (
              <tr key={item.dispute_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '10px' }}>{item.dispute_id}</td>
                <td style={{ padding: '10px' }}>{item.dbbl_trace_id}</td>
                <td style={{ padding: '10px' }}>{item.dealer_id}</td>
                <td style={{ padding: '10px' }}>BDT {item.amount_bdt?.toLocaleString()}</td>
                <td style={{ padding: '10px' }}>
                  <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#92400e', fontSize: '12px', fontWeight: '600' }}>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
