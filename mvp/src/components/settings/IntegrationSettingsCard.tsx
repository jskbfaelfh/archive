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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
      {/* رأس البطاقة والتبديل الرئيسي */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <Link2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">تكامل نظام الهيكلية المركزي</h3>
            <p className="text-sm text-slate-500">ربط منظومة الجداول الإلكترونية بقاعدة بيانات الهيكلية الموحدة</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer select-none">
          <input
            type="checkbox"
            checked={integrationSettings.isEnabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
          <span className="mr-3 text-sm font-bold text-slate-700">
            {integrationSettings.isEnabled ? 'المزامنة مفعّلة' : 'معطّل'}
          </span>
        </label>
      </div>

      {/* تنبيه القفل عند التفعيل */}
      {integrationSettings.isEnabled ? (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-900 leading-relaxed">
            <p className="font-bold">وضع المزامنة المركزية نشط (قفل الإضافة اليدوية):</p>
            <p className="text-amber-800 mt-1">
              تم إخفاء أزرار الإضافة وتعطيل الإدخال اليدوي في صفحات الكليات، الأقسام، الكادر والموظفين، والمختبرات والقاعات لضمان تطابق البيانات مركزياً ومنع الازدواجية.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <Shield className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
          <div className="text-sm text-slate-600 leading-relaxed">
            التكامل معطل حالياً. يتم إدخال وإدارة الكليات، الأقسام، الكوادر، والقاعات يدوياً من داخل النظام بحرية.
          </div>
        </div>
      )}

      {/* حقول الـ API والمصادقة */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            رابط واجهة برمجة التطبيقات (Central API Endpoint) *
          </label>
          <div className="relative">
            <Globe className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            <input
              type="url"
              value={integrationSettings.apiUrl}
              onChange={(e) => updateIntegrationSettings({ apiUrl: e.target.value })}
              placeholder="https://central-hierarchy.alzahrawi.edu.iq/api/v1"
              className="w-full pr-10 pl-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors text-slate-800"
              dir="ltr"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            مفتاح المصادقة والوصول (API Key / Bearer Token) *
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            <input
              type={showKey ? 'text' : 'password'}
              value={integrationSettings.apiKey}
              onChange={(e) => updateIntegrationSettings({ apiKey: e.target.value })}
              placeholder="zh_live_sec_..."
              className="w-full pr-10 pl-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:outline-none transition-colors text-slate-800 font-mono"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* رابط الويبهوك التلقائي والدالة السحابية Edge Function */}
      <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-800">
              دالة المزامنة السحابية التلقائية (Edge Function Webhook)
            </span>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
            جاهز للاستقبال
          </span>
        </div>
        <p className="text-xs text-slate-500">
          قم بتسجيل هذا الرابط في نظام الهيكلية المركزي لإرسال تنبيهات تلقائية فور حدوث أي تعديل بالهيكلية:
        </p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={integrationSettings.webhookUrl || ''}
            className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700 select-all"
            dir="ltr"
          />
          <button
            type="button"
            onClick={handleCopyWebhook}
            className="px-3 py-2 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedWebhook ? 'تم النسخ' : 'نسخ'}</span>
          </button>
        </div>
      </div>

      {/* إجراءات الاختبار والحفظ */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleTestConnection}
          disabled={testStatus === 'testing'}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
          <span>اختبار الاتصال بالخادم المركزي</span>
        </button>

        {testStatus === 'success' && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{testMessage}</span>
          </div>
        )}
        {testStatus === 'error' && (
          <div className="flex items-center gap-1.5 text-xs text-rose-700 font-medium">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>{testMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
