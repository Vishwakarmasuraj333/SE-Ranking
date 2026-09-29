'use client';

import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface CalendarYearDropdownProps {
  year: number;
  onSelectYear: (year: number) => void;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  ariaLabel?: string;
  startYear?: number;
  endYear?: number;
}

export function CalendarYearDropdown({
  year,
  onSelectYear,
  isOpen,
  onToggle,
  onClose,
  ariaLabel = 'Select year',
  startYear = 2020,
  endYear = 2030,
}: CalendarYearDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  const years: number[] = [];
  for (let y = startYear; y <= endYear; y++) {
    years.push(y);
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={onToggle}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className="flex items-center gap-1 font-bold text-xs text-slate-800 dark:text-slate-200 hover:text-blue-600 transition cursor-pointer select-none"
      >
        <span>{year}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 top-full mt-1 w-24 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl py-1 z-50 text-xs"
        >
          {years.map((y) => (
            <button
              key={y}
              type="button"
              role="option"
              aria-selected={y === year}
              onClick={() => {
                onSelectYear(y);
                onClose();
              }}
              className={`w-full px-3 py-1.5 text-left transition cursor-pointer ${
                y === year
                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
