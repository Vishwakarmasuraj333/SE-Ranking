'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Coins,
  TrendingDown,
  Calendar,
  AlertTriangle,
  Bell,
  RefreshCw,
  Plus,
  Minus,
  CheckCircle2,
  HelpCircle,
  CreditCard,
  Receipt,
  Download,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

export default function ApiWalletPage() {
  const [creditsToBuy, setCreditsToBuy] = useState<number>(250000);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  // Rate: $0.20 per 1,000 credits ($0.0002 per credit)
  const pricePerCredit = 0.0002;
  const totalPrice = (creditsToBuy * pricePerCredit).toFixed(2);

  const presets = [100000, 250000, 500000, 1000000, 2500000];

  const handleStep = (delta: number) => {
    setCreditsToBuy((prev) => Math.max(50000, prev + delta));
  };

  const handleConfirmPurchase = () => {
    setPurchaseSuccess(true);
    setTimeout(() => {
      setPurchaseSuccess(false);
      setIsCheckoutOpen(false);
    }, 2000);
  };

  return (
    <div className="flex-1 bg-[#F5F7FB] min-h-screen text-gray-800">
      {/* Top Header */}
      <div className="h-14 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/api-docs" className="text-gray-500 hover:text-gray-900">
            API
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-semibold">Wallet</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://help.seranking.com"
            target="_blank"
            rel="noreferrer"
            className="text-xs text-gray-600 hover:text-blue-600 font-medium flex items-center gap-1"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Feedback
          </a>
        </div>
      </div>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Top 3 Stat Cards (Screenshot 5 exact match) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Stat 1: Wallet balance */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
              <span>Wallet balance</span>
              <Wallet className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              0 <span className="text-sm font-medium text-gray-500">credits</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-2">
              Credits never expire and roll over automatically
            </p>
          </div>

          {/* Stat 2: Avg daily consumption */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
              <span>Avg. daily consumption</span>
              <TrendingDown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-3xl font-extrabold text-gray-900">
              0 <span className="text-sm font-medium text-gray-500">credits / day</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-2">
              Calculated across the last 30 calendar days
            </p>
          </div>

          {/* Stat 3: Days of runway */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
              <span>Days of runway</span>
              <Calendar className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-3xl font-extrabold text-gray-400">
              —
            </div>
            <p className="text-[11px] text-gray-500 mt-2">
              Estimated depletion based on current consumption
            </p>
          </div>
        </div>

        {/* 2 Middle Config Cards: Auto-recharge & Low Balance Alert */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Auto Recharge */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Auto-recharge</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  Automatically refill your wallet balance whenever it drops below a threshold.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md shrink-0">
              Coming soon
            </span>
          </div>

          {/* Card 2: Low Balance Alert */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs flex items-center justify-between">
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-900">Low balance alert</h4>
                <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                  Receive email and webhook alerts before your API calls get blocked due to exhaustion.
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wider rounded-md shrink-0">
              Coming soon
            </span>
          </div>
        </div>

        {/* Interactive Buy Credits Calculator */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-xs">
          <div className="border-b border-gray-100 pb-4 mb-5">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-[#0B69FF]" />
              Buy API Credits
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Purchase pre-paid credits to use for Data API requests, SERP extraction, and AI overview queries.
            </p>
          </div>

          <div className="space-y-6 max-w-2xl">
            {/* Quick Presets */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Select credit package
              </label>
              <div className="flex flex-wrap gap-2">
                {presets.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCreditsToBuy(amt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      creditsToBuy === amt
                        ? 'bg-[#0B69FF] text-white shadow-xs'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {amt.toLocaleString()} credits
                  </button>
                ))}
              </div>
            </div>

            {/* Stepper Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Custom Amount
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleStep(-50000)}
                  className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-700 font-bold transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="relative flex-1 max-w-xs">
                  <input
                    type="number"
                    step="50000"
                    min="50000"
                    value={creditsToBuy}
                    onChange={(e) => setCreditsToBuy(Math.max(50000, Number(e.target.value) || 0))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-gray-500 font-medium">
                    credits
                  </span>
                </div>
                <button
                  onClick={() => handleStep(50000)}
                  className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 flex items-center justify-center text-gray-700 font-bold transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Price Breakdown Banner */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-gray-500">Estimated Total (excl. VAT)</div>
                <div className="text-2xl font-extrabold text-[#0B69FF] mt-0.5">
                  ${totalPrice} <span className="text-xs font-normal text-gray-600">USD</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-1">
                  Rate: $0.20 per 1,000 credits (${pricePerCredit.toFixed(4)}/credit)
                </div>
              </div>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="px-6 py-2.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-gray-600" />
              Transaction History
            </h3>
            <span className="text-xs text-gray-400">Showing last 90 days</span>
          </div>

          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-gray-700">No transactions recorded</h4>
            <p className="text-[11px] text-gray-500 max-w-xs mx-auto mt-1">
              Your credit purchases, automatic refills, and monthly usage ledger will appear here.
            </p>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0B69FF]" />
                Confirm Credits Purchase
              </h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4">
              {purchaseSuccess ? (
                <div className="text-center py-6 space-y-2">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
                  <h4 className="text-base font-bold text-gray-900">Purchase Successful!</h4>
                  <p className="text-xs text-gray-500">
                    {creditsToBuy.toLocaleString()} credits have been credited to your wallet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2 text-xs">
                    <div className="flex justify-between text-blue-900 font-semibold">
                      <span>Package:</span>
                      <span>{creditsToBuy.toLocaleString()} Credits</span>
                    </div>
                    <div className="flex justify-between text-blue-900 font-semibold">
                      <span>Billing:</span>
                      <span>Prepaid Balance</span>
                    </div>
                    <div className="flex justify-between text-blue-950 font-bold text-sm pt-2 border-t border-blue-200">
                      <span>Total Due:</span>
                      <span>${totalPrice} USD</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gray-700">
                      Payment Method
                    </label>
                    <div className="p-3 border border-gray-200 rounded-lg flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-gray-600" />
                        <span className="font-semibold text-gray-800">Mastercard ending in •••• 4242</span>
                      </div>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold">Default</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-gray-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>256-bit encrypted checkout via Stripe</span>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsCheckoutOpen(false)}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmPurchase}
                      className="px-5 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      Pay ${totalPrice} USD
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
