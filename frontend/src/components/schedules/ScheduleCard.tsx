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
    <div className="bg-white rounded-[10px] sm:rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
            {isDoctorSchedule ? (
              <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-indigo-100 text-indigo-900 flex items-center gap-1 sm:gap-1.5 border border-indigo-200 truncate">
                <UserCheck className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
                <span className="hidden sm:inline">جدول التدريسي: {schedule.doctorName}</span>
                <span className="sm:hidden truncate">{schedule.doctorName}</span>
              </span>
            ) : (
              <span className="px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-black bg-cyan-100 text-cyan-900 flex items-center gap-1 sm:gap-1.5 border border-cyan-200 truncate">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-700 shrink-0" />
                <span className="hidden sm:inline">المرحلة {schedule.stage} • {schedule.sectionName}</span>
                <span className="sm:hidden truncate">م{schedule.stage} {schedule.sectionName ? `• ${schedule.sectionName.length > 12 ? 'كافة الشعب' : schedule.sectionName}` : ''}</span>
              </span>
            )}
            <span className="hidden sm:inline text-[10px] font-extrabold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shrink-0">
              جدول أسبوعي شامل
            </span>
            <span className="sm:hidden text-[9px] font-extrabold text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 shrink-0">
              أسبوعي
            </span>
          </div>

          {canManage && (
            <button
              onClick={() => onDelete(schedule.id)}
              className="p-1.5 rounded-[7px] sm:rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors shrink-0 cursor-pointer"
              title="حذف"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Schedule Image Preview */}
        <div
          onClick={() => onZoom(schedule)}
          className="relative bg-slate-100/70 p-2 sm:p-3 cursor-pointer group border-b border-slate-100 min-h-[180px] sm:min-h-[220px] flex items-center justify-center"
        >
          <img
            src={schedule.imageUrl}
            alt={schedule.title}
            className="w-full h-44 sm:h-56 object-contain bg-white rounded-xl sm:rounded-2xl shadow-xs group-hover:scale-[1.01] transition-transform"
          />
          <div className="absolute inset-0 bg-[#041633]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-xs rounded-xl sm:rounded-2xl">
            <span className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-[7px] sm:rounded-xl bg-white text-[#041633] text-xs font-black flex items-center gap-1.5 sm:gap-2 shadow-lg">
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600" />
              <span className="hidden sm:inline">تكبير الجدول الأسبوعي</span>
              <span className="sm:hidden">تكبير</span>
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 sm:p-4 space-y-2">
          <h4 className="font-black text-slate-900 text-xs sm:text-sm leading-snug line-clamp-2">{schedule.title}</h4>

          <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-2 sm:p-2.5 rounded-[7px] sm:rounded-xl border border-slate-100">
            {schedule.notes || 'الجدول المعتمد وفق التوقيتات والقاعات الدراسية المحددة.'}
          </p>

          <div className="flex flex-wrap items-center justify-between text-[11px] sm:text-xs text-slate-500 pt-0.5 sm:pt-1 font-semibold">
            <span className="truncate max-w-[150px]">{deptName || 'القسم العلمي'}</span>
            <span className="text-[10px] sm:text-[11px] text-slate-400 truncate max-w-[120px]">{schedule.createdByName}</span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-3 sm:p-4 pt-0 flex items-center justify-end gap-2">
        <a
          href={schedule.imageUrl}
          download={`${schedule.title}.svg`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 sm:px-3 rounded-[7px] sm:rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all border border-slate-200 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-600 shrink-0" />
          <span className="hidden sm:inline">تحميل الجدول</span>
          <span className="sm:hidden">تحميل</span>
        </a>
        <button
          onClick={() => onZoom(schedule)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-2 sm:px-3 rounded-[7px] sm:rounded-xl bg-[#041633] hover:bg-[#0c2b64] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 shrink-0" />
          <span className="hidden sm:inline">معاينة ملء الشاشة</span>
          <span className="sm:hidden">معاينة</span>
        </button>
      </div>
    </div>
  );
}
