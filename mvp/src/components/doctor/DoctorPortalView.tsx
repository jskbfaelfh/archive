// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file DoctorPortalView.tsx
 * @description بوابة الأستاذ التدريسي مع بطاقة الهوية الأكاديمية والتبديل بين المحاضرات وجدول الدوام
 * @created 2026-10-21
 */
import React, { useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import LectureManager from '@/components/lectures/LectureManager';
import ScheduleManager from '@/components/schedules/ScheduleManager';
import { FileText, Calendar, BookOpen, DownloadCloud } from 'lucide-react';

export default function DoctorPortalView() {
  const { currentUser, colleges, subjects, lectures, activeTab, setActiveTab } = useApp();

  // If doctor enters with structure or users, automatically reset to lectures
  useEffect(() => {
    if (activeTab === 'structure' || activeTab === 'users' || activeTab === 'analytics') {
      setActiveTab('lectures');
    }
  }, [activeTab, setActiveTab]);

  const currentTab = activeTab === 'schedules' ? 'schedules' : 'lectures';

  const myCollege = colleges.find(c => c.id === currentUser.collegeId);
  const myDept = myCollege?.departments.find(d => d.id === currentUser.departmentId);

  // Doctor's assigned subjects
  const mySubjects = subjects.filter(s =>
    s.doctorId === currentUser.id ||
    (!s.doctorId && s.departmentId === currentUser.departmentId)
  );

  // Doctor's uploaded or assigned lectures
  const myLectures = lectures.filter(lec =>
    lec.doctorId === currentUser.id ||
    mySubjects.some(sub => sub.id === lec.subjectId)
  );

  const totalDownloads = myLectures.reduce((acc, lec) => acc + (lec.downloadsCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* 1. Doctor Academic Profile Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#041633] to-[#0c2b64] text-cyan-300 flex items-center justify-center font-black text-xl shadow-md border border-cyan-500/30 shrink-0">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900">{currentUser.name}</h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-900 border border-blue-200">
                أستاذ تدريسي
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1 font-semibold">
              <span>{myCollege?.name || 'كلية الطب البشري'}</span>
              <span>•</span>
              <span>{myDept?.name || 'قسم الجراحة العامة'}</span>
              <span>•</span>
              <span className="text-cyan-800 font-bold">
                {currentUser.title || 'هيئة التدريس'}
              </span>
            </div>

            {/* Assigned Subjects Badges */}
            {mySubjects.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] font-bold text-slate-400">المقررات المكلّف بها:</span>
                {mySubjects.map(sub => (
                  <span
                    key={sub.id}
                    className="px-2 py-0.5 rounded-lg text-[11px] font-black bg-cyan-50 text-cyan-800 border border-cyan-200/60"
                  >
                    {sub.name} (المرحلة {sub.stage})
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats Counter Box */}
        <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/70 self-start md:self-auto">
          <div className="text-center px-3 border-l border-slate-200">
            <div className="text-[11px] text-slate-500 font-bold">المقررات</div>
            <div className="text-base font-black text-[#041633]">{mySubjects.length}</div>
          </div>
          <div className="text-center px-3 border-l border-slate-200">
            <div className="text-[11px] text-slate-500 font-bold">محاضراتي</div>
            <div className="text-base font-black text-cyan-600">{myLectures.length}</div>
          </div>
          <div className="text-center px-3">
            <div className="text-[11px] text-slate-500 font-bold">التحميلات</div>
            <div className="text-base font-black text-emerald-600">{totalDownloads}</div>
          </div>
        </div>
      </div>

      {/* 2. Switcher: Lectures vs Schedules */}
      <div className="flex items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('lectures')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            currentTab === 'lectures'
              ? 'bg-[#041633] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
          }`}
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>المحاضرات والمقررات الدراسية</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('schedules')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all ${
            currentTab === 'schedules'
              ? 'bg-[#041633] text-white shadow-md'
              : 'text-slate-700 hover:text-slate-900 hover:bg-slate-300/50'
          }`}
        >
          <Calendar className="w-4 h-4 text-cyan-400" />
          <span>جدول المحاضرات اليومي</span>
        </button>
      </div>

      {/* 3. Tab Content */}
      <div>
        {currentTab === 'schedules' ? (
          <ScheduleManager />
        ) : (
          <LectureManager />
        )}
      </div>
    </div>
  );
}
