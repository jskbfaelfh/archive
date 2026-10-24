// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file BackupRestoreCard.tsx
 * @description بطاقة النسخ الاحتياطي واسترجاع البيانات لسوبر أدمن المنظومة
 * @created 2026-10-24
 */
import React, { useState } from 'react';
import { Database, Download, UploadCloud, FileCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function BackupRestoreCard() {
  const { colleges, sections, subjects, lectures, schedules, users } = useApp();
  const [restoring, setRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const handleDownloadBackup = () => {
    const backupData = {
      exportedAt: new Date().toISOString(),
      system: 'جامعة الزهراوي - أرشفة المحاضرات',
      colleges,
      sections,
      subjects,
      lectures,
      schedules,
      users,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alzahrawi_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!confirm(`هل أنت متأكد من استرجاع البيانات من الملف "${file.name}"؟ سيتم استبدال بيانات المنظومة وتحديثها بالكامل.`)) {
      e.target.value = '';
      return;
    }

    try {
      setRestoring(true);
      setRestoreStatus('جاري فحص وقراءة ملف النسخة الاحتياطية...');
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.colleges) localStorage.setItem('alzahrawi_colleges', JSON.stringify(data.colleges));
      if (data.sections) localStorage.setItem('alzahrawi_sections', JSON.stringify(data.sections));
      if (data.subjects) localStorage.setItem('alzahrawi_subjects', JSON.stringify(data.subjects));
      if (data.lectures) localStorage.setItem('alzahrawi_lectures', JSON.stringify(data.lectures));
      if (data.schedules) localStorage.setItem('alzahrawi_schedules', JSON.stringify(data.schedules));
      if (data.users) localStorage.setItem('alzahrawi_users', JSON.stringify(data.users));

      setRestoreStatus('تمت استعادة البيانات بنجاح! جاري تطبيق التغييرات...');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء استرجاع الملف، تأكد من صحة تنسيق JSON.');
      setRestoreStatus(null);
    } finally {
      setRestoring(false);
      e.target.value = '';
    }
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-900 text-white rounded-xl">
            <Database className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-900">النسخ الاحتياطي والأرشفة الشاملة</h3>
            <p className="text-[11px] text-slate-500">تصدير قاعدة البيانات بالكامل أو استرجاعها بملف JSON آمن</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadBackup}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-sky-600/30"
          >
            <Download className="w-4 h-4 text-sky-200" />
            <span>تصدير نسخة احتياطية</span>
          </button>

          <label className={`flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
            restoring ? 'opacity-50 pointer-events-none' : ''
          }`}>
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span>{restoring ? 'جاري الاسترجاع...' : 'استرجاع نسخة'}</span>
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileRestore}
              disabled={restoring}
            />
          </label>
        </div>
      </div>

      {restoreStatus && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800 animate-in fade-in">
          <FileCheck className="w-4 h-4 shrink-0 text-emerald-600" />
          <span>{restoreStatus}</span>
        </div>
      )}
    </div>
  );
}
