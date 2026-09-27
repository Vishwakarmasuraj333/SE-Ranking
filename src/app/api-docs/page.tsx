'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface ApiKeyItem {
  id: string;
  name: string;
  token: string;
  created: string;
  lastUsed: string;
}

export default function ApiDashboardPage() {
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeType, setUpgradeType] = useState<'addon' | 'standalone'>('addon');
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Dynamic API Keys list matching user HTML
  const [apiKeys, setApiKeys] = useState<ApiKeyItem[]>([
    {
      id: 'key-1',
      name: 'Data API Key',
      token: '12856b00-b1c7-f25b-68b9-294c542738ac',
      created: 'Sep 25, 2026',
      lastUsed: 'Sep 27, 2026',
    },
  ]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const randomHex = Array.from({ length: 4 }, () =>
      Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1)
    ).join('-');

    const newKey: ApiKeyItem = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      token: `${randomHex}-b1c7-f25b-${Math.floor(1000 + Math.random() * 9000)}ac`,
      created: 'Sep 27, 2026',
      lastUsed: 'Just now',
    };

    setApiKeys([newKey, ...apiKeys]);
    setNewKeyName('');
    setIsCreateModalOpen(false);
  };

  const handleDeleteKey = (id: string) => {
    if (confirm('Are you sure you want to revoke this API key?')) {
      setApiKeys(apiKeys.filter((k) => k.id !== id));
    }
  };

  return (
    <div className="api-dashboard w-full min-h-screen bg-[#F4F6F9] py-6 px-4 sm:px-6 font-sans text-[#171B24] flex flex-col justify-between">
      <div className="max-w-6xl mx-auto w-full space-y-6">

        {/* ===================== API HEADER ===================== */}
        <div className="api-header bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs">
          <div className="api-header__top flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#F0F2F5]">
            <div className="api-header__title-wrapper flex items-center gap-2">
              <h1 className="api-header__title text-2xl font-bold text-[#171B24] tracking-tight">
                API Dashboard
              </h1>
              <div className="se-hint-element-2 se-hint-title-2">
                <div className="se-hint-element-2__wrapper" title="Manage your SE Ranking API keys, monitor credit consumption, and explore developer docs.">
                  <span className="se-hint-title-2__icon w-4 h-4 rounded-full bg-[#E1E6EB] text-[#5B6370] text-[10px] font-bold inline-flex items-center justify-center cursor-help">
                    i
                  </span>
                </div>
              </div>
            </div>

            <div className="api-header__button-wrapper">
              <button
                onClick={() => setIsCreateModalOpen(true)}
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

          <div className="api-header__footer pt-3 flex items-center gap-4 text-xs text-[#5B6370]">
            <div className="api-header__key-count font-semibold text-[#171B24]">
              {apiKeys.length} / 10 API keys
            </div>
            <span className="text-gray-300">•</span>
            <div className="api-header__last-used">
              Last used <b className="text-[#171B24]">Sep 27, 2026</b>
            </div>
          </div>
        </div>

        {/* ===================== API BANNER (Trial ends in 10 days) ===================== */}
        <div className="api-banner api-banner--info bg-[#F0F7FF] border border-[#B8D7FF] rounded-[14px] p-5 shadow-xs">
          <div className="api-banner__header flex items-center justify-between pb-2 border-b border-[#D0E4FF]">
            <div className="api-banner__title-section flex items-center gap-2.5">
              <span className="se-material-icon-2 api-banner__icon text-[#171717] flex items-center">
                {/* schedule clock icon */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
                </svg>
              </span>
              <span className="api-banner__title font-bold text-sm text-[#171717]">
                Trial ends in 10 days
              </span>
            </div>
            <div className="api-banner__header-info text-xs font-semibold text-[#2870ED] bg-white px-2.5 py-0.5 rounded-full border border-[#B8D7FF]">
              Access to the Data API only
            </div>
          </div>
          <div className="api-banner__content pt-3 text-xs text-[#1E3A8A]">
            Still have 100,000 credits to explore. Want to keep going?{' '}
            <Link
              href="/pricing"
              className="api-banner__link font-bold text-[#2870ED] hover:underline"
            >
              Get full access
            </Link>
          </div>
        </div>

        {/* ===================== API CARDS (Credits Usage & Full API Access) ===================== */}
        <div className="api-cards grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Card 1: Credits usage (5 Cols) */}
          <div className="api-cards__card lg:col-span-5 bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="api-cards__card-header pb-3 border-b border-[#F0F2F5]">
                <div className="api-cards__card-title text-base font-bold text-[#171B24]">
                  Credits usage
                </div>
              </div>

              <div className="api-cards__credits-body pt-4 space-y-3">
                <div className="api-cards__balance-text text-xs font-bold text-[#171B24]">
                  100,000 credits left from 100,000
                </div>

                {/* Progress Bar 100% */}
                <div className="ui-flex ui-flex_direction-row ui-flex_wrap-nowrap ui-flex_justify-start ui-flex_align-center ui-progress-bar api-cards__progress-bar w-full">
                  <div className="ui-progress-bar__body ui-progress-bar__body_rounded w-full bg-[#E4E5EA] h-4 rounded-full overflow-hidden">
                    <div
                      className="ui-progress-bar__bar h-full bg-[#376AFD] transition-all duration-300"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Expiration & Upgrade */}
                <div className="api-cards__expiration flex items-center justify-between text-xs pt-1">
                  <span className="api-cards__expiration-text text-[#5B6370]">
                    Credit expire Oct 07, 2026
                  </span>
                  <Link
                    href="/pricing"
                    className="ui-link ui-link_s-m ui-link_a-primary api-cards__upgrade-link font-bold text-[#2870ED] hover:underline cursor-pointer"
                  >
                    <span className="ui-link__text">Upgrade plan</span>
                  </Link>
                </div>

                {/* Wallet Balance Box */}
                <div className="api-cards__wallet-box bg-[#F8FAFC] border border-[#E1E6EB] rounded-[10px] p-3 flex items-center justify-between mt-3">
                  <div className="api-cards__wallet-left flex items-center gap-2 text-xs">
                    <span className="se-material-icon-2 text-[#5D5F65]">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                      </svg>
                    </span>
                    <span className="api-cards__wallet-label text-[#5B6370] font-medium">Wallet balance</span>
                    <span className="api-cards__wallet-balance-value font-bold text-[#171B24] ml-1">0</span>
                  </div>
                  <span className="api-cards__wallet-topup-wrap">
                    <button
                      onClick={() => setIsTopUpModalOpen(true)}
                      className="ui-link ui-link_s-m ui-link_a-primary api-cards__wallet-topup text-xs font-bold text-[#2870ED] hover:underline cursor-pointer"
                    >
                      <span className="ui-link__text">Top up</span>
                    </button>
                  </span>
                </div>
              </div>
            </div>

            <div className="api-cards__card-footer pt-3 border-t border-[#F0F2F5] text-xs text-[#5B6370]">
              <div className="api-cards__progress-description">
                View{' '}
                <a
                  href="https://seranking.com/api/data/getting-started/#unit-costs"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2870ED] hover:underline font-semibold"
                >
                  credit costs
                </a>{' '}
                per endpoint
              </div>
            </div>
          </div>

          {/* Card 2: Get full API access (7 Cols) */}
          <div className="api-cards__card api-cards__card_wide api-cards__access api-cards__access_trial lg:col-span-7 bg-white border border-[#E1E6EB] rounded-[16px] p-6 shadow-xs flex flex-col justify-between space-y-4">
            <div>
              <div className="api-cards__card-header pb-3 border-b border-[#F0F2F5]">
                <h4 className="ui-heading ui-heading_l-4 text-base font-bold text-[#171B24]">
                  Get full API access
                </h4>
              </div>

              <div className="api-cards__card-content api-cards__card-content_flex grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                
                {/* Cell 1: API Add-on */}
                <div className="api-cards__card-content-cell bg-[#F8FAFC] border border-[#E1E6EB] rounded-[12px] p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h5 className="ui-heading ui-heading_l-5 text-sm font-bold text-[#171B24]">
                      API Add-on
                    </h5>
                    <div className="ui-text ui-text_size-m text-xs text-[#5B6370] leading-relaxed">
                      Get a SE Ranking subscription with Data API credits included, plus extra credits on top.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUpgradeType('addon');
                      setIsUpgradeModalOpen(true);
                    }}
                    className="se-button-2_size-l se-button-2 se-button-2_table api-cards__addon-button w-full py-2 px-3 bg-white border border-[#E1E6EB] hover:bg-[#F2F5F8] text-[#171B24] font-bold text-xs rounded-[8px] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="se-button-2__wrapper flex items-center justify-between w-full">
                      <span className="se-button-2__text">GET API ADD-ON</span>
                      <span className="se-button-2__arrow">
                        <svg className="w-3.5 h-3.5 text-[#5B6370]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                        </svg>
                      </span>
                    </span>
                  </button>
                </div>

                {/* Cell 2: API Standalone */}
                <div className="api-cards__card-content-cell bg-[#F8FAFC] border border-[#E1E6EB] rounded-[12px] p-4 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h5 className="ui-heading ui-heading_l-5 text-sm font-bold text-[#171B24]">
                      API Standalone
                    </h5>
                    <div className="ui-text ui-text_size-m text-xs text-[#5B6370] leading-relaxed">
                      API-only access to SE Ranking datasets. No web app, no subscription required.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUpgradeType('standalone');
                      setIsUpgradeModalOpen(true);
                    }}
                    className="se-button-2_size-l se-button-2 se-button-2_table api-cards__standalone-button w-full py-2 px-3 bg-white border border-[#E1E6EB] hover:bg-[#F2F5F8] text-[#171B24] font-bold text-xs rounded-[8px] flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <span className="se-button-2__wrapper flex items-center justify-between w-full">
                      <span className="se-button-2__text uppercase">Get api standalone</span>
                      <span className="se-button-2__arrow">
                        <svg className="w-3.5 h-3.5 text-[#5B6370]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" />
                        </svg>
                      </span>
                    </span>
                  </button>
                </div>

              </div>
            </div>

            <div className="api-cards__card-footer pt-3 border-t border-[#F0F2F5] text-xs text-[#5B6370] flex items-center justify-between">
              <span>Custom plans are available</span>
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="ui-link ui-link_s-m ui-link_a-primary api-cards__description-link font-bold text-[#2870ED] hover:underline cursor-pointer"
              >
                <span className="ui-link__text">Contact Us</span>
              </button>
            </div>
          </div>

        </div>

        {/* ===================== API KEYS TABLE ===================== */}
        <div className="uix-layer-group uix-layer-group_vertical uix-simple-tile api-dashboard-table bg-white border border-[#E1E6EB] rounded-[16px] shadow-xs overflow-hidden">
          <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-m-xl uix-bordered-layer_rad-l uix-simple-tile__head p-5 border-b border-[#F0F2F5] flex items-center justify-between">
            <div className="text-description-block">
              <h2 className="se-h-2 se-h-2_lev-5 text-description-block__title text-base font-bold text-[#171B24]">
                API Keys
              </h2>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-xs font-semibold text-[#2870ED] hover:underline cursor-pointer"
            >
              + Add Key
            </button>
          </div>

          <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_gap-xl uix-bordered-layer_rad-l uix-simple-tile__body overflow-x-auto">
            <table className="uix-table api-dashboard-table__table w-full text-left text-xs min-w-[700px]">
              <thead>
                <tr className="uix-tr uix-tr_head bg-[#F8FAFC] border-b border-[#E1E6EB] text-[#5B6370] font-semibold">
                  <td className="uix-td api-dashboard-table__data py-3 px-5" style={{ width: '27%' }}>
                    <div className="uix-thead-btn api-dashboard-table__column-title">NAME</div>
                  </td>
                  <td className="uix-td api-dashboard-table__data py-3 px-5" style={{ width: '43%' }}>
                    <div className="uix-thead-btn api-dashboard-table__column-title">KEY</div>
                  </td>
                  <td className="uix-td api-dashboard-table__data py-3 px-5" style={{ width: '15%' }}>
                    <div className="uix-thead-btn api-dashboard-table__column-title">CREATED</div>
                  </td>
                  <td className="uix-td api-dashboard-table__data py-3 px-5" style={{ width: '15%' }}>
                    <div className="uix-thead-btn api-dashboard-table__column-title">Last used</div>
                  </td>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((k) => (
                  <tr
                    key={k.id}
                    className="uix-tr api-dashboard-table__row border-b border-[#F0F2F5] hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="uix-td api-dashboard-table__data api-dashboard-table__data_with-buttons py-3.5 px-5">
                      <div className="api-dashboard-table__cell api-dashboard-table__cell_with-buttons font-bold text-[#171B24]">
                        <p className="se-p-2 table-text-cell__value table-text-cell__value_no-wrap">
                          {k.name}
                        </p>
                      </div>
                    </td>

                    <td className="uix-td api-dashboard-table__data api-dashboard-table__data_with-buttons py-3.5 px-5">
                      <div className="api-dashboard-table__cell api-dashboard-table__cell_with-buttons flex items-center justify-between gap-3">
                        <code className="se-p-2 table-text-cell__value table-text-cell__value_no-wrap font-mono text-[11px] text-[#323842] bg-[#F2F5F8] px-2 py-0.5 rounded border border-[#E1E6EB]">
                          {k.token}
                        </code>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => copyToClipboard(k.token, k.id)}
                            className="se-button_icon se-button-2_size-l se-button-2_no-text se-button-2_square se-button-2 se-button-2_table api-dashboard-table__copy-button p-1.5 rounded-[6px] hover:bg-gray-100 text-[#5D5F61] transition-colors cursor-pointer"
                            aria-label="Copy key"
                            title="Copy API key"
                          >
                            <span className="se-button-2__wrapper flex items-center justify-center">
                              {copiedKeyId === k.id ? (
                                <span className="text-emerald-600 font-bold text-[10px]">Copied!</span>
                              ) : (
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                                </svg>
                              )}
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteKey(k.id)}
                            className="p-1.5 rounded-[6px] hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Revoke key"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="uix-td api-dashboard-table__data py-3.5 px-5 text-[#5B6370]">
                      <p className="se-p-2 table-text-cell__value table-text-cell__value_no-wrap">
                        {k.created}
                      </p>
                    </td>

                    <td className="uix-td api-dashboard-table__data py-3.5 px-5 text-[#5B6370]">
                      <p className="se-p-2 table-text-cell__value table-text-cell__value_no-wrap">
                        {k.lastUsed}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ===================== QUICK LINKS (6 Tiles matching exact user HTML) ===================== */}
        <div className="uix-layer-group uix-layer-group_vertical uix-simple-tile api-quick-links bg-white border border-[#E1E6EB] rounded-[16px] shadow-xs p-6">
          <div className="uix-simple-tile__head pb-4 border-b border-[#F0F2F5] mb-5">
            <h2 className="se-h-2 se-h-2_lev-5 text-description-block__title text-base font-bold text-[#171B24]">
              Quick Links
            </h2>
          </div>

          <div className="uix-simple-tile__body">
            <div className="api-quick-links__wrapper grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Link 1: Data API Documentation (rocket_launch) */}
              <Link
                href="/api-docs/keywords"
                className="api-quick-links__link group block"
              >
                <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_rad-l api-quick-links__tile bg-[#F8FAFC] border border-[#E1E6EB] group-hover:border-[#2870ED] rounded-[12px] p-5 h-full transition-all group-hover:shadow-xs relative flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="se-material-icon-2 api-quick-links__icon text-[#2E2E30] group-hover:text-[#2870ED]">
                      {/* rocket_launch */}
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9.19 6.35c-2.04 2.29-3.44 5.58-4.04 8.79l2.12.71c.46-2.58 1.57-5.26 3.2-7.14l-1.28-2.36zM11.99 2.05L10 4.19c3.08 2.08 5.6 5.37 6.64 9.17l2.13-.67C17.47 8.35 14.73 4.6 11.99 2.05zM2.81 18.57l3.64-1.21c-.24-.95-.38-1.92-.4-2.88L2 14.07c.07 1.59.35 3.12.81 4.5zM22 14.07l-4.05.41c-.02.96-.16 1.93-.4 2.88l3.64 1.21c.46-1.38.74-2.91.81-4.5zM12 6.5A5.5 5.5 0 1 0 17.5 12 5.5 5.5 0 0 0 12 6.5zm0 9a3.5 3.5 0 1 1 3.5-3.5 3.5 3.5 0 0 1-3.5 3.5z" />
                      </svg>
                    </span>
                    <span className="se-material-icon-2 api-quick-links__link-icon text-[#5D5F65] group-hover:text-[#2870ED]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <div className="api-quick-links__title font-bold text-sm text-[#171B24] group-hover:text-[#2870ED]">
                      Data API Documentation
                    </div>
                    <div className="api-quick-links__description text-xs text-[#5B6370] mt-1 leading-normal">
                      Quickstarts, endpoints &amp; examples for the Data API.
                    </div>
                  </div>
                </div>
              </Link>

              {/* Link 2: Project API Documentation (description) */}
              <a
                href="https://seranking.com/api/project/"
                target="_blank"
                rel="noreferrer"
                className="api-quick-links__link group block"
              >
                <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_rad-l api-quick-links__tile bg-[#F8FAFC] border border-[#E1E6EB] group-hover:border-[#2870ED] rounded-[12px] p-5 h-full transition-all group-hover:shadow-xs relative flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="se-material-icon-2 api-quick-links__icon text-[#2E2E30] group-hover:text-[#2870ED]">
                      {/* description */}
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                      </svg>
                    </span>
                    <span className="se-material-icon-2 api-quick-links__link-icon text-[#5D5F65] group-hover:text-[#2870ED]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <div className="api-quick-links__title font-bold text-sm text-[#171B24] group-hover:text-[#2870ED]">
                      Project API Documentation
                    </div>
                    <div className="api-quick-links__description text-xs text-[#5B6370] mt-1 leading-normal">
                      Endpoints to manage projects data.
                    </div>
                  </div>
                </div>
              </a>

              {/* Link 3: Postman Workspace (workspaces) */}
              <a
                href="https://www.postman.com/serankingdev/workspace/se-ranking-developers/collection/43871919-fb92e325-9cfe-45b7-a975-14b62f13a52f?action=share&source=copy-link&creator=43871919"
                target="_blank"
                rel="noreferrer"
                className="api-quick-links__link group block"
              >
                <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_rad-l api-quick-links__tile bg-[#F8FAFC] border border-[#E1E6EB] group-hover:border-[#2870ED] rounded-[12px] p-5 h-full transition-all group-hover:shadow-xs relative flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="se-material-icon-2 api-quick-links__icon text-[#2E2E30] group-hover:text-[#2870ED]">
                      {/* workspaces */}
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6 13c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm6-10C9.8 3 8 4.8 8 7s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4zm6 10c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" />
                      </svg>
                    </span>
                    <span className="se-material-icon-2 api-quick-links__link-icon text-[#5D5F65] group-hover:text-[#2870ED]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <div className="api-quick-links__title font-bold text-sm text-[#171B24] group-hover:text-[#2870ED]">
                      Postman Workspace
                    </div>
                    <div className="api-quick-links__description text-xs text-[#5B6370] mt-1 leading-normal">
                      Run requests and explore examples without coding.
                    </div>
                  </div>
                </div>
              </a>

              {/* Link 4: Integrations (hub) */}
              <a
                href="https://seranking.com/api/integrations/"
                target="_blank"
                rel="noreferrer"
                className="api-quick-links__link group block"
              >
                <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_rad-l api-quick-links__tile bg-[#F8FAFC] border border-[#E1E6EB] group-hover:border-[#2870ED] rounded-[12px] p-5 h-full transition-all group-hover:shadow-xs relative flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="se-material-icon-2 api-quick-links__icon text-[#2E2E30] group-hover:text-[#2870ED]">
                      {/* hub */}
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M10 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM5 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm14 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-9 7a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm4 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                      </svg>
                    </span>
                    <span className="se-material-icon-2 api-quick-links__link-icon text-[#5D5F65] group-hover:text-[#2870ED]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <div className="api-quick-links__title font-bold text-sm text-[#171B24] group-hover:text-[#2870ED]">
                      Integrations
                    </div>
                    <div className="api-quick-links__description text-xs text-[#5B6370] mt-1 leading-normal">
                      Connect SE Ranking with BI tools and services.
                    </div>
                  </div>
                </div>
              </a>

              {/* Link 5: Rate Limits (speed) */}
              <a
                href="https://seranking.com/api/rate-limits/"
                target="_blank"
                rel="noreferrer"
                className="api-quick-links__link group block"
              >
                <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_rad-l api-quick-links__tile bg-[#F8FAFC] border border-[#E1E6EB] group-hover:border-[#2870ED] rounded-[12px] p-5 h-full transition-all group-hover:shadow-xs relative flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="se-material-icon-2 api-quick-links__icon text-[#2E2E30] group-hover:text-[#2870ED]">
                      {/* speed */}
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.43zM10.59 15.41a2 2 0 1 0 2.83-2.83l-4.24-4.24-1.42 1.41 2.83 2.83a2 2 0 0 0 0 2.83z" />
                      </svg>
                    </span>
                    <span className="se-material-icon-2 api-quick-links__link-icon text-[#5D5F65] group-hover:text-[#2870ED]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <div className="api-quick-links__title font-bold text-sm text-[#171B24] group-hover:text-[#2870ED]">
                      Rate Limits
                    </div>
                    <div className="api-quick-links__description text-xs text-[#5B6370] mt-1 leading-normal">
                      Know your credit cost per call and scale safely without 429 surprises.
                    </div>
                  </div>
                </div>
              </a>

              {/* Link 6: API Help Center (support) */}
              <a
                href="https://help.seranking.com/hc/en-us/categories/21700778374300-API"
                target="_blank"
                rel="noreferrer"
                className="api-quick-links__link group block"
              >
                <div className="uix-background-layer uix-bordered-layer uix-bordered-layer_w-null uix-bordered-layer_rad-l api-quick-links__tile bg-[#F8FAFC] border border-[#E1E6EB] group-hover:border-[#2870ED] rounded-[12px] p-5 h-full transition-all group-hover:shadow-xs relative flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between">
                    <span className="se-material-icon-2 api-quick-links__icon text-[#2E2E30] group-hover:text-[#2870ED]">
                      {/* support */}
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                      </svg>
                    </span>
                    <span className="se-material-icon-2 api-quick-links__link-icon text-[#5D5F65] group-hover:text-[#2870ED]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 19H5V5h7V3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
                      </svg>
                    </span>
                  </div>
                  <div>
                    <div className="api-quick-links__title font-bold text-sm text-[#171B24] group-hover:text-[#2870ED]">
                      API Help Center
                    </div>
                    <div className="api-quick-links__description text-xs text-[#5B6370] mt-1 leading-normal">
                      FAQs, troubleshooting, and support articles.
                    </div>
                  </div>
                </div>
              </a>

            </div>
          </div>
        </div>

      </div>

      {/* Footer utility links matching SE Ranking */}
      <div className="border-t border-[#E1E6EB] bg-white mt-8 py-3 px-6 text-xs text-[#7A8391] flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-bold text-[#323842]">
          <div className="w-4 h-4 rounded bg-[#2870ED] flex items-center justify-center text-white text-[9px] font-black">
            API
          </div>
          <span>SE Ranking Developer Platform</span>
        </div>

        <div className="flex items-center gap-5">
          <Link href="/api-docs/keywords" className="hover:text-[#2870ED] transition-colors">
            Keywords API
          </Link>
          <Link href="/api-docs/backlinks" className="hover:text-[#2870ED] transition-colors">
            Backlinks API
          </Link>
          <Link href="/api-docs/domains" className="hover:text-[#2870ED] transition-colors">
            Domain API
          </Link>
          <Link href="/api-docs/mcp" className="hover:text-[#2870ED] transition-colors">
            MCP Server
          </Link>
          <Link href="/pricing" className="hover:text-[#2870ED] transition-colors">
            Pricing
          </Link>
        </div>
      </div>

      {/* ===================== MODAL: CREATE API KEY ===================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#E1E6EB] relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              ✕
            </button>

            <form onSubmit={handleCreateKey} className="space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2870ED] flex items-center justify-center font-bold text-sm">
                  🔑
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#171B24]">Generate New API Key</h3>
                  <p className="text-xs text-[#5B6370]">Provide an identifier for this key</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Key Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staging Server, Zapier Automation"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-[#2870ED]"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800">
                Keep your API key confidential. Never expose it in client-side code or public repositories.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white font-semibold rounded-lg text-xs cursor-pointer"
                >
                  Create Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: UPGRADE / ADD-ON ===================== */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#E1E6EB] relative">
            <button
              onClick={() => setIsUpgradeModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              ✕
            </button>
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#171B24]">
                {upgradeType === 'addon' ? 'Get API Add-on' : 'Get API Standalone'}
              </h3>
              <p className="text-xs text-[#5B6370]">
                {upgradeType === 'addon'
                  ? 'Add 1,000,000 extra Data API credits to your existing SE Ranking subscription starting at $99/mo.'
                  : 'Get standalone high-throughput REST API & MCP endpoints without platform seats starting at $499/mo.'}
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-900 space-y-1">
                <div className="font-bold">Includes:</div>
                <ul className="list-disc list-inside text-[11px] space-y-0.5 text-blue-800">
                  <li>3B+ Keyword Database access</li>
                  <li>3.2T Backlink index</li>
                  <li>99.9% uptime SLA</li>
                </ul>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsUpgradeModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg"
                >
                  Close
                </button>
                <Link
                  href="/pricing"
                  className="px-5 py-2 bg-[#2870ED] hover:bg-[#1C60DB] text-white text-xs font-semibold rounded-lg inline-flex items-center"
                >
                  View Plans &amp; Subscribe
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: TOP UP WALLET ===================== */}
      {isTopUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#E1E6EB] relative">
            <button
              onClick={() => setIsTopUpModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              ✕
            </button>
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#171B24]">Top Up API Wallet</h3>
              <p className="text-xs text-[#5B6370]">
                Add funds to your prepaid balance. Credits are deducted per API call based on endpoint rates.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {['$50', '$200', '$500'].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => {
                      alert(`Selected ${amt} top up`);
                      setIsTopUpModalOpen(false);
                    }}
                    className="p-3 border border-[#E1E6EB] hover:border-[#2870ED] rounded-[8px] text-center font-bold text-sm text-[#171B24] hover:bg-blue-50/50 cursor-pointer"
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== MODAL: CONTACT US ===================== */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-[#E1E6EB] relative">
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
            >
              ✕
            </button>
            <div className="space-y-4">
              <h3 className="text-base font-bold text-[#171B24]">Enterprise Custom API Plans</h3>
              <p className="text-xs text-[#5B6370]">
                Looking for 10M+ credits/month, dedicated bandwidth, or custom data feeds? Contact our solution architects.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs space-y-1">
                <div>Email: <b>api-sales@seranking.com</b></div>
                <div>Average response time: <b>Under 15 minutes</b></div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-5 py-2 bg-[#2870ED] text-white rounded-lg text-xs font-semibold"
                >
                  Got It
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
