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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">سجل عمليات المزامنة المركزية</h3>
            <p className="text-xs text-slate-500">تتبع عمليات استيراد البيانات اليدوية والتلقائية عبر الويبهوك</p>
          </div>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full font-semibold">
          {syncHistory.length} عملية مسجلة
        </span>
      </div>

      {syncHistory.length === 0 ? (
        <div className="text-center py-8 text-slate-400 text-xs">
          <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          لا توجد عمليات مزامنة مسجلة بعد. عند تفعيل الربط وإجراء أول مزامنة ستظهر التفاصيل هنا.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
          {syncHistory.map((item) => (
            <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-3">
                {item.status === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{item.details}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      item.type === 'automatic'
                        ? 'bg-blue-50 text-blue-700'
                        : item.type === 'webhook'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.type === 'automatic' ? 'مجدول' : item.type === 'webhook' ? 'ويبهوك تلقائي' : 'مزامنة يدوية'}
                    </span>
                  </div>
                  {item.counts && (
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <span>🏛️ {item.counts.colleges} كلية</span>
                      <span>📂 {item.counts.departments} قسم</span>
                      <span>👥 {item.counts.faculty} كادر وموظف</span>
                      <span>🚪 {item.counts.facilities} قاعة ومختبر</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono text-left shrink-0">
                {item.timestamp}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
