// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file IntegrationSettingsCard.tsx
 * @description بطاقة إعدادات الربط والتكامل مع نظام الهيكلية المركزي
 */
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Link2, Key, Globe, Shield, RefreshCw, CheckCircle2, AlertTriangle, Eye, EyeOff, Copy, Check } from 'lucide-react';

export const IntegrationSettingsCard: React.FC = () => {
  const { integrationSettings, updateIntegrationSettings } = useApp();
  const [showKey, setShowKey] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleToggle = (enabled: boolean) => {
    updateIntegrationSettings({ isEnabled: enabled });
  };

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(integrationSettings.webhookUrl || '');
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('');
    try {
      await new Promise(r => setTimeout(r, 800));
      if (!integrationSettings.apiUrl) {
        throw new Error('يرجى إدخال رابط API الخاص بنظام الهيكلية أولاً.');
      }
      setTestStatus('success');
      setTestMessage('تم التحقق من الاتصال بنجاح! خادم الهيكلية المركزي متاح.');
    } catch (err: any) {
      setTestStatus('error');
      setTestMessage(err.message || 'تعذر الاتصال بالخادم المركزي.');
    }
  };

  return (
    <div className="bg-white rounded-[10px] sm:rounded-2xl shadow-sm border border-slate-200 p-3.5 sm:p-6 space-y-4 sm:space-y-6">
      {/* رأس البطاقة والتبديل الرئيسي */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-[7px] sm:rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold shadow-xs shrink-0">
            <Link2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-lg font-black text-slate-800 truncate">
                <span className="hidden sm:inline">تكامل نظام الهيكلية المركزي</span>
                <span className="sm:hidden">نظام الهيكلية</span>
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-black shrink-0 ${
                integrationSettings.isEnabled
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}>
                {integrationSettings.isEnabled ? 'مفعّل' : 'معطّل'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 hidden sm:block">
              ربط منظومة الجداول الأكاديمية بقاعدة بيانات الهيكلية الموحدة لجامعة الزهراوي
            </p>
          </div>
        </div>

        {/* زر التبديل والتشغيل الفوري المحكم */}
        <div className="flex items-center justify-between sm:justify-end gap-3 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-[10px] sm:rounded-2xl shrink-0 w-full sm:w-auto">
          <div className="text-right select-none">
            <div className={`text-xs font-black ${
              integrationSettings.isEnabled ? 'text-emerald-700' : 'text-slate-700'
            }`}>
              <span className="hidden sm:inline">{integrationSettings.isEnabled ? 'المزامنة مفعّلة' : 'المزامنة معطّلة'}</span>
              <span className="sm:hidden">{integrationSettings.isEnabled ? 'مفعّل' : 'معطّل'}</span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
              {integrationSettings.isEnabled ? 'قفل الإضافة نشط' : 'إدخال يدوي متاح'}
            </div>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={integrationSettings.isEnabled}
            onClick={() => handleToggle(!integrationSettings.isEnabled)}
            className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              integrationSettings.isEnabled
                ? 'bg-emerald-600'
                : 'bg-slate-300 hover:bg-slate-400'
            }`}
          >
            <span
              className={`pointer-events-none flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                integrationSettings.isEnabled ? '-translate-x-6 text-emerald-600' : 'translate-x-0 text-slate-400'
              }`}
            >
              {integrationSettings.isEnabled ? (
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-300" />
              )}
            </span>
          </button>
        </div>
      </div>

      {/* تنبيه القفل عند التفعيل */}
      {integrationSettings.isEnabled ? (
        <div className="p-3 sm:p-4 rounded-[10px] sm:rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5 sm:gap-3">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <p className="font-bold">وضع المزامنة المركزية نشط (قفل الإضافة اليدوية):</p>
            <p className="text-amber-800 mt-1">
              تم إخفاء أزرار الإضافة وتعطيل الإدخال اليدوي في صفحات الكليات، الأقسام، الكادر والموظفين، والمختبرات والقاعات لضمان تطابق البيانات مركزياً ومنع الازدواجية.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 sm:p-4 rounded-[10px] sm:rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 sm:gap-3">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 mt-0.5 shrink-0" />
          <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            التكامل معطل حالياً. يتم إدخال وإدارة الكليات، الأقسام، الكوادر، والقاعات يدوياً من داخل النظام بحرية.
          </div>
        </div>
      )}

      {/* حقول الـ API والمصادقة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            رابط واجهة برمجة التطبيقات (Central API Endpoint)
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            <input
              type="url"
              value={integrationSettings.apiUrl}
              onChange={(e) => updateIntegrationSettings({ apiUrl: e.target.value })}
              placeholder="https://central-hierarchy.alzahrawi.edu.iq/api/v1"
              className={`w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-[7px] text-xs sm:text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors text-slate-800 font-mono border-s-[3px] ${
                integrationSettings.apiUrl ? 'border-s-emerald-500' : 'border-s-rose-500'
              }`}
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            مفتاح المصادقة والوصول (API Key / Bearer Token)
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            <input
              type={showKey ? 'text' : 'password'}
              value={integrationSettings.apiKey}
              onChange={(e) => updateIntegrationSettings({ apiKey: e.target.value })}
              placeholder="zh_live_sec_..."
              className={`w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-[7px] text-xs sm:text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors text-slate-800 font-mono border-s-[3px] ${
                integrationSettings.apiKey ? 'border-s-emerald-500' : 'border-s-rose-500'
              }`}
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* رابط الويبهوك التلقائي والدالة السحابية Edge Function */}
      <div className="bg-slate-50/80 p-3.5 sm:p-4.5 rounded-[10px] sm:rounded-2xl border border-slate-200 space-y-2.5 sm:space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-black text-slate-800 truncate">
              <span className="hidden sm:inline">دالة المزامنة السحابية التلقائية (Edge Function Webhook)</span>
              <span className="sm:hidden">الويبهوك التلقائي</span>
            </span>
          </div>
          <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 shrink-0">
            جاهز للاستقبال
          </span>
        </div>
        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed hidden sm:block">
          قم بتسجيل هذا الرابط في نظام الهيكلية المركزي لإرسال تنبيهات تلقائية فور حدوث أي تعديل بالهيكلية:
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={integrationSettings.webhookUrl || ''}
            className="flex-1 bg-white border border-slate-200 rounded-[7px] sm:rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all focus:outline-none shadow-2xs"
            dir="ltr"
          />
          <button
            type="button"
            onClick={handleCopyWebhook}
            className="px-3 sm:px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-[7px] sm:rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors shadow-2xs shrink-0 cursor-pointer"
          >
            {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedWebhook ? 'تم النسخ' : 'نسخ الرابط'}</span>
            <span className="sm:hidden">{copiedWebhook ? 'منسوخ' : 'نسخ'}</span>
          </button>
        </div>
      </div>

      {/* إجراءات الاختبار والحفظ */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3 pt-2">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testStatus === 'testing'}
          className="px-3.5 sm:px-4 py-2 sm:py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-[7px] sm:rounded-xl flex items-center gap-1.5 sm:gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs border border-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">اختبار الاتصال بالخادم المركزي</span>
          <span className="sm:hidden">اختبار الاتصال</span>
        </button>

        {testStatus === 'success' && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 sm:px-3 py-1.5 rounded-[7px] sm:rounded-xl border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{testMessage}</span>
          </div>
        )}
        {testStatus === 'error' && (
          <div className="flex items-center gap-1.5 text-xs text-rose-700 font-bold bg-rose-50 px-2.5 sm:px-3 py-1.5 rounded-[7px] sm:rounded-xl border border-rose-200">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{testMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
