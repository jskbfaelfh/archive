// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file AnalyticsActivityLog.tsx
 * @description سجل النشاط الأكاديمي والعمليات المعتمدة
 * @created 2026-10-24
 */
import React from 'react';
import { Clock } from 'lucide-react';

export interface ActivityItem {
  id: string;
  userName: string;
  userRole: string;
  action: string;
  target: string;
  details?: string;
  createdAt: string;
}

interface AnalyticsActivityLogProps {
  title: string;
  activities: ActivityItem[];
}

export default function AnalyticsActivityLog({ title, activities }: AnalyticsActivityLogProps) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-600" />
          <h3 className="font-bold text-sm text-slate-900">{title}</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-bold">آخر التحديثات</span>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 font-bold">لا يوجد نشاط مسجل مؤخراً</p>
        ) : (
          activities.map((log) => (
            <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">{log.userName}</span>
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {log.createdAt}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-semibold text-sky-800">{log.action}: {log.target}</span>
                <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.5 rounded font-bold text-slate-700">
                  {log.userRole}
                </span>
              </div>
              {log.details && (
                <p className="text-[10px] text-slate-500 font-normal leading-relaxed">{log.details}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
