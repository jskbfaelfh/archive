// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file AnalyticsView.tsx
 * @description لوحة المؤشرات والإحصائيات الأكاديمية مفلترة حسب صلاحيات القسم والكلية والجامعة
 * @created 2026-10-21
 * @updated 2026-10-24
 */
'use client';

import React, { useMemo } from 'react';
import {
  FileText,
  Users,
  Building2,
  TrendingUp,
  Download,
  Eye,
  ShieldAlert,
  Clock,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import BackupRestoreCard from './BackupRestoreCard';

export default function AnalyticsView() {
  const { currentUser, colleges, subjects, lectures, schedules, users } = useApp();

  const isSuper = currentUser.role === 'super_admin';
  const isCollegeAdmin = currentUser.role === 'college_admin';
  const isDeptAdmin = currentUser.role === 'department_admin';
  const canView = isSuper || isCollegeAdmin || isDeptAdmin;

  const currentCollege = useMemo(
    () => colleges.find((c) => c.id === currentUser.collegeId),
    [colleges, currentUser.collegeId]
  );

  const currentDept = useMemo(
    () => currentCollege?.departments.find((d) => d.id === currentUser.departmentId),
    [currentCollege, currentUser.departmentId]
  );

  const stats = useMemo(() => {
    if (!canView) return null;

    let targetLectures = lectures;
    let targetDoctors = users.filter((u) => u.role === 'doctor');
    let targetStudents = users.filter((u) => u.role === 'student');
    let scopeTitle = 'المنظومة المركزية - جامعة الزهراوي';
    let scopeSubtitle = 'إحصائيات شاملة لكافة الكليات والأقسام العلمية';
    let scopeBadge = 'إحصائيات عامة للجامعة';
    let metric4Label = 'الكليات والأقسام';
    let metric4Value = `${colleges.length} كليات / ${colleges.reduce((acc, c) => acc + c.departments.length, 0)} قسم`;

    if (isDeptAdmin && currentUser.departmentId) {
      scopeTitle = currentDept?.name ? `قسم ${currentDept.name}` : 'القسم المخصص';
      scopeSubtitle = `${currentCollege?.name || 'الكلية'} • جامعة الزهراوي`;
      scopeBadge = 'إحصائيات القسم فقط';

      targetLectures = lectures.filter((l) => l.departmentId === currentUser.departmentId);
      const deptSubjects = subjects.filter((s) => s.departmentId === currentUser.departmentId);

      targetDoctors = users.filter(
        (u) =>
          u.role === 'doctor' &&
          (u.departmentId === currentUser.departmentId ||
            deptSubjects.some((s) => s.doctorId === u.id || s.theoryDoctorId === u.id || s.practicalDoctorId === u.id))
      );
      targetStudents = users.filter(
        (u) => u.role === 'student' && u.departmentId === currentUser.departmentId
      );

      metric4Label = 'المواد والمراحل';
      metric4Value = `${deptSubjects.length} مادة (${currentDept?.stagesCount || 4} مراحل)`;
    } else if (isCollegeAdmin && currentUser.collegeId) {
      scopeTitle = currentCollege?.name ? `كلية ${currentCollege.name}` : 'الكلية المخصصة';
      scopeSubtitle = 'جامعة الزهراوي';
      scopeBadge = 'إحصائيات الكلية فقط';

      targetLectures = lectures.filter((l) => l.collegeId === currentUser.collegeId);
      targetDoctors = users.filter((u) => u.role === 'doctor' && u.collegeId === currentUser.collegeId);
      targetStudents = users.filter((u) => u.role === 'student' && u.collegeId === currentUser.collegeId);
      metric4Label = 'الأقسام العلمية';
      metric4Value = `${currentCollege?.departments.length || 0} أقسام علمية`;
    }

    const topLectures = [...targetLectures]
      .sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0))
      .slice(0, 5);

    const relevantSchedules = schedules.filter((s) =>
      isDeptAdmin ? s.departmentId === currentUser.departmentId : isCollegeAdmin ? s.collegeId === currentUser.collegeId : true
    );

    const activities = [
      ...targetLectures.slice(0, 4).map((l) => ({
        id: `act-lec-${l.id}`,
        userName: l.doctorName,
        userRole: 'تدريسي',
        action: 'رفع محاضرة',
        target: l.title,
        details: `${l.subjectName || 'مادة تخصصية'} • المرحلة ${l.stage}`,
        createdAt: l.uploadDate,
      })),
      ...relevantSchedules.slice(0, 3).map((s) => ({
        id: `act-sch-${s.id}`,
        userName: s.createdByName || 'رئاسة القسم',
        userRole: 'جدول أسبوعي',
        action: 'اعتماد جدول',
        target: s.title,
        details: s.targetType === 'doctor' ? 'جدول تدريسي' : `المرحلة ${s.stage}`,
        createdAt: s.createdAt,
      })),
    ].slice(0, 6);

    return {
      scopeTitle, scopeSubtitle, scopeBadge,
      lecturesCount: targetLectures.length,
      doctorsCount: targetDoctors.length,
      studentsCount: targetStudents.length,
      metric4Label, metric4Value, topLectures, activities,
    };
  }, [canView, isSuper, isCollegeAdmin, isDeptAdmin, currentUser, currentCollege, currentDept, colleges, subjects, lectures, schedules, users]);

  if (!canView || !stats) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-md mx-auto my-12 space-y-3">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">غير مصرح بالدخول</h3>
        <p className="text-xs text-slate-500">لوحة الإحصائيات مخصصة لرئاسة القسم وإدارة الكلية ورئاسة الجامعة فقط.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Scope Banner */}
      <div className="bg-gradient-to-r from-sky-900 via-blue-900 to-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-xs text-cyan-300">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-white">{stats.scopeTitle}</h2>
              <span className="text-[11px] font-bold bg-cyan-400/20 text-cyan-200 border border-cyan-400/40 px-2.5 py-0.5 rounded-full">
                {stats.scopeBadge}
              </span>
            </div>
            <p className="text-xs text-sky-200/80 mt-0.5">{stats.scopeSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">
              {isDeptAdmin ? 'محاضرات القسم' : isCollegeAdmin ? 'محاضرات الكلية' : 'إجمالي المحاضرات'}
            </span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.lecturesCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">
              {isDeptAdmin ? 'تدريسو القسم' : isCollegeAdmin ? 'تدريسو الكلية' : 'الكادر التدريسي'}
            </span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.doctorsCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">
              {isDeptAdmin ? 'طلبة القسم' : isCollegeAdmin ? 'طلبة الكلية' : 'الطلاب المسجلون'}
            </span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.studentsCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">{stats.metric4Label}</span>
            {isDeptAdmin ? <BookOpen className="w-4 h-4 text-indigo-600" /> : <Building2 className="w-4 h-4 text-indigo-600" />}
          </div>
          <div className="text-lg font-black text-slate-900">{stats.metric4Value}</div>
        </div>
      </div>

      {/* 2-Columns: Top Downloads & Recent Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Downloaded Lectures */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900">المحاضرات الأكثر تفاعلاً</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">حسب التحميل</span>
          </div>

          <div className="space-y-2">
            {stats.topLectures.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-bold">لا توجد محاضرات في هذا النطاق بعد</p>
            ) : (
              stats.topLectures.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl flex items-center justify-between text-xs transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">{item.title}</span>
                      <span className="text-[10px] text-slate-500">
                        {item.subjectName} • {item.doctorName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 font-mono text-[11px]">
                    <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      <Download className="w-3 h-3" />
                      {item.downloadsCount}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Eye className="w-3 h-3" />
                      {item.viewsCount}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Academic Activity Log */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">سجل النشاط الأكاديمي للقسم</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">آخر التحديثات</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {stats.activities.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6 font-bold">لا يوجد نشاط مسجل مؤخراً</p>
            ) : (
              stats.activities.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.userName}</span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.createdAt}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-semibold text-sky-800">{log.action}: {log.target}</span>
                    <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.5 rounded font-bold text-slate-700">
                      {log.userRole}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-[10px] text-slate-500 font-normal leading-relaxed">{log.details}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Database Backup & Disaster Recovery (Super Admin only) */}
      {isSuper && <BackupRestoreCard />}
    </div>
  );
}
