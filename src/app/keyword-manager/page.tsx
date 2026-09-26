'use client';

import React, { useState } from 'react';
import { Plus, X, ListFilter, Trash2, Tag } from 'lucide-react';

interface KeywordList {
  id: string;
  name: string;
  keywordsCount: number;
  createdAt: string;
}

export default function KeywordManagerPage() {
  const [lists, setLists] = useState<KeywordList[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [listName, setListName] = useState('');
  const [includeKeywords, setIncludeKeywords] = useState(false);

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listName.trim()) return;

    const newList: KeywordList = {
      id: `list_${Date.now()}`,
      name: listName.trim(),
      keywordsCount: 0,
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    setLists((prev) => [newList, ...prev]);
    setListName('');
    setIncludeKeywords(false);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="flex-1 bg-white min-h-[calc(100vh-80px)] flex flex-col justify-between text-gray-900 select-none">
      {lists.length === 0 ? (
        /* Empty State / Start view matching Screenshot 7 */
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
          {/* Illustration Container */}
          <div className="w-52 h-40 mb-6 flex items-center justify-center">
            <svg viewBox="0 0 200 150" className="w-full h-full">
              <defs>
                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E0ECFF" />
                  <stop offset="100%" stopColor="#C4DDFF" />
                </linearGradient>
              </defs>
              {/* Isometric Board */}
              <polygon points="100,20 180,65 100,110 20,65" fill="url(#grad1)" stroke="#B3D1FF" strokeWidth="2" />
              <polygon points="20,65 100,110 100,125 20,80" fill="#99C2FF" />
              <polygon points="180,65 100,110 100,125 180,80" fill="#7FAEFF" />
              {/* Graph lines */}
              <polyline points="40,65 80,50 110,75 150,45" fill="none" stroke="#FF5E7E" strokeWidth="3" strokeLinecap="round" />
              {/* Figure */}
              <circle cx="80" cy="95" r="8" fill="#FF8A65" />
              <path d="M75,105 Q80,125 85,105" fill="#E53935" />
            </svg>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">Keyword Manager</h2>
          <p className="text-xs text-gray-500 mb-8 max-w-md">
            Create and manage keyword lists to monitor rankings and other data
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-[#00A86B] hover:bg-[#008f5a] text-white rounded text-xs font-bold transition-colors uppercase tracking-wider shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>CREATE A NEW LIST</span>
          </button>
        </div>
      ) : (
        /* Populated lists view */
        <div className="max-w-[1200px] w-full mx-auto p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Keyword Manager</h2>
              <p className="text-xs text-gray-500">{lists.length} keyword lists active</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#00A86B] hover:bg-[#008f5a] text-white rounded text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>CREATE A NEW LIST</span>
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs divide-y divide-gray-200">
              <thead className="bg-[#FAFBFD] font-bold text-gray-600">
                <tr>
                  <th className="p-3">LIST NAME</th>
                  <th className="p-3">KEYWORDS COUNT</th>
                  <th className="p-3">CREATED AT</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lists.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="p-3 font-semibold text-gray-900 flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-blue-600" />
                      <span>{l.name}</span>
                    </td>
                    <td className="p-3 text-gray-600">{l.keywordsCount}</td>
                    <td className="p-3 text-gray-500">{l.createdAt}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDelete(l.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal matching Screenshot 8 exact dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden text-gray-900">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">New list</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateList} className="p-6 space-y-4 text-xs">
              <p className="text-gray-500 text-xs">Please create a new list</p>

              <div>
                <label className="block font-semibold text-gray-700 mb-1.5">Name:</label>
                <input
                  type="text"
                  required
                  value={listName}
                  onChange={(e) => setListName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full px-3 py-2 border border-blue-400 rounded-md text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
                  autoFocus
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="listKeywords"
                  checked={includeKeywords}
                  onChange={(e) => setIncludeKeywords(e.target.checked)}
                  className="rounded text-[#0B69FF] focus:ring-0"
                />
                <label htmlFor="listKeywords" className="text-gray-700 cursor-pointer">
                  List keywords <span className="text-gray-400">ℹ</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-bold text-gray-700 hover:bg-gray-100 rounded uppercase tracking-wider text-[11px]"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!listName.trim()}
                  className="px-5 py-2 font-bold text-white bg-[#0B69FF] hover:bg-[#005FE0] rounded transition-colors uppercase tracking-wider text-[11px] disabled:opacity-40"
                >
                  CREATE LIST
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-3 px-6 text-xs text-gray-500 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#0B69FF]">
            <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
          </svg>
          <span>SE Ranking</span>
        </div>
        <div className="flex items-center gap-5">
          <button className="hover:underline text-gray-600">Report a bug</button>
          <a href="https://seranking.com/affiliate.html" target="_blank" rel="noreferrer" className="hover:underline text-gray-600">Affiliates</a>
          <a href="/api-docs" className="hover:underline text-gray-600">API</a>
          <a href="https://seranking.com/whats-new.html" target="_blank" rel="noreferrer" className="hover:underline text-gray-600">What&apos;s new</a>
          <a href="https://help.seranking.com" target="_blank" rel="noreferrer" className="hover:underline text-gray-600">Help</a>
        </div>
      </footer>
    </div>
  );
}
