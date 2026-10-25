// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file PhoneInput.tsx
 * @description حقل إدخال رقم الهاتف العراقي الموحد ببادئة ثابتة (+964) وتدقيق فوري
 * @created 2026-10-25
 * @modified 2026-10-25
 */
import React from 'react';
import { sanitizePhoneNumber, getPhoneMaxDigits, isPhoneNumberComplete } from '@/utils/phoneValidation';

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function PhoneInput({
  value,
  onChange,
  label = 'رقم الهاتف',
  placeholder = '7XXXXXXXXX أو 07XXXXXXXXX',
  required = false,
  disabled = false,
  className = '',
}: PhoneInputProps) {
  const cleanValue = sanitizePhoneNumber(value);
  const maxDigits = getPhoneMaxDigits(cleanValue);
  const isComplete = isPhoneNumberComplete(cleanValue);

  // Dynamic start border according to Rule 29 & Rule 44
  let borderClass = 'border-slate-300';
  if (required) {
    borderClass = isComplete
      ? 'border-s-[3px] border-s-emerald-500'
      : 'border-s-[3px] border-s-rose-500';
  } else if (cleanValue.length > 0) {
    borderClass = isComplete
      ? 'border-s-[3px] border-s-emerald-500'
      : 'border-s-[3px] border-s-rose-500';
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation keys, delete, backspace, tab, enter
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Home', 'End'];
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
      return;
    }
    // Only allow digits 0-9
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      return;
    }
    // Block if max reached and not selected text
    const target = e.currentTarget;
    const hasSelection = (target.selectionEnd ?? 0) - (target.selectionStart ?? 0) > 0;
    if (!hasSelection && cleanValue.length >= maxDigits) {
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = sanitizePhoneNumber(e.target.value);
    onChange(sanitized);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const sanitized = sanitizePhoneNumber(pasted);
    onChange(sanitized);
  };

  return (
    <div className={`space-y-1.5 text-right ${className}`}>
      {label && (
        <label className="block text-[13px] font-bold text-slate-800">
          {label}
        </label>
      )}

      <div className="relative flex items-center w-full">
        {/* Fixed Iraq Country Prefix pinned strictly to the far left */}
        <div
          dir="ltr"
          className="absolute left-0 top-0 bottom-0 px-3 flex items-center justify-center bg-slate-100 text-slate-700 font-mono font-bold text-[13px] border-r border-slate-300 rounded-s-[7px] select-none pointer-events-none z-10"
        >
          <span>+964</span>
        </div>

        {/* Digits Input Field */}
        <input
          type="tel"
          inputMode="numeric"
          dir="ltr"
          value={cleanValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxDigits}
          className={`w-full text-[13px] font-mono font-bold text-slate-900 placeholder:text-slate-400 p-2.5 pl-20 pr-3 rounded-[7px] bg-white border ${borderClass} focus:border-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all shadow-2xs ${
            disabled ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'hover:border-slate-400'
          }`}
        />
      </div>

      {cleanValue.length > 0 && !isComplete && (
        <p className="text-[11px] font-bold text-rose-500 mt-1">
          {cleanValue.startsWith('0')
            ? `يرجى إكمال 11 رقماً (المكتمل: ${cleanValue.length}/11)`
            : `يرجى إكمال 10 أرقام (المكتمل: ${cleanValue.length}/10)`}
        </p>
      )}
    </div>
  );
}
