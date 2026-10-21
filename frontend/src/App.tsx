// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file App.tsx
 * @description المكون الرئيسي لمنظومة الأرشفة الأكاديمية المركزية لجامعة الزهراوي
 * @created 2026-10-21
 */
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import StructureManager from '@/components/hierarchy/StructureManager';
import UserManager from '@/components/users/UserManager';
import LectureManager from '@/components/lectures/LectureManager';
import AnalyticsView from '@/components/analytics/AnalyticsView';
import { useApp } from '@/context/AppContext';
import { ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb]">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Official University Identity Hero Ribbon */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#041633] via-[#0a1e3b] to-[#0c2b64] p-5 sm:p-6 text-white shadow-xl shadow-[#041633]/15 border border-cyan-500/20">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-10 w-64 h-64 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-cyan-950/90 text-cyan-300 border border-cyan-500/40">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  العام الدراسي 2026 - 2027
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/10 text-slate-200 border border-white/10">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  منظومة معتمدة ومحمية
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-wide">
                منظومة الأرشفة والتوثيق الأكاديمي المركزي
              </h2>
              <p className="text-xs sm:text-sm text-cyan-100/80 font-medium">
                بوابة التوثيق الرسمي للمحاضرات والمقررات الدراسية لجامعة الزهراوي لكافة الكليات والأقسام العلمية.
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

      {/* Official Footer with Identity */}
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
            <p>منظومة أرشفة المحاضرات والمناهج الأكاديمية الرقمية © 2026</p>
            <p className="text-[11px] text-cyan-300/70">
              معتمدة من وزارة التعليم العالي والبحث العلمي
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
