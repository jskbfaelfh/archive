// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file ScheduleDayFilter.tsx
 * @description شريط فلترة الأيام (السبت - الأربعاء) لجداول المحاضرات
 * @created 2026-10-21
 */
import React from 'react';
import { DayKey, WEEK_DAYS } from '@/types';
import { Calendar } from 'lucide-react';

interface Props {
  selectedDay: DayKey;
  onSelectDay: (day: DayKey) => void;
  dayAvailability?: Partial<Record<DayKey, boolean>>;
  size?: 'sm' | 'md';
}

export default function ScheduleDayFilter({
  selectedDay,
  onSelectDay,
  dayAvailability,
  size = 'md',
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
      {WEEK_DAYS.map(d => {
        const isSelected = selectedDay === d.key;
        const hasSchedule = dayAvailability ? dayAvailability[d.key] : true;

        return (
          <button
            key={d.key}
            type="button"
            onClick={() => onSelectDay(d.key)}
            className={`flex items-center gap-1.5 rounded-xl font-black transition-all ${
              size === 'sm' ? 'px-3 py-1.5 text-[11px]' : 'px-4 py-2 text-xs'
            } ${
              isSelected
                ? 'bg-[#041633] text-white shadow-md shadow-slate-900/15'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Calendar
              className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${
                isSelected ? 'text-cyan-300' : 'text-slate-400'
              }`}
            />
            <span>يوم {d.label}</span>
            {hasSchedule === false && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="لم يرفع بعد" />
            )}
          </button>
        );
      })}
    </div>
  );
}
