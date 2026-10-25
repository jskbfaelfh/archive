// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file ScheduleZoomModal.tsx
 * @description نافذة معاينة وتكبير الجدول الأسبوعي بالحجم الكامل
 * @created 2026-10-21
 */
import React from 'react';
import { Schedule } from '@/types';
import { X, Download, UserCheck, GraduationCap } from 'lucide-react';

interface Props {
  schedule: Schedule;
  onClose: () => void;
}

export default function ScheduleZoomModal({ schedule, onClose }: Props) {
  const isDoctorSchedule = schedule.targetType === 'doctor';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-[10px] max-w-5xl w-full p-4 sm:p-6 space-y-4 shadow-2xl overflow-hidden max-h-[94vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3.5 border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              {isDoctorSchedule ? (
                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-900 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>جدول التدريسي: {schedule.doctorName}</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-[11px] font-black bg-cyan-100 text-cyan-900 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>المرحلة {schedule.stage} • {schedule.sectionName}</span>
                </span>
              )}
            </div>
            <h3 className="text-sm font-black text-slate-900 mt-1">{schedule.title}</h3>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <a
              href={schedule.imageUrl}
              download={`${schedule.title}.svg`}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-cyan-600" />
              <span>تحميل الجدول كصورة</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Big Preview Area */}
        <div className="flex-1 overflow-auto bg-slate-50 rounded-2xl p-3 flex items-center justify-center min-h-[350px]">
          <img
            src={schedule.imageUrl}
            alt={schedule.title}
            className="max-w-full max-h-[65vh] object-contain rounded-xl shadow-xs"
          />
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
