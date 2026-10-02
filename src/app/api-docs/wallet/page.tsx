'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Transaction {
  id: string;
  date: string;
  credits: number;
  amount: string;
  status: 'Completed' | 'Pending';
  invoiceId: string;
}

export default function ApiWalletPage() {
  const [creditsAmount, setCreditsAmount] = useState<number>(250000);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Cost calculation: $0.20 per 1,000 credits = $0.0002 per credit
  const pricePerCredit = 0.0002;
  const totalCost = (creditsAmount * pricePerCredit).toFixed(2);

  // Bonus credits logic (0 by default matching screenshot)
  const bonusCredits = 0;
  const totalCalculatedCredits = creditsAmount + bonusCredits;

  // Fetch initial wallet state from real backend API
  const fetchWalletData = async () => {
    try {
      const res = await fetch('/api/api-wallet').then((r) => r.json());
      if (res.success) {
        setWalletBalance(res.walletBalance || 0);
        setTransactions(res.transactions || []);
      }
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleDecrement = () => {
    setCreditsAmount((prev) => Math.max(250000, prev - 50000));
  };

  const handleIncrement = () => {
    setCreditsAmount((prev) => prev + 50000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(rawVal, 10);
    if (!isNaN(num)) {
      setCreditsAmount(num);
    } else if (rawVal === '') {
      setCreditsAmount(0);
    }
  };

  // Real backend purchase execution
  const handleConfirmPurchase = async () => {
    if (creditsAmount < 250000) {
      alert('Minimum purchase is 250,000 credits.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch('/api/api-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credits: totalCalculatedCredits,
          amount: totalCost,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setWalletBalance(data.walletBalance);
        if (data.transaction) {
          setTransactions((prev) => [data.transaction, ...prev]);
        }
        setFeedbackToast(`Successfully purchased ${totalCalculatedCredits.toLocaleString()} credits for $${totalCost}!`);
        setTimeout(() => setFeedbackToast(null), 3500);
      }
    } catch (e) {
      console.error('Purchase failed:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Create API Key handler via real backend
  const handleCreateKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackToast(`API key "${data.key.name}" created successfully!`);
        setTimeout(() => setFeedbackToast(null), 3000);
        setIsCreateKeyModalOpen(false);
        setNewKeyName('');
      }
    } catch (e) {
      console.error('Failed to create key:', e);
    }
  };

  return (
    <div className="api-wallet-page w-full min-h-screen bg-[#F4F6F9] py-5 px-4 sm:px-6 font-sans text-[#171A1F]">
      <div className="max-w-6xl mx-auto w-full space-y-5">

        {/* ===================== TOP ROW: BREADCRUMB + FEEDBACK + CREDITS ===================== */}
        <div className="flex items-center justify-between py-1 text-xs">
          <Link
            href="/admin.api.html#/"
            className="flex items-center gap-1 text-[#5B6370] hover:text-[#171A1F] transition-colors font-medium"
          >
            <span className="text-sm font-bold">‹</span>
            <span>API Dashboard</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Feedback submitted! Thank you.')}
              className="text-[#2870ED] hover:underline font-semibold text-xs cursor-pointer"
            >
              Feedback
            </button>
            <div className="flex items-center gap-1.5 bg-[#FEF3C7] text-[#92400E] px-3 py-1 rounded-full text-xs font-bold border border-[#FDE68A] shadow-2xs select-none">
              <span>🪙</span>
              <span>Credits 100K / 100K ▾</span>
            </div>
          </div>
        </div>

        {/* Feedback notification toast */}
        {feedbackToast && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-2.5 rounded-[10px] flex items-center justify-between animate-in fade-in">
            <span>✓ {feedbackToast}</span>
            <button onClick={() => setFeedbackToast(null)} className="font-bold">✕</button>
          </div>
        )}

        {/* ===================== TITLE ROW ===================== */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-2xl font-bold text-[#171A1F] tracking-tight">
              Wallet
            </h1>
            <span
              className="text-xs text-gray-400 hover:text-gray-600 cursor-help"
              title="Manage your API credits wallet, top up funds, and track usage."
            >
              ℹ
            </span>
          </div>

          <button
            onClick={() => setIsCreateKeyModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white text-xs font-bold rounded-[6px] shadow-xs transition-colors cursor-pointer uppercase tracking-wider"
          >
            <span>+</span>
            <span>CREATE API KEY</span>
          </button>
        </div>

        {/* ===================== MAIN GRID (2 COLUMNS) ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ===================== LEFT COLUMN (5 COLS) ===================== */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* 1. Wallet balance Card */}
            <div className="bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-[#171A1F]">
                Wallet balance
              </h2>

              {/* Balance Large Figure */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#EBF3FF] text-[#2870ED] flex items-center justify-center font-bold text-sm shrink-0">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 14h-2v-2h2v2zm0-4h-2V7h2v5z"/>
                  </svg>
                </div>
                <span className="text-3xl font-bold text-[#171A1F]">
                  {walletBalance.toLocaleString()}
                </span>
              </div>

              {/* Avg daily consumption */}
              <div className="space-y-0.5 pt-1">
                <div className="text-xs text-[#7A8391]">Avg. daily consumption</div>
                <div className="text-base font-bold text-[#171A1F]">0</div>
              </div>

              {/* Days of runway */}
              <div className="space-y-0.5">
                <div className="text-xs text-[#7A8391]">Days of runway</div>
                <div className="text-base font-bold text-[#171A1F]">—</div>
              </div>

              {/* Set up auto recharge banner */}
              <div className="bg-[#FFF8E6] border border-[#FFE7B3] rounded-[10px] p-3 text-xs text-[#7A5A00] flex items-center gap-2 cursor-pointer hover:bg-[#FFF3D6] transition-colors">
                <span className="font-bold">ℹ</span>
                <span className="font-medium">Set up auto recharge</span>
              </div>
            </div>

            {/* 2. Auto recharge Card */}
            <div className="bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-[#171A1F]">
                Auto recharge
              </h2>
              <div className="bg-[#FFF8E6] border border-[#FFE7B3] rounded-[10px] p-3 text-xs text-[#7A5A00] flex items-center gap-2">
                <span className="font-bold">ℹ</span>
                <span className="font-medium">Coming soon</span>
              </div>
            </div>

            {/* 3. Low balance alert Card */}
            <div className="bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-[#171A1F]">
                Low balance alert
              </h2>
              <div className="bg-[#FFF8E6] border border-[#FFE7B3] rounded-[10px] p-3 text-xs text-[#7A5A00] flex items-center gap-2">
                <span className="font-bold">ℹ</span>
                <span className="font-medium">Coming soon</span>
              </div>
            </div>

          </div>

          {/* ===================== RIGHT COLUMN (7 COLS) ===================== */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* 4. Credits amount & purchase calculator Card */}
            <div className="bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs space-y-4">
              
              {/* Stepper Header Row */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-[#171A1F]">
                    Credits amount
                  </h2>
                  <p className="text-[11px] text-[#7A8391]">
                    Min. purchase 250,000 credits
                  </p>
                </div>

                {/* Number Stepper Control matching screenshot */}
                <div className="flex items-center border border-[#E1E6EB] rounded-[8px] overflow-hidden bg-white shadow-2xs">
                  <input
                    type="text"
                    value={creditsAmount.toLocaleString()}
                    onChange={handleInputChange}
                    className="w-28 text-center text-xs font-bold text-[#171A1F] py-2 px-1 focus:outline-hidden"
                  />
                  <button
                    onClick={handleDecrement}
                    className="px-3 py-2 border-l border-[#E1E6EB] text-gray-500 hover:bg-gray-50 font-bold text-sm cursor-pointer select-none transition-colors"
                    title="Decrease by 50,000"
                  >
                    −
                  </button>
                  <button
                    onClick={handleIncrement}
                    className="px-3 py-2 border-l border-[#E1E6EB] text-gray-500 hover:bg-gray-50 font-bold text-sm cursor-pointer select-none transition-colors"
                    title="Increase by 50,000"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Pricing breakdown lines */}
              <div className="space-y-2 pt-2 text-xs">
                <div className="flex items-center justify-between text-[#5B6370]">
                  <span className="flex items-center gap-1">
                    <span>Bonus credits</span>
                    <span className="text-[10px] text-gray-400 cursor-help">ℹ</span>
                  </span>
                  <span className="font-semibold text-[#171A1F]">0</span>
                </div>

                <div className="flex items-center justify-between text-[#5B6370]">
                  <span>Cost for 1,000 credits</span>
                  <span className="font-semibold text-[#171A1F]">$0.20</span>
                </div>

                <div className="flex items-center justify-between text-[#5B6370]">
                  <span>Total credits</span>
                  <span className="font-semibold text-[#171A1F]">{totalCalculatedCredits.toLocaleString()}</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[#F0F2F5] pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-[#171A1F]">Total cost</span>
                  <span className="text-xl font-bold text-[#171A1F]">${totalCost}</span>
                </div>
              </div>

              {/* Action buttons row */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <svg className="w-3.5 h-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span>Payments are processed securely</span>
                </div>

                <button
                  onClick={handleConfirmPurchase}
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-[#2870ED] hover:bg-[#1C60DB] active:bg-[#1553C4] text-white font-bold text-xs sm:text-sm rounded-[8px] shadow-sm transition-all cursor-pointer"
                >
                  {isProcessing ? 'Processing...' : 'Confirm purchase'}
                </button>
              </div>

            </div>

            {/* 5. Transactions history Card */}
            <div className="bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-[#171A1F]">
                  {transactions.length} transactions
                </h2>
                <span className="text-xs text-gray-400 cursor-help">ℹ</span>
              </div>

              {transactions.length === 0 ? (
                /* Empty state matching screenshot */
                <div className="text-center py-10 space-y-1">
                  <h3 className="text-sm font-bold text-[#171A1F]">No data</h3>
                  <p className="text-xs text-[#7A8391]">
                    We have not found any transactions linked to your account
                  </p>
                </div>
              ) : (
                /* Transaction Rows */
                <div className="space-y-2 pt-1">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-[#F8FAFC] border border-[#E1E6EB] rounded-[10px] flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-[#171A1F]">
                          +{tx.credits.toLocaleString()} API Credits
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {tx.date} • {tx.invoiceId}
                        </div>
                      </div>
                      <div className="text-right space-y-0.5">
                        <div className="font-bold text-[#171A1F]">{tx.amount}</div>
                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ===================== MODAL: CREATE API KEY ===================== */}
      {isCreateKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 relative">
            <button
              onClick={() => setIsCreateKeyModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              ✕
            </button>

            <form onSubmit={handleCreateKeySubmit} className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#171A1F]">Create API Key</h3>
                <p className="text-xs text-[#7A8391]">Enter a descriptive name for your new API key.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Key Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Data Key"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2870ED]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateKeyModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Create Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
