'use client';

import React, { useState } from 'react';
import { X, Calendar, Info } from 'lucide-react';

export interface NotePayload {
  id: string;
  title: string;
  shortDesc: string;
  fullDesc: string;
  date: string;
  category: string;
  type: 'PROJECT NOTE' | 'KEYWORD NOTE';
  url?: string;
  keyword?: string;
}

interface CreateNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveNote: (note: NotePayload) => void;
  availableKeywords?: string[];
  initialType?: 'PROJECT NOTE' | 'KEYWORD NOTE';
  initialKeyword?: string;
}

export function CreateNoteModal({
  isOpen,
  onClose,
  onSaveNote,
  availableKeywords = [
    'employee monitoring software',
    'work time tracker',
    'remote employee tracking software',
    'automatic screenshot monitoring tool',
    'desktop activity tracker',
    'remote team productivity tool',
    'time tracking software with screenshots',
    'staff attendance tracker',
  ],
  initialType = 'PROJECT NOTE',
  initialKeyword = '',
}: CreateNoteModalProps) {
  const [noteType, setNoteType] = useState<'PROJECT NOTE' | 'KEYWORD NOTE'>(initialType);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [noteDate, setNoteDate] = useState('30 Sep 2026');
  const [selectedKeyword, setSelectedKeyword] = useState(
    initialKeyword || availableKeywords[0] || 'employee monitoring software'
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteText.trim()) return;

    const title = noteTitle.trim() || (noteText.length > 45 ? noteText.slice(0, 45) + '...' : noteText);
    const full = noteText.trim() || noteTitle.trim();
    const short = full.length > 180 ? full.slice(0, 180) + '...' : full;

    const payload: NotePayload = {
      id: `note-${Date.now()}`,
      title,
      shortDesc: short,
      fullDesc: full,
      date: noteDate,
      category: noteType === 'PROJECT NOTE' ? 'Website changes' : `Keyword: ${selectedKeyword}`,
      type: noteType,
      url: externalUrl.trim() || undefined,
      keyword: noteType === 'KEYWORD NOTE' ? selectedKeyword : undefined,
    };

    onSaveNote(payload);
    // Reset form
    setNoteTitle('');
    setNoteText('');
    setExternalUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 text-gray-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3">
          <h2 className="text-lg font-bold text-gray-900 tracking-tight">Create a note</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Segmented Tab Bar (Exact match to screenshot: PROJECT NOTE / KEYWORD NOTE) */}
          <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden text-xs font-bold uppercase tracking-wider">
            <button
              type="button"
              onClick={() => setNoteType('PROJECT NOTE')}
              className={`px-5 py-2.5 transition-colors cursor-pointer ${
                noteType === 'PROJECT NOTE'
                  ? 'bg-[#524B76] text-white shadow-inner'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              PROJECT NOTE
            </button>
            <button
              type="button"
              onClick={() => setNoteType('KEYWORD NOTE')}
              className={`px-5 py-2.5 transition-colors border-l border-gray-300 cursor-pointer ${
                noteType === 'KEYWORD NOTE'
                  ? 'bg-[#524B76] text-white shadow-inner'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              KEYWORD NOTE
            </button>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-3.5">
            {/* If Keyword Note, show target keyword selector */}
            {noteType === 'KEYWORD NOTE' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Target keyword:
                </label>
                <select
                  value={selectedKeyword}
                  onChange={(e) => setSelectedKeyword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 bg-white focus:outline-none focus:border-[#524B76] focus:ring-1 focus:ring-[#524B76]"
                >
                  {availableKeywords.map((kw) => (
                    <option key={kw} value={kw}>
                      {kw}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Note title */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Note title:
              </label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Enter title"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#524B76] focus:ring-1 focus:ring-[#524B76]"
                autoFocus
              />
            </div>

            {/* Note text */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Note text:
              </label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add text..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#524B76] focus:ring-1 focus:ring-[#524B76] resize-y"
              />
            </div>

            {/* Two-column Row: External URL and Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  External URL:
                </label>
                <input
                  type="text"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="e.g. https://www.example.org/angle/bath"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#524B76] focus:ring-1 focus:ring-[#524B76]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Date:
                </label>
                <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:border-[#524B76] focus-within:ring-1 focus-within:ring-[#524B76]">
                  <Calendar className="w-4 h-4 text-gray-600 shrink-0" />
                  <input
                    type="text"
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                    className="w-full bg-transparent text-xs font-medium text-gray-900 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Info tooltip notice matching screenshot */}
            <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1">
              <Info className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>This note will appear on the &quot;Detailed&quot; chart.</span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="border-t border-gray-100 pt-4 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!noteTitle.trim() && !noteText.trim()}
              className="px-5 py-2 bg-[#0B69FF] hover:bg-[#005FE0] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
            >
              Create note
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
