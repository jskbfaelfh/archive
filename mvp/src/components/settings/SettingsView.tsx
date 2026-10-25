// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file SettingsView.tsx
 * @description صفحة الإعدادات العامة والتكامل المركزي (خاصة بحساب السوبر أدمن حصراً)
 */
import React from 'react';
import { useApp } from '@/context/AppContext';
import { IntegrationSettingsCard } from './IntegrationSettingsCard';
import { CentralTableMappingCard } from './CentralTableMappingCard';
import { SyncHistoryCard } from './SyncHistoryCard';
import { FeedbackNotesCard } from './FeedbackNotesCard';
import { Settings, ShieldAlert, Lock } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { currentUser, setActiveTab } = useApp();

  // التحقق الحصري: الصفحة متاحة للسوبر أدمن فقط
  if (currentUser.role !== 'super_admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">صلاحية مقيدة</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            صفحة الإعدادات وتكامل النظام مخصصة حصراً لحساب مسؤول النظام العام (Super Admin). ليس لديك صلاحية للوصول إلى هذه الصفحة.
          </p>
          <button
            type="button"
            onClick={() => setActiveTab('structure')}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-colors"
          >
            العودة إلى الهيكلية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6 pb-20 sm:pb-16">
      {/* رأس الصفحة */}
      <div className="bg-white rounded-[10px] sm:rounded-2xl p-3.5 sm:p-7 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-[7px] sm:rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Settings className="w-5 h-5 sm:w-7 sm:h-7" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-sm sm:text-2xl font-black text-slate-800 truncate">
                  <span className="hidden sm:inline">إعدادات المنظومة والربط المركزي</span>
                  <span className="sm:hidden">إعدادات الربط المركزي</span>
                </h1>
                <span className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs shrink-0">
                  <Lock className="w-3 h-3 text-amber-600" />
                  <span className="hidden sm:inline">حساب السوبر أدمن حصراً</span>
                  <span className="sm:hidden">سوبر أدمن</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 hidden sm:block">
                إدارة التكامل مع نظام الهيكلية المركزي لجامعة الزهراوي وتعيين الحقول والمزامنة التلقائية
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* مكونات الإعدادات */}
      <FeedbackNotesCard />
      <IntegrationSettingsCard />
      <CentralTableMappingCard />
      <SyncHistoryCard />
    </div>
  );
};
