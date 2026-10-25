// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file App.tsx
 * @description المكون الرئيسي لمنظومة الأرشفة الأكاديمية المركزية لجامعة الزهراوي (النسخة الرسمية)
 * @created 2026-10-21
 * @updated 2026-10-24
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
import { FeedbackSticker } from '@/components/feedback';
import { useApp } from '@/context/AppContext';

export default function App() {
  const { activeTab, currentUser, colleges } = useApp();

  const userCol = colleges.find((c) => c.id === currentUser.collegeId);
  const userDept = userCol?.departments.find((d) => d.id === currentUser.departmentId);

  const feedbackUser = currentUser.id
    ? {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        jobTitle:
          currentUser.title ||
          (currentUser.role === 'super_admin'
            ? 'مسؤول النظام العام'
            : currentUser.role === 'college_admin'
            ? 'عميد الكلية'
            : currentUser.role === 'department_admin'
            ? 'رئيس القسم'
            : currentUser.role === 'doctor'
            ? 'تدريسي'
            : 'طالب'),
        collegeId: currentUser.collegeId,
        collegeName: userCol?.name,
        deptId: currentUser.departmentId,
        deptName: userDept?.name,
        workplace:
          userCol && userDept
            ? `${userCol.name} / ${userDept.name}`
            : userCol?.name || 'جامعة الزهراوي - منظومة المحاضرات',
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f7fb]">
      <Navbar />

      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-6 pb-24 lg:pb-6 space-y-6">
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

      {/* Official Footer with Identity */}
      <footer className="mt-auto bg-[#041633] text-white border-t border-cyan-500/20 py-4 lg:py-8 mb-16 lg:mb-0">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-3 lg:gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/images/university-logo.png"
              alt="شعار جامعة الزهراوي"
              className="h-8 lg:h-12 w-auto object-contain"
            />
            <div>
              <div className="font-black text-sm text-white">جامعة الزهراوي</div>
              <div className="text-xs text-slate-400 hidden lg:block">كربلاء المقدسة، طريق كربلاء - نجف، العراق</div>
              <div className="text-[11px] text-slate-400 lg:hidden">أرشفة المحاضرات</div>
            </div>
          </div>

          <div className="text-center md:text-left text-xs text-slate-400 space-y-1">
            <p className="hidden lg:block">منظومة أرشفة المحاضرات والمناهج الأكاديمية الرقمية © 2026</p>
            <p className="lg:hidden text-[11px] font-mono">© 2026</p>
            <p className="text-[11px] text-cyan-300/70 hidden lg:block">
              معتمدة من وزارة التعليم العالي والبحث العلمي
            </p>
          </div>
        </div>
      </footer>

      {/* ستيكر إرسال الملاحظات ولقطات الشاشة لنظام إدارة المشاريع المركزي */}
      <FeedbackSticker
        currentUser={feedbackUser}
        config={{
          projectId: 'lectures-archive',
          apiUrl: 'https://api.supabase.alzahu.edu.iq/functions/v1/projectManege.submitExternalNote',
        }}
        lang="ar"
      />
    </div>
  );
}
