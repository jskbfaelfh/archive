// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file SelectMenuPortal.tsx
 * @description Smart floating dropdown menu portal rendered into document.body with adaptive search and seamless radius fusion.
 * @created 2026-10-21
 * @modified 2026-10-21
 */
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectMenuPortalProps {
  isOpen: boolean;
  onClose: () => void;
  options: SelectOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
  triggerRect: DOMRect | null;
}

export default function SelectMenuPortal({
  isOpen,
  onClose,
  options,
  selectedValue,
  onSelect,
  triggerRect,
}: SelectMenuPortalProps) {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      // Autofocus search if threshold > 10
      if (options.length > 10) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
  }, [isOpen, options.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen || !triggerRect) return null;

  const showSearch = options.length > 10;
  const filteredOptions = showSearch && searchQuery.trim()
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        opt.value.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        opt.description?.toLowerCase().includes(searchQuery.toLowerCase().trim())
      )
    : options;

  // Calculate position: default downward
  const top = triggerRect.bottom;
  const left = triggerRect.left;
  const width = triggerRect.width;

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        zIndex: 99999,
      }}
      className="bg-white rounded-t-none rounded-b-[7px] shadow-2xl border-none max-h-64 overflow-hidden flex flex-col text-right text-[13px] animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Sticky Search Header if options > 10 */}
      {showSearch && (
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 p-1.5 flex items-center relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث فوري..."
            className="w-full text-[13px] pr-8 pl-2 py-1.5 rounded-[5px] bg-slate-50 border border-slate-200 focus:outline-none focus:border-sky-500 font-medium"
          />
        </div>
      )}

      {/* Options List */}
      <div className="overflow-y-auto max-h-56 divide-y divide-slate-50">
        {filteredOptions.length === 0 ? (
          <div className="text-[13px] text-slate-400 text-center py-4">
            لا توجد نتائج مطابقة
          </div>
        ) : (
          filteredOptions.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onSelect(opt.value);
                  onClose();
                }}
                className={`w-full px-3 py-2 flex items-center justify-between text-right text-[13px] cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-sky-50 text-sky-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 font-medium'
                }`}
              >
                <div>
                  <div>{opt.label}</div>
                  {opt.description && (
                    <div className="text-[11px] text-slate-400 font-normal">{opt.description}</div>
                  )}
                </div>
                {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
              </button>
            );
          })
        )}
      </div>
    </div>,
    document.body
  );
}
