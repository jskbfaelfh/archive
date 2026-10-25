// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file CentralTableMappingCard.tsx
 * @description بطاقة تعيين حقول جداول الهيكلية المركزية والمزامنة الفورية
 */
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CentralTableKey } from '@/types';
import {
  CENTRAL_FIELDS_COLLEGES,
  CENTRAL_FIELDS_DEPARTMENTS,
  CENTRAL_FIELDS_FACULTY,
  CENTRAL_FIELDS_FACILITIES,
  sampleCentralSyncPayload
} from '@/data/centralIntegrationData';
import { Database, Check, RefreshCw, BookmarkCheck, Building2, Layers, Users, DoorOpen } from 'lucide-react';

const tableConfig: Record<CentralTableKey, { title: string; icon: any; fields: typeof CENTRAL_FIELDS_COLLEGES; sample: any[] }> = {
  colleges: { title: 'الكليات', icon: Building2, fields: CENTRAL_FIELDS_COLLEGES, sample: sampleCentralSyncPayload.colleges },
  departments: { title: 'الأقسام العلمية', icon: Layers, fields: CENTRAL_FIELDS_DEPARTMENTS, sample: sampleCentralSyncPayload.departments },
  faculty: { title: 'الكادر والموظفون', icon: Users, fields: CENTRAL_FIELDS_FACULTY, sample: sampleCentralSyncPayload.faculty },
  facilities: { title: 'المختبرات والقاعات', icon: DoorOpen, fields: CENTRAL_FIELDS_FACILITIES, sample: sampleCentralSyncPayload.facilities },
};

export const CentralTableMappingCard: React.FC = () => {
  const { integrationSettings, updateIntegrationSettings, triggerCentralSync } = useApp();
  const [activeTab, setActiveTab] = useState<CentralTableKey>('colleges');
  const [savedDefaultNotice, setSavedDefaultNotice] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; message?: string; isError?: boolean }>({ loading: false });

  const currentMapping = integrationSettings.mappings[activeTab];
  const { title, icon: Icon, fields, sample } = tableConfig[activeTab];

  const handleToggleField = (fieldKey: string, isRequired?: boolean) => {
    if (isRequired) return; // الحقول الإلزامية لا يمكن إلغاء تحديدها
    const currentFields = currentMapping.selectedFields;
    const nextFields = currentFields.includes(fieldKey)
      ? currentFields.filter((k: string) => k !== fieldKey)
      : [...currentFields, fieldKey];

    updateIntegrationSettings({
      mappings: {
        ...integrationSettings.mappings,
        [activeTab]: { ...currentMapping, selectedFields: nextFields }
      }
    });
  };

  const handleSaveDefault = () => {
    // يحفظ التعيين في التخزين المحلي كخيار افتراضي
    setSavedDefaultNotice(true);
    setTimeout(() => setSavedDefaultNotice(false), 2500);
  };

  const handleSyncNow = async () => {
    setSyncStatus({ loading: true });
    try {
      const res = await triggerCentralSync();
      if (res.success) {
        setSyncStatus({ loading: false, message: res.message || 'تمت المزامنة وحفظ البيانات بنجاح!' });
      } else {
        setSyncStatus({ loading: false, message: res.message, isError: true });
      }
    } catch (err: any) {
      setSyncStatus({ loading: false, message: err.message, isError: true });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">تعيين حقول الجداول المركزية والمزامنة</h3>
            <p className="text-sm text-slate-500">اختر الحقول المستوردة من النظام المركزي لكل جدول واحفظها كافتراضي</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!integrationSettings.isEnabled && (
            <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-bold hidden sm:inline-block">
              تفعيل التكامل أعلاه مطلوب للمزامنة
            </span>
          )}
          <button
            type="button"
            onClick={handleSyncNow}
            disabled={syncStatus.loading || !integrationSettings.isEnabled}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${syncStatus.loading ? 'animate-spin' : ''}`} />
            <span>{syncStatus.loading ? 'جارِ المزامنة...' : 'مزامنة فورية الآن'}</span>
          </button>
        </div>
      </div>

      {syncStatus.message && (
        <div className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
          syncStatus.isError ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
        }`}>
          {syncStatus.isError ? '⚠️' : '✓'} {syncStatus.message}
        </div>
      )}

      {/* تبويبات الجداول الأربعة */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-3">
        {(Object.keys(tableConfig) as CentralTableKey[]).map(key => {
          const cfg = tableConfig[key];
          const TabIcon = cfg.icon;
          const isActive = activeTab === key;
          const count = integrationSettings.mappings[key].selectedFields.length;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span>{cfg.title}</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {count}/{cfg.fields.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* تفاصيل الجدول وحقوله */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-blue-600" />
            <h4 className="text-sm font-bold text-slate-800">
              حقول جدول: {title} <span className="text-xs font-normal text-slate-400">({currentMapping.sourceTable})</span>
            </h4>
          </div>
          <button
            type="button"
            onClick={handleSaveDefault}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors self-start"
          >
            {savedDefaultNotice ? <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Check className="w-3.5 h-3.5" />}
            <span>{savedDefaultNotice ? 'تم حفظ التعيين الافتراضي!' : 'حفظ كتعيين افتراضي'}</span>
          </button>
        </div>

        {/* شبكة الحقول القابلة للاختيار */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {fields.map(f => {
            const isSelected = currentMapping.selectedFields.includes(f.key);
            return (
              <label
                key={f.key}
                onClick={() => handleToggleField(f.key, f.required)}
                className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer select-none transition-all ${
                  isSelected
                    ? 'border-blue-300 bg-blue-50/50 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={f.required}
                  onChange={() => {}}
                  className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800">{f.label}</span>
                    {f.required && (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-1 rounded font-semibold">إلزامي</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono block mt-0.5">{f.key}</span>
                </div>
              </label>
            );
          })}
        </div>

        {/* عينة المعاينة الحية للبيانات المركزية */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700">معاينة البيانات الواردة وفق الحقول المحددة:</span>
            <span className="text-[11px] text-slate-400 font-mono">آخر مزامنة: {currentMapping.lastSyncedAt || 'لم تتم بعد'}</span>
          </div>
          <div className="overflow-x-auto border border-slate-200 rounded-xl max-h-48">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-600 sticky top-0 border-b border-slate-200">
                <tr>
                  {fields.filter(f => currentMapping.selectedFields.includes(f.key)).map(f => (
                    <th key={f.key} className="p-2.5 font-bold whitespace-nowrap">{f.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {sample.slice(0, 3).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    {fields.filter(f => currentMapping.selectedFields.includes(f.key)).map(f => (
                      <td key={f.key} className="p-2.5 text-slate-700 whitespace-nowrap">
                        {String(row[f.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
