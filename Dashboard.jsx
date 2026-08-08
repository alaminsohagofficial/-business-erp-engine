import React, { useState, useEffect } from 'react';

export default function ERPDashboard() {
    const [dealerId, setDealerId] = useState('DEAL002905');
    const [dealer, setDealer] = useState(null);
    const [ledger, setLedger] = useState([]);
    const [form, setForm] = useState({
        amount: '',
        utrRef: '',
        bankAccount: '20503910100020103',
        routingNo: '125260433',
        paymentChannel: 'RTGS'
    });

    const fetchLedger = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/v1/ledger/${dealerId}`);
            const data = await res.json();
            if (data.success) {
                setDealer(data.dealer);
                setLedger(data.ledger);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        }
    };

    useEffect(() => {
        fetchLedger();
    }, [dealerId]);

    const handleSettlePayment = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/v1/payments/settle', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dealerId, ...form })
            });
            const data = await res.json();
            if (data.success) {
                alert("Payment Settled Successfully!");
                fetchLedger();
            }
        } catch (err) {
            alert("Payment Settlement Failed");
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 p-6 font-sans">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-700 pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-sky-400">Business ERP Engine</h1>
                    <p className="text-sm text-slate-400">Real-Time Treasury & Dealer Ledger System</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-right">
                    <span className="text-xs text-slate-400 block">Current Balance</span>
                    <span className="text-xl font-extrabold text-emerald-400">
                        BDT {dealer ? parseFloat(dealer.current_balance).toLocaleString() : '0.00'}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Payment Entry Form */}
                <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
                    <h2 className="text-lg font-semibold mb-4 text-sky-300">New RTGS / Bank Payment Entry</h2>
                    <form onSubmit={handleSettlePayment} className="space-y-4">
                        <div>
                            <label className="text-xs text-slate-400">Dealer ID</label>
                            <input 
                                type="text" 
                                value={dealerId} 
                                onChange={(e) => setDealerId(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-sm text-white focus:border-sky-500 outline-none" 
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400">Amount (BDT)</label>
                            <input 
                                type="number" 
                                placeholder="1000000.00" 
                                onChange={(e) => setForm({...form, amount: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-sm text-white focus:border-sky-500 outline-none" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400">Bank UTR / Ref Number</label>
                            <input 
                                type="text" 
                                placeholder="e.g. UTR12345678" 
                                onChange={(e) => setForm({...form, utrRef: e.target.value})}
                                className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded text-sm text-white focus:border-sky-500 outline-none" 
                                required 
                            />
                        </div>
                        <button type="submit" className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded transition">
                            Process Real-Time Payment
                        </button>
                    </form>
                </div>

                {/* Dealer Ledger Table */}
                <div className="lg:col-span-2 bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-lg">
                    <h2 className="text-lg font-semibold mb-4 text-sky-300">Real-time Dealer Ledger</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-slate-700 text-slate-400 bg-slate-900/50">
                                    <th className="p-3">Date</th>
                                    <th className="p-3">Description</th>
                                    <th className="p-3 text-right">Debit</th>
                                    <th className="p-3 text-right">Credit</th>
                                    <th className="p-3 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {ledger.map((row) => (
                                    <tr key={row.ledger_id} className="hover:bg-slate-700/30">
                                        <td className="p-3 text-xs text-slate-400">{new Date(row.posted_at).toLocaleDateString()}</td>
                                        <td className="p-3 font-medium text-slate-200">{row.description}</td>
                                        <td className="p-3 text-right text-rose-400">{row.debit > 0 ? `৳${parseFloat(row.debit).toLocaleString()}` : '-'}</td>
                                        <td className="p-3 text-right text-emerald-400">{row.credit > 0 ? `৳${parseFloat(row.credit).toLocaleString()}` : '-'}</td>
                                        <td className="p-3 text-right font-bold text-sky-300">৳{parseFloat(row.balance).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
