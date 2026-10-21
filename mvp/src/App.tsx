// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file App.tsx
 * @description المكون الرئيسي لنسخة الـ MVP التجريبية المستقلة لجامعة الزهراوي
 * @created 2026-10-21
 */
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import StructureManager from '@/components/hierarchy/StructureManager';
import UserManager from '@/components/users/UserManager';
import LectureManager from '@/components/lectures/LectureManager';
import AnalyticsView from '@/components/analytics/AnalyticsView';
import { useApp } from '@/context/AppContext';
import { ExternalLink, ShieldCheck, Sparkles, UserCheck, RefreshCw } from 'lucide-react';

export default function App() {
  const { activeTab, currentUser, users, login, resetAll } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb]">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* MVP Live Switcher Banner */}
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-950 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-amber-600 text-white font-black text-xs shadow-sm">
              نسخة الـ MVP التجريبية
            </span>
            <span className="text-xs font-bold text-slate-800">
              المستخدم الحالي: <span className="text-amber-800 font-black">{currentUser.name} ({currentUser.title || currentUser.role})</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 ml-1">تبديل فوري:</span>
            {users.slice(0, 5).map(u => (
              <button
                key={u.id}
                onClick={() => login(u.email, '123456')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  currentUser.id === u.id
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200'
                }`}
              >
                {u.role === 'super_admin' ? 'سوبر أدمن' : u.role === 'college_admin' ? 'عميد' : u.role === 'department_admin' ? 'رئيس قسم' : u.role === 'doctor' ? 'أستاذ' : 'طالب'}
              </button>
            ))}
            <button
              onClick={resetAll}
              title="إعادة ضبط البيانات الافتراضية"
              className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 border border-slate-200 transition-all mr-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Official University Identity Hero Ribbon */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#041633] via-[#0a1e3b] to-[#0c2b64] p-5 sm:p-6 text-white shadow-xl shadow-[#041633]/15 border border-cyan-500/20">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-cyan-950/90 text-cyan-300 border border-cyan-500/40">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  العام الدراسي 2026 - 2027 (MVP Sandbox)
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-slate-200 border border-white/10">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  بيئة تجريبية معتمدة
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                منظومة الأرشفة والتوثيق الأكاديمي المركزي (MVP)
              </h2>
              <p className="text-xs sm:text-sm text-cyan-100/80 font-medium">
                نسخة تجريبية منفصلة مجهزة بكافة بيانات التجربة والأقسام والمحاضرات الجاهزة للمعاينة والعرض.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
              <a
                href="https://new.alzahu.edu.iq/ar"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-cyan-200 hover:text-white border border-cyan-400/30 backdrop-blur-md transition-all shadow-sm"
              >
                <span>موقع الجامعة الرسمي</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Dynamic Views */}
        <div>
          {activeTab === 'structure' && <StructureManager />}
          {activeTab === 'users' && <UserManager />}
          {activeTab === 'lectures' && <LectureManager />}
          {activeTab === 'analytics' && <AnalyticsView />}
        </div>
      </main>

      {/* Official Footer */}
      <footer className="mt-auto bg-[#041633] text-white border-t border-cyan-500/20 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/images/university-logo.png"
              alt="شعار جامعة الزهراوي"
              className="h-12 w-auto object-contain"
            />
            <div>
              <div className="font-black text-sm text-white">جامعة الزهراوي</div>
              <div className="text-xs text-slate-400">كربلاء المقدسة، طريق كربلاء - نجف، العراق</div>
            </div>
          </div>

          <div className="text-center md:text-left text-xs text-slate-400 space-y-1">
            <p>منظومة أرشفة المحاضرات الأكاديمية (النسخة التجريبية MVP) © 2026</p>
            <p className="text-[11px] text-cyan-300/70">
              بيانات افتراضية مسبقة للإطلاق والتجربة الفورية
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
