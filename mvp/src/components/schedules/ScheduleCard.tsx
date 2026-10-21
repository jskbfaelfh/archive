// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file ScheduleCard.tsx
 * @description بطاقة جدول المحاضرات مع فلتر الأيام واستعراض الصور اليومية
 * @created 2026-10-21
 */
import React, { useState } from 'react';
import { Schedule, DayKey, WEEK_DAYS } from '@/types';
import { Eye, Download, Trash2, Calendar, FileQuestion, UploadCloud } from 'lucide-react';
import ScheduleDayFilter from './ScheduleDayFilter';

interface Props {
  schedule: Schedule;
  canManage: boolean;
  activeGlobalDay?: DayKey;
  deptName?: string;
  onDelete: (id: string) => void;
  onZoom: (schedule: Schedule, day: DayKey) => void;
}

export default function ScheduleCard({
  schedule,
  canManage,
  activeGlobalDay,
  deptName,
  onDelete,
  onZoom,
}: Props) {
  const [localDay, setLocalDay] = useState<DayKey>(activeGlobalDay || 'saturday');

  const currentDay = activeGlobalDay || localDay;
  const currentImage = schedule.dailyImages?.[currentDay] || schedule.imageUrl;
  const currentDayLabel = WEEK_DAYS.find(d => d.key === currentDay)?.label || 'اليوم';

  const dayAvailability: Partial<Record<DayKey, boolean>> = {};
  WEEK_DAYS.forEach(d => {
    dayAvailability[d.key] = Boolean(schedule.dailyImages?.[d.key] || schedule.imageUrl);
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-black bg-cyan-100 text-cyan-900">
              المرحلة {schedule.stage} • {schedule.sectionName}
            </span>
          </div>

          {canManage && (
            <button
              onClick={() => onDelete(schedule.id)}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
              title="حذف الجدول"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Days Filter Pills Bar */}
        <div className="p-3.5 bg-white border-b border-slate-100 flex items-center justify-between gap-2 overflow-x-auto">
          <ScheduleDayFilter
            selectedDay={currentDay}
            onSelectDay={setLocalDay}
            dayAvailability={dayAvailability}
            size="sm"
          />
        </div>

        {/* Schedule Daily Image Preview */}
        <div
          onClick={() => onZoom(schedule, currentDay)}
          className="relative bg-slate-100/70 p-3 cursor-pointer group border-b border-slate-100 min-h-[220px] flex items-center justify-center"
        >
          {currentImage ? (
            <>
              <img
                src={currentImage}
                alt={`${schedule.title} - ${currentDayLabel}`}
                className="w-full h-52 object-contain bg-white rounded-xl shadow-xs group-hover:scale-[1.01] transition-transform"
              />
              <div className="absolute inset-0 bg-[#041633]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-xs rounded-xl">
                <span className="px-4 py-2 rounded-xl bg-white text-[#041633] text-xs font-black flex items-center gap-2 shadow-lg">
                  <Eye className="w-4 h-4 text-cyan-600" />
                  <span>تكبير جدول يوم {currentDayLabel}</span>
                </span>
              </div>
            </>
          ) : (
            <div className="text-center p-6">
              <FileQuestion className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">
                لم يتم إرفاق صورة جدول ليوم {currentDayLabel}
              </p>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-black text-slate-900 text-sm">{schedule.title}</h4>
            <span className="text-[11px] font-black text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">
              يوم {currentDayLabel}
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            {schedule.notes || 'الدوام يبدأ من السبت إلى الأربعاء وفق التوقيتات المعتمدة.'}
          </p>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 font-semibold">
            <span>{deptName || 'القسم العلمي'}</span>
            <span className="text-[11px] text-slate-400">{schedule.createdByName}</span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 pt-0 flex items-center justify-end gap-2">
        {currentImage && (
          <a
            href={currentImage}
            download={`${schedule.title} - يوم ${currentDayLabel}.svg`}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
          >
            <Download className="w-4 h-4 text-cyan-600" />
            <span>تحميل (يوم {currentDayLabel})</span>
          </a>
        )}
        <button
          onClick={() => onZoom(schedule, currentDay)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#041633] hover:bg-[#0c2b64] text-white text-xs font-bold transition-all shadow-sm"
        >
          <Eye className="w-4 h-4 text-cyan-300" />
          <span>معاينة الجدول</span>
        </button>
      </div>
    </div>
  );
}
