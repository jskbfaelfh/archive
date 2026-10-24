// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file AnalyticsView.tsx
 * @description لوحة المؤشرات والإحصائيات الأكاديمية مفلترة للكلية وللقسم وللجامعة
 * @created 2026-10-21
 * @updated 2026-10-24
 */
'use client';

import React, { useMemo, useState } from 'react';
import {
  FileText,
  Users,
  Building2,
  TrendingUp,
  ShieldAlert,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import BackupRestoreCard from './BackupRestoreCard';
import AnalyticsTopLectures from './AnalyticsTopLectures';
import AnalyticsActivityLog from './AnalyticsActivityLog';

export default function AnalyticsView() {
  const { currentUser, colleges, subjects, lectures, schedules, users } = useApp();
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');

  const isSuper = currentUser.role === 'super_admin';
  const isCollegeAdmin = currentUser.role === 'college_admin';
  const isDeptAdmin = currentUser.role === 'department_admin';
  const canView = isSuper || isCollegeAdmin || isDeptAdmin;

  const currentCollege = useMemo(() => {
    if (!currentUser.collegeId) return colleges[0];
    return colleges.find((c) => c.id === currentUser.collegeId) || colleges[0];
  }, [colleges, currentUser.collegeId]);

  const currentDept = useMemo(() => {
    return currentCollege?.departments.find((d) => d.id === currentUser.departmentId);
  }, [currentCollege, currentUser.departmentId]);

  const collegeDepts = useMemo(() => currentCollege?.departments || [], [currentCollege]);

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
      targetStudents = users.filter((u) => u.role === 'student' && u.departmentId === currentUser.departmentId);
      metric4Label = 'المواد والمراحل';
      metric4Value = `${deptSubjects.length} مادة (${currentDept?.stagesCount || 4} مراحل)`;
    } else if (isCollegeAdmin) {
      const colId = currentCollege?.id || currentUser.collegeId;
      const deptObj = collegeDepts.find((d) => d.id === selectedDeptId);

      if (selectedDeptId !== 'all' && deptObj) {
        scopeTitle = `قسم ${deptObj.name}`;
        scopeSubtitle = `${currentCollege?.name || 'الكلية'} • جامعة الزهراوي`;
        scopeBadge = 'إحصائيات القسم المختار';

        targetLectures = lectures.filter((l) => l.departmentId === selectedDeptId);
        const deptSubs = subjects.filter((s) => s.departmentId === selectedDeptId);
        targetDoctors = users.filter(
          (u) =>
            u.role === 'doctor' &&
            (u.departmentId === selectedDeptId ||
              deptSubs.some((s) => s.doctorId === u.id || s.theoryDoctorId === u.id || s.practicalDoctorId === u.id))
        );
        targetStudents = users.filter((u) => u.role === 'student' && u.departmentId === selectedDeptId);
        metric4Label = 'المواد والمراحل';
        metric4Value = `${deptSubs.length} مادة (${deptObj.stagesCount || 4} مراحل)`;
      } else {
        scopeTitle = `كلية ${currentCollege?.name || 'الكلية'}`;
        scopeSubtitle = 'جامعة الزهراوي • إحصائيات الكلية فقط';
        scopeBadge = 'إحصائيات الكلية فقط';

        targetLectures = lectures.filter((l) => l.collegeId === colId);
        targetDoctors = users.filter(
          (u) => u.role === 'doctor' && (u.collegeId === colId || collegeDepts.some((d) => d.id === u.departmentId))
        );
        targetStudents = users.filter(
          (u) => u.role === 'student' && (u.collegeId === colId || collegeDepts.some((d) => d.id === u.departmentId))
        );
        metric4Label = 'الأقسام العلمية';
        metric4Value = `${collegeDepts.length} أقسام علمية`;
      }
    }

    const topLectures = [...targetLectures]
      .sort((a, b) => (b.downloadsCount || 0) - (a.downloadsCount || 0))
      .slice(0, 5);

    const relevantSchedules = schedules.filter((s) => {
      if (isDeptAdmin) return s.departmentId === currentUser.departmentId;
      if (isCollegeAdmin) {
        if (selectedDeptId !== 'all') return s.departmentId === selectedDeptId;
        return s.collegeId === currentCollege?.id;
      }
      return true;
    });

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
        userName: s.createdByName || 'إدارة الكلية/القسم',
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
  }, [canView, isSuper, isCollegeAdmin, isDeptAdmin, currentUser, currentCollege, currentDept, collegeDepts, selectedDeptId, colleges, subjects, lectures, schedules, users]);

  if (!canView || !stats) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-md mx-auto my-12 space-y-3">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-800">غير مصرح بالدخول</h3>
        <p className="text-xs text-slate-500">لوحة الإحصائيات مخصصة لعمادة الكلية ورئاسة القسم ورئاسة الجامعة فقط.</p>
      </div>
    );
  }

  const isFilteredDept = isDeptAdmin || (isCollegeAdmin && selectedDeptId !== 'all');

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

        {/* Dean Department Selector */}
        {isCollegeAdmin && collegeDepts.length > 0 && (
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/20">
            <span className="text-xs text-cyan-200 font-bold shrink-0">تصفية حسب القسم:</span>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              className="text-xs font-bold bg-slate-900/90 text-white border border-cyan-400/30 rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
            >
              <option value="all">كافة أقسام الكلية ({collegeDepts.length})</option>
              {collegeDepts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">
              {isFilteredDept ? 'محاضرات القسم' : isCollegeAdmin ? 'محاضرات الكلية' : 'إجمالي المحاضرات'}
            </span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.lecturesCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">
              {isFilteredDept ? 'تدريسو القسم' : isCollegeAdmin ? 'تدريسو الكلية' : 'الكادر التدريسي'}
            </span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.doctorsCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">
              {isFilteredDept ? 'طلبة القسم' : isCollegeAdmin ? 'طلبة الكلية' : 'الطلاب المسجلون'}
            </span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.studentsCount}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">{stats.metric4Label}</span>
            {isFilteredDept ? <BookOpen className="w-4 h-4 text-indigo-600" /> : <Building2 className="w-4 h-4 text-indigo-600" />}
          </div>
          <div className="text-lg font-black text-slate-900">{stats.metric4Value}</div>
        </div>
      </div>

      {/* 2-Columns: Top Downloads & Recent Activities */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalyticsTopLectures lectures={stats.topLectures} />
        <AnalyticsActivityLog
          title={isFilteredDept ? 'سجل النشاط الأكاديمي للقسم' : isCollegeAdmin ? 'سجل النشاط الأكاديمي للكلية' : 'سجل النشاط الأكاديمي العام'}
          activities={stats.activities}
        />
      </div>

      {/* Database Backup & Disaster Recovery (Super Admin only) */}
      {isSuper && <BackupRestoreCard />}
    </div>
  );
}
