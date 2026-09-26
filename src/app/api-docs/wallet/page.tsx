'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Plus,
  Minus,
  Coins,
  ChevronDown,
  Info,
  HelpCircle,
  Lock,
  Check,
  X,
  CreditCard,
  CheckCircle2,
  Calendar,
  Download,
} from 'lucide-react';

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
  const [isCreditsDropdownOpen, setIsCreditsDropdownOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState<'checkout' | 'success'>('checkout');

  // Rate: $0.20 per 1,000 credits = $0.0002 per credit
  const pricePerCredit = 0.0002;
  const totalCost = (creditsAmount * pricePerCredit).toFixed(2);

  // Bonus credits threshold: +5% for 1M+, +10% for 2.5M+
  const bonusCredits =
    creditsAmount >= 2500000
      ? Math.floor(creditsAmount * 0.1)
      : creditsAmount >= 1000000
      ? Math.floor(creditsAmount * 0.05)
      : 0;

  const totalCalculatedCredits = creditsAmount + bonusCredits;

  const handleDecrement = () => {
    setCreditsAmount((prev) => Math.max(250000, prev - 50000));
  };

  const handleIncrement = () => {
    setCreditsAmount((prev) => prev + 50000);
  };

  const handleConfirmPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    setPurchaseStep('success');
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: 'Sep 26, 2026',
      credits: totalCalculatedCredits,
      amount: `$${totalCost}`,
      status: 'Completed',
      invoiceId: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setWalletBalance((prev) => prev + totalCalculatedCredits);
    setTransactions([newTx, ...transactions]);

    setTimeout(() => {
      setIsPurchaseModalOpen(false);
      setPurchaseStep('checkout');
    }, 2000);
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackText('');
      setIsFeedbackOpen(false);
    }, 1800);
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800 flex flex-col justify-between font-sans">
      <div>
        {/* Sub-header Bar (Matching Screenshot 4 exact) */}
        <div className="bg-white border-b border-gray-200 px-6 py-3.5">
          <div className="flex items-center justify-between">
            {/* Breadcrumb & Title */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                <span className="text-gray-400">›</span>
                <Link
                  href="/api-docs"
                  className="text-gray-700 font-medium hover:text-[#0B69FF] transition-colors"
                >
                  API Dashboard
                </Link>
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900 flex items-center gap-1.5">
                  Wallet
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer hover:text-gray-600" />
                </h1>
              </div>
            </div>

            {/* Right side: Feedback, Credits gold pill, + CREATE API KEY */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsFeedbackOpen(true)}
                className="text-xs text-gray-600 hover:text-blue-600 font-medium cursor-pointer transition-colors"
              >
                Feedback
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsCreditsDropdownOpen(!isCreditsDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-[#92400E] border border-[#FDE68A] rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                >
                  <Coins className="w-3.5 h-3.5 text-[#B45309]" />
                  <span>Credits: 100K / 100K</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#B45309]" />
                </button>

                {isCreditsDropdownOpen && (
                  <div className="absolute right-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-xl p-3 z-50 text-xs">
                    <div className="font-bold text-gray-900 mb-1">Data API Balance</div>
                    <div className="flex justify-between py-1 border-b border-gray-100 text-gray-600">
                      <span>Trial Credits:</span>
                      <span className="font-semibold text-emerald-600">100,000</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100 text-gray-600">
                      <span>Wallet Balance:</span>
                      <span className="font-semibold text-gray-800">
                        {walletBalance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-1 text-gray-600">
                      <span>Expiry:</span>
                      <span className="font-semibold text-gray-800">Oct 07, 2026</span>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsCreateKeyModalOpen(true)}
                className="flex items-center gap-1 px-3.5 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-md text-xs font-bold shadow-2xs transition-colors cursor-pointer tracking-wider"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>CREATE API KEY</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area (2 Columns matching Screenshot 4) */}
        <div className="p-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Wallet balance, Autorecharge, Low balance alert (approx 4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              {/* Card 1: Wallet balance */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Wallet balance</h3>

                <div className="flex items-center gap-3">
                  {/* Double circle / link icon matching screenshot */}
                  <div className="flex items-center -space-x-1 text-[#0B69FF]">
                    <div className="w-5 h-5 rounded-full border-2 border-[#0B69FF]" />
                    <div className="w-5 h-5 rounded-full border-2 border-[#0B69FF]" />
                  </div>
                  <div className="text-3xl font-extrabold text-gray-900">
                    {walletBalance.toLocaleString()}
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-gray-500 font-medium">Avg. daily consumption</div>
                  <div className="text-gray-900 font-bold">0</div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="text-gray-500 font-medium">Days of runway</div>
                  <div className="text-gray-900 font-bold">—</div>
                </div>

                {/* Set up auto recharge Alert Pill */}
                <div className="bg-[#FFF4E5] border border-[#FFE7C4] text-[#B76E00] text-xs font-medium px-3.5 py-2.5 rounded-lg flex items-center gap-2 cursor-pointer hover:bg-[#FFEBD0] transition-colors">
                  <Info className="w-4 h-4 shrink-0 text-[#B76E00]" />
                  <span>Set up auto recharge</span>
                </div>
              </div>

              {/* Card 2: Autorecharge */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-gray-900">Autorecharge</h3>
                <div className="bg-[#FFF4E5] border border-[#FFE7C4] text-[#B76E00] text-xs font-medium px-3.5 py-2.5 rounded-lg flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0 text-[#B76E00]" />
                  <span>Coming soon</span>
                </div>
              </div>

              {/* Card 3: Low balance alert */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-gray-900">Low balance alert</h3>
                <div className="bg-[#FFF4E5] border border-[#FFE7C4] text-[#B76E00] text-xs font-medium px-3.5 py-2.5 rounded-lg flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0 text-[#B76E00]" />
                  <span>Coming soon</span>
                </div>
              </div>
            </div>

            {/* Right Column: Credits amount & 0 transactions (approx 8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Card 1: Credits amount purchase box */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">Credits amount</h3>
                  <span className="text-xs text-gray-500">
                    Min. purchase 250,000 credits
                  </span>
                </div>

                {/* Stepper Input Row matching Screenshot 4 */}
                <div className="flex items-center justify-between border border-gray-300 rounded-lg p-1.5 bg-white">
                  <button
                    onClick={handleDecrement}
                    disabled={creditsAmount <= 250000}
                    className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <div className="text-sm font-bold text-gray-900 font-mono">
                    {creditsAmount.toLocaleString()}
                  </div>

                  <button
                    onClick={handleIncrement}
                    className="w-8 h-8 rounded flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Details Breakdown List */}
                <div className="space-y-2 text-xs pt-1">
                  <div className="flex items-center justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      Bonus credits
                      <Info className="w-3 h-3 text-gray-400" />
                    </span>
                    <span className="font-semibold text-gray-900 font-mono">
                      {bonusCredits.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Cost for 1,000 credits</span>
                    <span className="font-semibold text-gray-900 font-mono">$0.20</span>
                  </div>

                  <div className="flex items-center justify-between text-gray-600">
                    <span>Total credits</span>
                    <span className="font-semibold text-gray-900 font-mono">
                      {totalCalculatedCredits.toLocaleString()}
                    </span>
                  </div>

                  {/* Divider Line */}
                  <div className="border-t border-gray-200 my-3" />

                  {/* Total Cost */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-gray-900">Total cost</span>
                    <span className="font-extrabold text-base text-gray-900 font-mono">
                      ${totalCost}
                    </span>
                  </div>
                </div>

                {/* Bottom Row: Secure notice + Confirm purchase button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Lock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Payments are processed securely</span>
                  </div>

                  <button
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    Confirm purchase
                  </button>
                </div>
              </div>

              {/* Card 2: 0 transactions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-2xs">
                <div className="flex items-center gap-1.5 text-sm font-bold text-gray-900 mb-6">
                  <span>{transactions.length} transactions</span>
                  <Info className="w-3.5 h-3.5 text-gray-400 cursor-pointer" />
                </div>

                {transactions.length === 0 ? (
                  /* Empty state matching Screenshot 4 exact */
                  <div className="py-12 text-center space-y-1">
                    <div className="text-sm font-bold text-gray-900">No data</div>
                    <div className="text-xs text-gray-500">
                      We have not found any transactions linked to your account
                    </div>
                  </div>
                ) : (
                  /* Real transaction history table when user buys */
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold text-[11px]">
                        <tr>
                          <th className="px-4 py-2.5">Date</th>
                          <th className="px-4 py-2.5">Credits</th>
                          <th className="px-4 py-2.5">Amount</th>
                          <th className="px-4 py-2.5">Status</th>
                          <th className="px-4 py-2.5">Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {transactions.map((tx) => (
                          <tr key={tx.id} className="hover:bg-gray-50/60">
                            <td className="px-4 py-3 font-medium text-gray-900">{tx.date}</td>
                            <td className="px-4 py-3 font-mono font-bold text-emerald-600">
                              +{tx.credits.toLocaleString()}
                            </td>
                            <td className="px-4 py-3 font-mono font-semibold text-gray-800">
                              {tx.amount}
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                {tx.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => alert(`Downloading ${tx.invoiceId}.pdf`)}
                                className="text-[#0B69FF] hover:underline flex items-center gap-1 font-medium"
                              >
                                <Download className="w-3.5 h-3.5" />
                                {tx.invoiceId}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Matching Screenshot 4 */}
      <footer className="mt-12 py-5 px-6 border-t border-gray-200 bg-white flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 font-bold text-gray-800 text-[13px]">
            <span className="w-4 h-4 rounded bg-[#0B69FF] flex items-center justify-center text-white text-[10px] font-black">
              S
            </span>
            <span>SE Ranking</span>
          </div>
        </div>

        <div className="flex items-center gap-5 text-gray-500 text-[11.5px]">
          <a href="https://help.seranking.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
            Report a bug
          </a>
          <a href="https://seranking.com/affiliate.html" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
            Affiliates
          </a>
          <Link href="/api-docs" className="hover:text-gray-900 transition-colors">
            API
          </Link>
          <a href="https://seranking.com/blog/whats-new/" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
            What&apos;s new
          </a>
          <a href="https://help.seranking.com" target="_blank" rel="noreferrer" className="hover:text-gray-900 transition-colors">
            Help
          </a>
        </div>
      </footer>

      {/* Purchase Checkout Modal */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0B69FF]" />
                Checkout &amp; Add Credits
              </h3>
              <button
                onClick={() => setIsPurchaseModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {purchaseStep === 'success' ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div className="text-base font-bold text-gray-900">Purchase Successful!</div>
                <div className="text-xs text-gray-600">
                  +{totalCalculatedCredits.toLocaleString()} Data API credits have been added to your wallet.
                </div>
              </div>
            ) : (
              <form onSubmit={handleConfirmPurchase} className="p-5 space-y-4 text-xs">
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-gray-900">
                      {totalCalculatedCredits.toLocaleString()} Credits
                    </div>
                    <div className="text-[11px] text-gray-500">Instant delivery to wallet</div>
                  </div>
                  <div className="text-base font-black text-gray-900 font-mono">${totalCost}</div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Card Number</label>
                  <input
                    type="text"
                    required
                    defaultValue="4242 •••• •••• 4242"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Expiry</label>
                    <input
                      type="text"
                      required
                      defaultValue="12/28"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">CVC</label>
                    <input
                      type="password"
                      required
                      defaultValue="123"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPurchaseModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                  >
                    Pay ${totalCost}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Create Key Modal */}
      {isCreateKeyModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Create New API Key</h3>
              <button
                onClick={() => setIsCreateKeyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`API Key "${newKeyName || 'New Key'}" created successfully!`);
                setIsCreateKeyModalOpen(false);
                setNewKeyName('');
              }}
              className="p-5 space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Key Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Wallet Top-Up Pipeline"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateKeyModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B69FF] text-white rounded-lg font-semibold cursor-pointer"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#0B69FF]" />
                Send Feedback
              </h3>
              <button
                onClick={() => setIsFeedbackOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {feedbackSent ? (
              <div className="p-6 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm text-gray-900">Thank you!</div>
                <div className="text-xs text-gray-500">Your feedback has been submitted.</div>
              </div>
            ) : (
              <form onSubmit={handleSendFeedback} className="p-5 space-y-3">
                <p className="text-xs text-gray-600">
                  Have questions or suggestions about your wallet and credit billing?
                </p>
                <textarea
                  required
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="px-3.5 py-1.5 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-md text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
