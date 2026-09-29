import React, { useState, useEffect, useCallback } from 'react';

/**
 * AuditResultCard Component
 * Renders the analysis breakdown returned by the reconciliation engine.
 */
const AuditResultCard = ({ result }) => {
  if (!result) return null;

  const isBalanced = result.analysis?.is_balanced;
  const discrepancyBDT = result.analysis?.total_discrepancy_bdt || 0;

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        borderLeft: `4px solid ${isBalanced ? '#16a34a' : '#dc2626'}`,
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}
    >
      <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>
        Gemini AI Reconciliation Result ({result.audit_notice_ref || 'N/A'})
      </h2>
      <p style={{ margin: '4px 0', color: '#334155' }}>
        <strong>Status:</strong>{' '}
        <span style={{ color: isBalanced ? '#16a34a' : '#dc2626', fontWeight: 'bold' }}>
          {isBalanced ? '✅ Balanced' : '⚠️ Discrepancy Found'}
        </span>
      </p>
      <p style={{ margin: '4px 0', color: '#334155' }}>
        <strong>Total Discrepancy:</strong> BDT {discrepancyBDT.toLocaleString()}
      </p>
      <p style={{ margin: '4px 0', color: '#334155' }}>
        <strong>Summary:</strong> {result.analysis?.audit_summary || 'No summary available.'}
      </p>
    </div>
  );
};

/**
 * DisputesTable Component
 * Displays active financial reconciliation records.
 */
const DisputesTable = ({ disputes }) => {
  if (!disputes || disputes.length === 0) {
    return (
      <div style={{ padding: '16px', color: '#64748b', textAlign: 'center' }}>
        No active financial disputes found.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
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
            <tr key={item.dispute_id || item.dbbl_trace_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '10px', color: '#0f172a' }}>{item.dispute_id}</td>
              <td style={{ padding: '10px', color: '#334155' }}>{item.dbbl_trace_id}</td>
              <td style={{ padding: '10px', color: '#334155' }}>{item.dealer_id}</td>
              <td style={{ padding: '10px', fontWeight: '600', color: '#0f172a' }}>
                BDT {(item.amount_bdt || 0).toLocaleString()}
              </td>
              <td style={{ padding: '10px' }}>
                <span
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    backgroundColor: item.status === 'RESOLVED' ? '#dcfce7' : '#fef3c7',
                    color: item.status === 'RESOLVED' ? '#166534' : '#92400e',
                    fontSize: '12px',
                    fontWeight: '600',
                  }}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Main Dashboard Component
 */
const Dashboard = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDisputes, setFetchingDisputes] = useState(false);
  const [auditResult, setAuditResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [dealerId, setDealerId] = useState('DLR-MINISTER-MYONE-01');

  // Fetch disputes using useCallback to prevent unnecessary re-renders
  const fetchDisputes = useCallback(async () => {
    setFetchingDisputes(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/reconciliation/disputes');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      if (data.records) setDisputes(data.records);
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
      setErrorMessage('Failed to load active disputes. Check backend service connectivity.');
    } finally {
      setFetchingDisputes(false);
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleRunAiAudit = async () => {
    setLoading(true);
    setAuditResult(null);
    setErrorMessage(null);

    const payload = {
      dealer_id: dealerId,
      central_ledger: [
        { invoice_no: 'INV-2026-001', amount: 250000, trace_id: 'TRC-101', status: 'POSTED' },
        { invoice_no: 'INV-2026-002', amount: 180000, trace_id: 'TRC-102', status: 'POSTED' },
      ],
      partner_invoices: [
        { invoice_no: 'INV-2026-001', amount: 250000, trace_id: 'TRC-101' },
        { invoice_no: 'INV-2026-002', amount: 200000, trace_id: 'TRC-102' },
      ],
    };

    try {
      const res = await fetch('/reconciliation/disputes/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Audit request failed with status ${res.status}`);

      const data = await res.json();
      setAuditResult(data);
    } catch (err) {
      console.error('AI Audit execution failed:', err);
      setErrorMessage('AI Audit execution failed. Please verify API availability.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Header */}
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 8px 0' }}>
        Salsabilah Amin Group - Central ERP & Audit Dashboard
      </h1>
      <p style={{ color: '#64748b', margin: '0 0 24px 0' }}>
        Automated SAP Reconciliation & AI Dispute Auditor (Minister MyOne & Butterfly Electronics)
      </p>

      {/* Error Banner */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: '#fef2f2',
            color: '#991b1b',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid #fecaca',
            marginBottom: '24px',
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Action Bar */}
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <label style={{ fontWeight: '600', color: '#334155' }}>Target Partner/Dealer ID:</label>
        <input
          type="text"
          value={dealerId}
          onChange={(e) => setDealerId(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #cbd5e1',
            borderRadius: '6px',
            outline: 'none',
            minWidth: '240px',
          }}
        />
        <button
          onClick={handleRunAiAudit}
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: loading ? '#93c5fd' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.2s',
          }}
        >
          {loading ? 'Analyzing with Gemini AI...' : 'Run Automated AI Audit'}
        </button>
      </div>

      {/* AI Audit Result Box */}
      <AuditResultCard result={auditResult} />

      {/* Disputes Table Section */}
      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', margin: 0 }}>
            Active Financial Disputes
          </h2>
          <button
            onClick={fetchDisputes}
            disabled={fetchingDisputes}
            style={{
              padding: '6px 12px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {fetchingDisputes ? 'Refreshing...' : 'Refresh List'}
          </button>
        </div>

        <DisputesTable disputes={disputes} />
      </div>
    </div>
  );
};

export default Dashboard;
