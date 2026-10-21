// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file ScheduleCard.tsx
 * @description بطاقة الجدول الأسبوعي للطلاب أو الأستاذ التدريسي
 * @created 2026-10-21
 */
import React from 'react';
import { Schedule } from '@/types';
import { Eye, Download, Trash2, UserCheck, GraduationCap } from 'lucide-react';

interface Props {
  schedule: Schedule;
  canManage: boolean;
  deptName?: string;
  onDelete: (id: string) => void;
  onZoom: (schedule: Schedule) => void;
}

export default function ScheduleCard({
  schedule,
  canManage,
  deptName,
  onDelete,
  onZoom,
}: Props) {
  const isDoctorSchedule = schedule.targetType === 'doctor';

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isDoctorSchedule ? (
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-indigo-100 text-indigo-900 flex items-center gap-1.5 border border-indigo-200">
                <UserCheck className="w-3.5 h-3.5 text-indigo-700" />
                <span>جدول التدريسي: {schedule.doctorName}</span>
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-[11px] font-black bg-cyan-100 text-cyan-900 flex items-center gap-1.5 border border-cyan-200">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-700" />
                <span>المرحلة {schedule.stage} • {schedule.sectionName}</span>
              </span>
            )}
            <span className="text-[10px] font-extrabold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200">
              جدول أسبوعي شامل
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

        {/* Schedule Image Preview */}
        <div
          onClick={() => onZoom(schedule)}
          className="relative bg-slate-100/70 p-3 cursor-pointer group border-b border-slate-100 min-h-[220px] flex items-center justify-center"
        >
          <img
            src={schedule.imageUrl}
            alt={schedule.title}
            className="w-full h-56 object-contain bg-white rounded-2xl shadow-xs group-hover:scale-[1.01] transition-transform"
          />
          <div className="absolute inset-0 bg-[#041633]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-xs rounded-2xl">
            <span className="px-4 py-2 rounded-xl bg-white text-[#041633] text-xs font-black flex items-center gap-2 shadow-lg">
              <Eye className="w-4 h-4 text-cyan-600" />
              <span>تكبير الجدول الأسبوعي</span>
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-4 space-y-2">
          <h4 className="font-black text-slate-900 text-sm leading-snug">{schedule.title}</h4>

          <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            {schedule.notes || 'الجدول المعتمد وفق التوقيتات والقاعات الدراسية المحددة.'}
          </p>

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1 font-semibold">
            <span>{deptName || 'القسم العلمي'}</span>
            <span className="text-[11px] text-slate-400">{schedule.createdByName}</span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 pt-0 flex items-center justify-end gap-2">
        <a
          href={schedule.imageUrl}
          download={`${schedule.title}.svg`}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
        >
          <Download className="w-4 h-4 text-cyan-600" />
          <span>تحميل الجدول</span>
        </a>
        <button
          onClick={() => onZoom(schedule)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#041633] hover:bg-[#0c2b64] text-white text-xs font-bold transition-all shadow-sm"
        >
          <Eye className="w-4 h-4 text-cyan-300" />
          <span>معاينة ملء الشاشة</span>
        </button>
      </div>
    </div>
  );
}
