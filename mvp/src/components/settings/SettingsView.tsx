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
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* رأس الصفحة */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Settings className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-800">إعدادات المنظومة والربط المركزي</h1>
                <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  <Lock className="w-3 h-3" />
                  حساب السوبر أدمن حصراً
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1">
                إدارة التكامل مع نظام الهيكلية المركزي لجامعة الزهراوي وتعيين الحقول والمزامنة التلقائية
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* مكونات الإعدادات */}
      <IntegrationSettingsCard />
      <CentralTableMappingCard />
      <SyncHistoryCard />
    </div>
  );
};
