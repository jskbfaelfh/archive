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
import StudentPortalView from '@/components/student/StudentPortalView';
import { useApp } from '@/context/AppContext';
import { ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';

export default function App() {
  const { activeTab, currentUser } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb]">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Dynamic Views */}
        <div>
          {currentUser.role === 'student' ? (
            <StudentPortalView />
          ) : (
            <>
              {activeTab === 'structure' && <StructureManager />}
              {activeTab === 'users' && <UserManager />}
              {activeTab === 'lectures' && <LectureManager />}
              {activeTab === 'analytics' && <AnalyticsView />}
            </>
          )}
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
