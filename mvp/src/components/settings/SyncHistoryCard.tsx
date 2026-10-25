// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file SyncHistoryCard.tsx
 * @description بطاقة سجل عمليات المزامنة والتكامل المركزي
 */
import React from 'react';
import { useApp } from '@/context/AppContext';
import { History, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const SyncHistoryCard: React.FC = () => {
  const { syncHistory } = useApp();

  return (
    <div className="bg-white rounded-[10px] sm:rounded-2xl shadow-sm border border-slate-200 p-3.5 sm:p-6 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[7px] sm:rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
            <History className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-base font-bold text-slate-800">
              <span className="hidden sm:inline">سجل عمليات المزامنة المركزية</span>
              <span className="sm:hidden">سجل المزامنة</span>
            </h3>
            <p className="text-xs text-slate-500 hidden sm:block">تتبع عمليات استيراد البيانات اليدوية والتلقائية عبر الويبهوك</p>
          </div>
        </div>
        <span className="text-[10px] sm:text-xs bg-slate-100 text-slate-600 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-semibold shrink-0">
          <span className="hidden sm:inline">{syncHistory.length} عملية مسجلة</span>
          <span className="sm:hidden">{syncHistory.length} مسجلة</span>
        </span>
      </div>

      {syncHistory.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-slate-400 text-xs font-semibold">
          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          لا توجد عمليات مزامنة مسجلة بعد. عند تفعيل الربط وإجراء أول مزامنة ستظهر التفاصيل هنا.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {syncHistory.map((item) => (
            <div key={item.id} className="py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
              <div className="flex items-start gap-2.5 sm:gap-3">
                {item.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800">{item.details}</span>
                    <span className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-semibold ${
                      item.type === 'automatic'
                        ? 'bg-blue-50 text-blue-700'
                        : item.type === 'webhook'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.type === 'automatic' ? 'مجدول' : item.type === 'webhook' ? 'ويبهوك' : 'يدوي'}
                    </span>
                  </div>
                  {item.counts && (
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-[10px] sm:text-[11px] text-slate-500">
                      <span>🏛️ {item.counts.colleges} كلية</span>
                      <span>📂 {item.counts.departments} قسم</span>
                      <span>👥 {item.counts.faculty} كادر</span>
                      <span>🚪 {item.counts.facilities} قاعة</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[10px] sm:text-[11px] text-slate-400 font-mono text-left shrink-0">
                {item.timestamp}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
