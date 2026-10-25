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
import ScheduleManager from '@/components/schedules/ScheduleManager';
import StudentPortalView from '@/components/student/StudentPortalView';
import DoctorPortalView from '@/components/doctor/DoctorPortalView';
import { SettingsView } from '@/components/settings/SettingsView';
import { useApp } from '@/context/AppContext';
import { ExternalLink, ShieldCheck, Sparkles, UserCheck, RefreshCw } from 'lucide-react';

export default function App() {
  const { activeTab, currentUser, users, login, resetAll } = useApp();

  const demoRoles = [
    { label: 'سوبر ادمن', role: 'super_admin' },
    { label: 'عميد كليه', role: 'college_admin' },
    { label: 'رئيس القسم', role: 'department_admin' },
    { label: 'الاستاذ', role: 'doctor' },
    { label: 'الطالب', role: 'student' },
  ];

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
            {demoRoles.map(item => {
              const targetUser = users.find(u => u.role === item.role);
              const isActive = currentUser.role === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => {
                    if (targetUser) login(targetUser.email, '123456');
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm ${
                    isActive
                      ? 'bg-amber-600 text-white border border-amber-700 shadow-md scale-105'
                      : 'bg-white hover:bg-amber-50 text-slate-700 border border-slate-200 hover:border-amber-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={resetAll}
              title="إعادة ضبط البيانات الافتراضية"
              className="p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 border border-slate-200 transition-all mr-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Views */}
        <div>
          {currentUser.role === 'student' ? (
            <StudentPortalView />
          ) : currentUser.role === 'doctor' ? (
            <DoctorPortalView />
          ) : (
            <>
              {activeTab === 'structure' && <StructureManager />}
              {activeTab === 'users' && <UserManager />}
              {activeTab === 'lectures' && <LectureManager />}
              {activeTab === 'schedules' && <ScheduleManager />}
              {activeTab === 'analytics' && <AnalyticsView />}
              {activeTab === 'settings' && <SettingsView />}
            </>
          )}
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
