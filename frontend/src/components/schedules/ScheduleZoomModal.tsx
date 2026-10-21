// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file ScheduleZoomModal.tsx
 * @description نافذة معاينة الجدول اليومي بالحجم الكامل مع تبديل الأيام والتحميل
 * @created 2026-10-21
 */
import React from 'react';
import { Schedule, DayKey, WEEK_DAYS } from '@/types';
import { X, Download, Calendar, FileQuestion } from 'lucide-react';

interface Props {
  schedule: Schedule;
  activeDay: DayKey;
  onSelectDay: (day: DayKey) => void;
  onClose: () => void;
}

export default function ScheduleZoomModal({
  schedule,
  activeDay,
  onSelectDay,
  onClose,
}: Props) {
  const currentImage = schedule.dailyImages?.[activeDay] || schedule.imageUrl;
  const activeDayLabel = WEEK_DAYS.find(d => d.key === activeDay)?.label || 'اليوم';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-4 sm:p-6 space-y-4 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-cyan-100 text-cyan-900">
                المرحلة {schedule.stage} • {schedule.sectionName}
              </span>
              <span className="text-xs font-black text-slate-800">
                جدول يوم {activeDayLabel}
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900 mt-1">{schedule.title}</h3>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {currentImage && (
              <a
                href={currentImage}
                download={`${schedule.title} - يوم ${activeDayLabel}.svg`}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-cyan-600" />
                <span>تحميل صورة يوم {activeDayLabel}</span>
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Day Switcher Inside Modal */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl overflow-x-auto">
          {WEEK_DAYS.map(d => {
            const isSelected = activeDay === d.key;
            const hasImg = Boolean(schedule.dailyImages?.[d.key] || schedule.imageUrl);
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => onSelectDay(d.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#041633] text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white/80'
                }`}
              >
                <Calendar className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span>{d.label}</span>
                {!hasImg && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
              </button>
            );
          })}
        </div>

        {/* Big Preview Area */}
        <div className="flex-1 overflow-auto bg-slate-50 rounded-2xl p-3 flex items-center justify-center min-h-[300px]">
          {currentImage ? (
            <img
              src={currentImage}
              alt={`${schedule.title} - ${activeDayLabel}`}
              className="max-w-full max-h-[60vh] object-contain rounded-xl shadow-xs"
            />
          ) : (
            <div className="text-center p-8">
              <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">
                لم يتم إدراج صورة جدول ليوم {activeDayLabel} بعد.
              </p>
            </div>
          )}
        </div>

        {/* Footer Notes */}
        {schedule.notes && (
          <p className="text-xs text-slate-500 font-semibold bg-slate-50 p-3 rounded-xl border border-slate-100">
            {schedule.notes}
          </p>
        )}
      </div>
    </div>
  );
}
