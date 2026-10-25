// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file AnalyticsTopLectures.tsx
 * @description قائمة المحاضرات الأكثر تفاعلاً وتحميلاً في النطاق المحدد
 * @created 2026-10-24
 */
import React from 'react';
import { TrendingUp, Download, Eye } from 'lucide-react';
import { Lecture } from '@/types';

interface AnalyticsTopLecturesProps {
  lectures: Lecture[];
}

export default function AnalyticsTopLectures({ lectures }: AnalyticsTopLecturesProps) {
  return (
    <div className="bg-white p-3.5 sm:p-5 rounded-[10px] sm:rounded-2xl border border-slate-200 shadow-2xs space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 sm:pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-600 shrink-0" />
          <h3 className="font-bold text-xs sm:text-sm text-slate-900">
            <span className="hidden sm:inline">المحاضرات الأكثر تفاعلاً</span>
            <span className="sm:hidden">الأكثر تفاعلاً</span>
          </h3>
        </div>
        <span className="text-[10px] sm:text-[11px] text-slate-400 font-bold">
          <span className="hidden sm:inline">حسب التحميل</span>
          <span className="sm:hidden">التحميل</span>
        </span>
      </div>

      <div className="space-y-2">
        {lectures.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 font-bold">لا توجد محاضرات في هذا النطاق بعد</p>
        ) : (
          lectures.map((item, idx) => (
            <div
              key={item.id}
              className="p-2.5 sm:p-3 bg-slate-50 hover:bg-slate-100/80 rounded-[7px] sm:rounded-xl flex items-center justify-between text-xs transition-all gap-2"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="w-5 h-5 rounded-[5px] bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[10px] sm:text-[11px] shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <span className="font-bold text-slate-900 block truncate">{item.title}</span>
                  <span className="text-[10px] text-slate-500 block truncate">
                    {item.subjectName} • {item.doctorName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-600 font-mono text-[10px] sm:text-[11px] shrink-0">
                <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-[5px] sm:rounded-lg border border-emerald-200">
                  <Download className="w-3 h-3" />
                  {item.downloadsCount}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Eye className="w-3 h-3" />
                  {item.viewsCount}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
