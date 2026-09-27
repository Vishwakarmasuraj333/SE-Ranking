'use client';

import React, { useState } from 'react';
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
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isCreateKeyModalOpen, setIsCreateKeyModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');

  // Cost calculation: $0.20 per 1,000 credits = $0.0002 per credit
  const pricePerCredit = 0.0002;
  const totalCost = (creditsAmount * pricePerCredit).toFixed(2);

  // Bonus credits logic (e.g. 5% bonus for 1M+, 10% bonus for 2.5M+)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    const num = parseInt(rawVal, 10);
    if (!isNaN(num)) {
      setCreditsAmount(num);
    } else if (rawVal === '') {
      setCreditsAmount(0);
    }
  };

  const handleConfirmPurchase = () => {
    if (creditsAmount < 250000) {
      alert('Minimum purchase is 250,000 credits.');
      return;
    }
    setIsPurchaseModalOpen(true);
  };

  const handleExecutePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      date: 'Sep 27, 2026',
      credits: totalCalculatedCredits,
      amount: `$${totalCost}`,
      status: 'Completed',
      invoiceId: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
    };

    setWalletBalance((prev) => prev + totalCalculatedCredits);
    setTransactions([newTx, ...transactions]);

    setTimeout(() => {
      setIsSuccess(false);
      setIsPurchaseModalOpen(false);
    }, 1500);
  };

  return (
    <div className="wallet-section w-full min-h-screen bg-[#F4F6F9] py-6 px-4 sm:px-6 font-sans text-[#171B24] flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-6">

        {/* ===================== API HEADER ===================== */}
        <div className="api-header bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs">
          <div className="api-header__top flex flex-wrap items-center justify-between gap-4">
            <div className="api-header__title-wrapper flex items-center gap-2">
              <h1 className="api-header__title text-2xl font-bold text-[#171B24] tracking-tight">
                Wallet
              </h1>
              <div className="se-hint-element-2 se-hint-title-2">
                <div
                  className="se-hint-element-2__wrapper"
                  title="Your API wallet balance is used to pay for on-demand endpoint requests."
                >
                  <span className="se-hint-title-2__icon w-4 h-4 rounded-full bg-[#E1E6EB] text-[#5B6370] text-[10px] font-bold inline-flex items-center justify-center cursor-help">
                    i
                  </span>
                </div>
              </div>
            </div>

            <div className="api-header__button-wrapper">
              <button
                onClick={() => setIsCreateKeyModalOpen(true)}
                className="se-button_icon se-button-2_size-l se-button-2 se-button-2_primary inline-flex items-center gap-2 px-5 py-2.5 bg-[#2870ED] hover:bg-[#1C60DB] active:bg-[#1553C4] text-white font-semibold text-xs rounded-[8px] shadow-sm transition-all cursor-pointer"
              >
                <span className="se-button-2__wrapper flex items-center gap-1.5">
                  <span className="se-material-icon-2 se-button-2__icon notranslate">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                  </span>
                  <span className="se-button-2__text">Create api key</span>
                  <span className="se-button-2__arrow">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                    </svg>
                  </span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ===================== WALLET SECTION BODY (GRID) ===================== */}
        <div className="ui-grid wallet-section__body space-y-6">

          {/* ===================== TOP ROW: 3 COLUMNS (1 Balance : 2 Purchase) ===================== */}
          <div className="ui-grid-cell ui-grid-cell_span-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* TOP LEFT: Wallet balance (1 col) */}
              <div className="ui-grid-cell ui-grid-cell_content-grow ui-grid-cell_span-1 lg:col-span-1">
                <div className="ui-card wallet-balance bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs h-full flex flex-col justify-between">
                  <div>
                    <div className="ui-card__header pb-4 border-b border-[#F0F2F5]">
                      <div className="ui-card__header-left">
                        <h4 className="ui-heading ui-heading_l-4 text-base font-bold text-[#171B24]">
                          Wallet balance
                        </h4>
                      </div>
                    </div>

                    <div className="ui-card__body pt-5">
                      <div className="wallet-balance__container space-y-5">
                        
                        {/* Balance value + Concentric Circle Target Icon */}
                        <div className="flex items-center gap-3">
                          <div className="wallet-balance__icon shrink-0">
                            {/* Exact SVG from user snippet with color rgb(55, 106, 253) */}
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="2.4rem"
                              height="2.4rem"
                              viewBox="0 0 24 24"
                              className="w-9 h-9"
                              style={{ color: 'rgb(55, 106, 253)' }}
                            >
                              <path
                                fill="currentColor"
                                d="M15 4c-4.42 0-8 3.58-8 8s3.58 8 8 8s8-3.58 8-8s-3.58-8-8-8m0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6s6 2.69 6 6s-2.69 6-6 6M3 12a5.99 5.99 0 0 1 4-5.65V4.26C3.55 5.15 1 8.27 1 12s2.55 6.85 6 7.74v-2.09A5.99 5.99 0 0 1 3 12"
                              />
                            </svg>
                          </div>
                          <div className="ui-number ui-number_a-default ui-number_s-xl">
                            <div className="ui-heading ui-heading_l-2 ui-number__value text-3xl font-extrabold text-[#171B24]">
                              {walletBalance.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Avg daily consumption */}
                        <div className="ui-flex-item">
                          <div className="ui-text ui-text_size-s ui-text_a-secondary text-xs text-[#7A8391]">
                            Avg. daily consumption
                          </div>
                          <div className="ui-heading ui-heading_l-4 ui-number__value text-base font-bold text-[#171B24] mt-0.5">
                            0
                          </div>
                        </div>

                        {/* Days of runway */}
                        <div className="ui-flex-item">
                          <div className="ui-text ui-text_size-s ui-text_a-secondary text-xs text-[#7A8391]">
                            Days of runway
                          </div>
                          <div className="ui-heading ui-heading_l-4 ui-number__value text-base font-bold text-[#171B24] mt-0.5">
                            —
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Wallet Message: Set up auto recharge */}
                  <div className="wallet-message pt-5 border-t border-[#F0F2F5] mt-4">
                    <div className="flex items-center gap-2 text-xs text-[#5B6370]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16px"
                        height="16px"
                        viewBox="0 0 24 24"
                        className="w-4 h-4 text-[#7A8391] shrink-0"
                      >
                        <path
                          fill="currentColor"
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"
                        />
                      </svg>
                      <div className="ui-text ui-text_size-m">Set up auto recharge</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* TOP RIGHT: Wallet purchase calculator (2 cols) */}
              <div className="ui-grid-cell ui-grid-cell_content-grow ui-grid-cell_span-2 lg:col-span-2">
                <div className="ui-card wallet-purchase bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs h-full flex flex-col justify-between space-y-6">
                  
                  {/* Credits Stepper Input */}
                  <div className="wallet-purchase__input pb-4 border-b border-[#F0F2F5]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="ui-flex-item">
                        <h4 className="ui-heading ui-heading_l-4 text-base font-bold text-[#171B24]">
                          Credits amount
                        </h4>
                        <div className="ui-text ui-text_size-s ui-text_a-secondary text-xs text-[#7A8391] mt-0.5">
                          Min. purchase 250,000 credits
                        </div>
                      </div>

                      {/* Stepper Group */}
                      <div className="ui-input-group ui-stepper-input flex items-center border border-[#E1E6EB] rounded-[8px] overflow-hidden bg-white shadow-2xs">
                        <div className="ui-input-group-item">
                          <input
                            type="text"
                            value={creditsAmount.toLocaleString()}
                            onChange={handleInputChange}
                            className="ui-input__input px-3.5 py-2 text-sm font-bold text-[#171B24] w-36 text-right focus:outline-hidden"
                          />
                        </div>
                        {/* Minus button */}
                        <div className="ui-input-group-item ui-input-group-item_shrink border-l border-[#E1E6EB]">
                          <button
                            type="button"
                            onClick={handleDecrement}
                            disabled={creditsAmount <= 250000}
                            className={`p-2 transition-colors flex items-center justify-center ${
                              creditsAmount <= 250000
                                ? 'opacity-40 cursor-not-allowed bg-gray-50 text-gray-400'
                                : 'hover:bg-[#F2F5F8] text-[#171B24] cursor-pointer'
                            }`}
                            aria-label="Decrease credits"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 12.998H5v-2h14z" />
                            </svg>
                          </button>
                        </div>
                        {/* Plus button */}
                        <div className="ui-input-group-item ui-input-group-item_shrink border-l border-[#E1E6EB]">
                          <button
                            type="button"
                            onClick={handleIncrement}
                            className="p-2 hover:bg-[#F2F5F8] text-[#171B24] transition-colors flex items-center justify-center cursor-pointer"
                            aria-label="Increase credits"
                          >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 12.998h-6v6h-2v-6H5v-2h6v-6h2v6h6z" />
                            </svg>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Cost breakdown rows */}
                  <div className="space-y-3 text-xs">
                    {/* Bonus credits */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#5B6370]">
                        <span>Bonus credits</span>
                        <span
                          className="ui-info w-3.5 h-3.5 rounded-full bg-[#E1E6EB] text-[#5B6370] text-[9px] font-bold inline-flex items-center justify-center cursor-help"
                          title="Bonus credits are extra credits added on top of your purchase when a promotion applies."
                        >
                          i
                        </span>
                      </div>
                      <div className="font-semibold text-[#171B24]">
                        {bonusCredits.toLocaleString()}
                      </div>
                    </div>

                    {/* Cost for 1,000 credits */}
                    <div className="flex items-center justify-between">
                      <div className="text-[#5B6370]">Cost for 1,000 credits</div>
                      <div className="font-semibold text-[#171B24]">$0.20</div>
                    </div>

                    {/* Total credits */}
                    <div className="flex items-center justify-between">
                      <div className="text-[#5B6370]">Total credits</div>
                      <div className="font-bold text-[#171B24]">
                        {totalCalculatedCredits.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Separator */}
                  <div className="wallet-purchase__separator border-t border-[#F0F2F5]"></div>

                  {/* Total Cost */}
                  <div className="flex items-center justify-between">
                    <h3 className="ui-heading ui-heading_l-3 text-base font-bold text-[#171B24]">
                      Total cost
                    </h3>
                    <div className="ui-heading ui-heading_l-3 ui-number__value text-2xl font-extrabold text-[#171B24]">
                      ${totalCost}
                    </div>
                  </div>

                  {/* Actions Bar: Payments processed securely + Confirm purchase button */}
                  <div className="wallet-purchase__actions pt-3 border-t border-[#F0F2F5]">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-2 text-xs text-[#7A8391]">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16px"
                          height="16px"
                          viewBox="0 0 24 24"
                          className="w-4 h-4 text-[#7A8391] shrink-0"
                        >
                          <path
                            fill="currentColor"
                            d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2m-6 9c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2m3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1z"
                          />
                        </svg>
                        <span className="ui-text ui-text_size-m">
                          Payments are processed securely
                        </span>
                      </div>

                      <span className="wallet-purchase__confirm-wrap">
                        <button
                          type="button"
                          onClick={handleConfirmPurchase}
                          className="ui-button ui-button_s-l ui-button_a-primary wallet-purchase__confirm px-6 py-2.5 bg-[#2870ED] hover:bg-[#1C60DB] active:bg-[#1553C4] text-white font-semibold text-xs rounded-[8px] shadow-sm transition-all cursor-pointer"
                        >
                          <span className="ui-button__text">Confirm purchase</span>
                        </button>
                      </span>

                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>

          {/* ===================== BOTTOM ROW: 3 COLUMNS (1 Auto/Low alert : 2 Transactions) ===================== */}
          <div className="ui-grid-cell ui-grid-cell_span-1">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* BOTTOM LEFT: Auto recharge & Low balance alert (1 col stacked) */}
              <div className="ui-grid-cell ui-grid-cell_span-1 lg:col-span-1 space-y-6">
                
                {/* Auto recharge */}
                <div className="ui-card wallet-balance bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs">
                  <div className="ui-card__header pb-3 border-b border-[#F0F2F5]">
                    <h4 className="ui-heading ui-heading_l-4 text-base font-bold text-[#171B24]">
                      Auto recharge
                    </h4>
                  </div>
                  <div className="ui-card__body pt-4">
                    <div className="wallet-message flex items-center gap-2 text-xs text-[#7A8391]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16px"
                        height="16px"
                        viewBox="0 0 24 24"
                        className="w-4 h-4 shrink-0"
                      >
                        <path
                          fill="currentColor"
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"
                        />
                      </svg>
                      <div className="ui-text ui-text_size-m">Coming soon</div>
                    </div>
                  </div>
                </div>

                {/* Low balance alert */}
                <div className="ui-card wallet-balance bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs">
                  <div className="ui-card__header pb-3 border-b border-[#F0F2F5]">
                    <h4 className="ui-heading ui-heading_l-4 text-base font-bold text-[#171B24]">
                      Low balance alert
                    </h4>
                  </div>
                  <div className="ui-card__body pt-4">
                    <div className="wallet-message flex items-center gap-2 text-xs text-[#7A8391]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16px"
                        height="16px"
                        viewBox="0 0 24 24"
                        className="w-4 h-4 shrink-0"
                      >
                        <path
                          fill="currentColor"
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 15h-2v-6h2zm0-8h-2V7h2z"
                        />
                      </svg>
                      <div className="ui-text ui-text_size-m">Coming soon</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* BOTTOM RIGHT: Transactions Card (2 cols) */}
              <div className="ui-grid-cell ui-grid-cell_span-2 lg:col-span-2">
                <div className="wallet-transactions h-full">
                  <div className="ui-card ui-card_p-none wallet-transactions__card bg-white border border-[#E1E6EB] rounded-[16px] shadow-xs overflow-hidden h-full flex flex-col justify-between">
                    
                    <div>
                      {/* Header */}
                      <div className="ui-card__header p-5 border-b border-[#F0F2F5] flex items-center gap-2">
                        <h4 className="ui-heading ui-heading_l-4 text-base font-bold text-[#171B24]">
                          {transactions.length} transactions
                        </h4>
                        <span
                          className="ui-info w-4 h-4 rounded-full bg-[#E1E6EB] text-[#5B6370] text-[10px] font-bold inline-flex items-center justify-center cursor-help"
                          title="This list only includes wallet transactions and their invoices."
                        >
                          i
                        </span>
                      </div>

                      {/* Body */}
                      <div className="ui-card__body p-6">
                        {transactions.length === 0 ? (
                          /* No data matching exact user snippet */
                          <div className="wallet-transactions__no-data-box py-12 text-center">
                            <div className="ui-status-message space-y-1">
                              <h3 className="ui-heading ui-heading_l-3 text-sm font-bold text-[#171B24]">
                                No data
                              </h3>
                              <div className="ui-text ui-text_size-l text-xs text-[#7A8391]">
                                We have not found any transactions linked to your account
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Transaction rows when purchased */
                          <div className="space-y-3">
                            {transactions.map((tx) => (
                              <div
                                key={tx.id}
                                className="flex items-center justify-between p-3.5 rounded-[10px] border border-[#E1E6EB] bg-[#F8FAFC] text-xs"
                              >
                                <div className="space-y-0.5">
                                  <div className="font-bold text-[#171B24]">
                                    Purchased {tx.credits.toLocaleString()} Data API credits
                                  </div>
                                  <div className="text-[#7A8391] text-[11px]">
                                    {tx.date} • {tx.invoiceId}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="font-bold text-[#171B24]">{tx.amount}</span>
                                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-full text-[10px]">
                                    {tx.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-[#F0F2F5] text-xs text-[#7A8391] flex items-center justify-between">
                      <span>Receipts & invoices are automatically generated</span>
                      <Link href="/pricing" className="text-[#2870ED] font-semibold hover:underline">
                        API Pricing & plans →
                      </Link>
                    </div>

                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Footer utility links matching SE Ranking */}
      <div className="border-t border-[#E1E6EB] bg-white mt-8 py-3 px-6 text-xs text-[#7A8391] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-bold text-[#323842]">
          <div className="w-4 h-4 rounded bg-[#2870ED] flex items-center justify-center text-white text-[9px] font-black">
            W
          </div>
          <span>SE Ranking Wallet & Credits</span>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/api-docs" className="hover:text-[#2870ED] transition-colors">
            API Dashboard
          </Link>
          <Link href="/api-docs/keywords" className="hover:text-[#2870ED] transition-colors">
            Keywords API
          </Link>
          <Link href="/api-docs/mcp" className="hover:text-[#2870ED] transition-colors">
            MCP Server
          </Link>
          <Link href="/pricing" className="hover:text-[#2870ED] transition-colors">
            Pricing
          </Link>
        </div>
      </div>

      {/* ===================== MODAL: CHECKOUT / PURCHASE ===================== */}
      {isPurchaseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#E1E6EB] relative">
            <button
              onClick={() => setIsPurchaseModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              ✕
            </button>

            {isSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-xl">
                  ✓
                </div>
                <h3 className="text-base font-bold text-[#171B24]">Payment Successful!</h3>
                <p className="text-xs text-[#5B6370]">
                  {totalCalculatedCredits.toLocaleString()} credits have been added to your API wallet.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExecutePayment} className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2870ED] flex items-center justify-center font-bold text-sm">
                    💳
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#171B24]">Complete Purchase</h3>
                    <p className="text-xs text-[#5B6370]">Order summary & payment method</p>
                  </div>
                </div>

                <div className="bg-[#F8FAFC] border border-[#E1E6EB] rounded-[10px] p-3 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#5B6370]">Package credits:</span>
                    <span className="font-bold text-[#171B24]">{creditsAmount.toLocaleString()}</span>
                  </div>
                  {bonusCredits > 0 && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>Bonus credits:</span>
                      <span>+{bonusCredits.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-1 border-t border-[#E1E6EB]">
                    <span className="font-bold text-[#171B24]">Amount Due:</span>
                    <span className="font-black text-[#2870ED] text-sm">${totalCost}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue="•••• •••• •••• 4242"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPurchaseModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    Pay ${totalCost}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ===================== MODAL: CREATE API KEY ===================== */}
      {isCreateKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#E1E6EB] relative">
            <button
              onClick={() => setIsCreateKeyModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              ✕
            </button>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`API key "${newKeyName}" created successfully!`);
                setIsCreateKeyModalOpen(false);
                setNewKeyName('');
              }}
              className="space-y-4"
            >
              <h3 className="text-base font-bold text-[#171B24]">Create API Key</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Key Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Production Backend"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-[#2870ED]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateKeyModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2870ED] text-white text-xs font-semibold rounded-lg"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
