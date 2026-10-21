// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file Select.tsx
 * @description Centralized Smart Searchable Dropdown with dynamic start-border and portal overlay.
 * @created 2026-10-21
 * @modified 2026-10-21
 */
'use client';

import React, { useState, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import SelectMenuPortal, { SelectOption } from './SelectMenuPortal';

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'اختر...',
  required = false,
  disabled = false,
  className = '',
  label,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen && triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
    }
    setIsOpen((prev) => !prev);
  };

  // Rule 29: Dynamic start border (3px red if required and empty, 3px green if valid)
  const isFilled = Boolean(value);
  const borderStatusClass = required
    ? isFilled
      ? 'border-s-[3px] border-s-emerald-500'
      : 'border-s-[3px] border-s-rose-500'
    : '';

  // Rule 30 & 32: Seamless Radius Fusion with dropdown list
  const radiusClass = isOpen
    ? 'rounded-t-[7px] rounded-b-none border-b-transparent'
    : 'rounded-[7px]';

  return (
    <div className={`relative w-full ${className}`}>
      {label && (
        <label className="block text-[13px] font-bold text-slate-800 mb-1.5 text-right">
          {label}
        </label>
      )}

      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={toggleDropdown}
        className={`w-full text-[13px] font-medium text-slate-800 bg-white border border-slate-300 p-2.5 flex items-center justify-between cursor-pointer transition-all shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500/25 ${borderStatusClass} ${radiusClass} ${
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:border-slate-400'
        }`}
      >
        <span className={selectedOption ? 'text-slate-900 font-bold' : 'text-slate-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-sky-600' : ''
          }`}
        />
      </button>

      <SelectMenuPortal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        options={options}
        selectedValue={value}
        onSelect={onChange}
        triggerRect={triggerRect}
      />
    </div>
  );
}
