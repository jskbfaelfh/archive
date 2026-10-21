// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file ScheduleManager.tsx
 * @description إدارة واستعراض الجداول الأسبوعية للطلاب والأساتذة التدريسيين
 * @created 2026-10-21
 */
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Schedule } from '@/types';
import { Calendar, Plus, UserCheck, GraduationCap, Layers } from 'lucide-react';
import ScheduleCard from './ScheduleCard';
import ScheduleAddModal from './ScheduleAddModal';
import ScheduleZoomModal from './ScheduleZoomModal';

export default function ScheduleManager() {
  const { currentUser, colleges, schedules, deleteSchedule } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [zoomTarget, setZoomTarget] = useState<Schedule | null>(null);
  const [viewFilter, setViewFilter] = useState<'all' | 'stage' | 'doctor'>('all');

  const isSuper = currentUser.role === 'super_admin';
  const isDean = currentUser.role === 'college_admin';
  const isHead = currentUser.role === 'department_admin';
  const isDoctor = currentUser.role === 'doctor';
  const isStudent = currentUser.role === 'student';

  const canManage = isSuper || isDean || isHead;

  // Filter schedules based on user role and selected viewFilter
  const filteredSchedules = schedules.filter(sch => {
    // 1. Department scoping
    if (isDean && sch.collegeId !== currentUser.collegeId) return false;
    if (isHead && (sch.collegeId !== currentUser.collegeId || sch.departmentId !== currentUser.departmentId)) {
      return false;
    }

    // 2. Doctor:
    if (isDoctor) {
      if (viewFilter === 'doctor') {
        return sch.targetType === 'doctor' && sch.doctorId === currentUser.id;
      }
      if (viewFilter === 'stage') {
        return sch.targetType === 'stage' && sch.departmentId === currentUser.departmentId;
      }
      // 'all' for doctor: show personal doctor schedule + stage schedules of their department
      return (
        (sch.targetType === 'doctor' && sch.doctorId === currentUser.id) ||
        (sch.targetType === 'stage' && sch.departmentId === currentUser.departmentId)
      );
    }

    // 3. Student:
    if (isStudent) {
      if (sch.targetType !== 'stage') return false;
      if (currentUser.collegeId && sch.collegeId !== currentUser.collegeId) return false;
      if (currentUser.departmentId && sch.departmentId !== currentUser.departmentId) return false;
      if (currentUser.stage && sch.stage !== currentUser.stage) return false;
      if (sch.sectionTarget !== 'all' && currentUser.sectionId && sch.sectionTarget !== currentUser.sectionId) {
        return false;
      }
      return true;
    }

    // 4. Admin filter
    if (viewFilter !== 'all' && sch.targetType !== viewFilter) return false;
    return true;
  });

  // Doctor's personal schedule check
  const myPersonalDoctorSchedule = schedules.find(
    s => s.targetType === 'doctor' && s.doctorId === currentUser.id
  );

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#041633] text-white flex items-center justify-center">
            <Calendar className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">
              الجداول الأسبوعية المعتمدة
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              {isDoctor
                ? 'استعراض جدولك الأسبوعي الشخصي ومواعيد محاضرات المراحل الدراسية في القسم'
                : 'جداول المحاضرات والمختبرات الأسبوعية للطلاب والتدريسيين'}
            </p>
          </div>
        </div>

        {/* Action Button: Head and above */}
        {canManage && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#041633] to-[#0c2b64] hover:from-[#0c2b64] hover:to-[#13408a] text-white text-xs font-black shadow-md shadow-slate-900/10 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-cyan-300" />
            <span>إضافة جدول أسبوعي</span>
          </button>
        )}
      </div>

      {/* Filter Tabs for Admin & Doctor */}
      {!isStudent && (
        <div className="flex flex-wrap items-center gap-2 bg-slate-200/80 p-1.5 rounded-2xl w-fit">
          <button
            onClick={() => setViewFilter('all')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              viewFilter === 'all' ? 'bg-[#041633] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>كافة الجداول</span>
          </button>

          {isDoctor ? (
            <button
              onClick={() => setViewFilter('doctor')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                viewFilter === 'doctor' ? 'bg-[#041633] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>جدولي الأسبوعي الشخصي</span>
            </button>
          ) : (
            <button
              onClick={() => setViewFilter('doctor')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
                viewFilter === 'doctor' ? 'bg-[#041633] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>جداول التدريسيين</span>
            </button>
          )}

          <button
            onClick={() => setViewFilter('stage')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              viewFilter === 'stage' ? 'bg-[#041633] text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>جداول المراحل (للطلاب)</span>
          </button>
        </div>
      )}

      {/* Grid of Schedules */}
      {filteredSchedules.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">لا يوجد جدول أسبوعي منشور حالياً</h4>
          <p className="text-xs text-slate-500 mt-1">
            {canManage
              ? 'اضغط على زر (إضافة جدول أسبوعي) لنشر جدول الطلاب أو الأساتذة.'
              : 'سيقوم رئيس القسم باعتماد ونشر الجداول قريباً.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSchedules.map(sch => {
            const col = colleges.find(c => c.id === sch.collegeId);
            const dept = col?.departments.find(d => d.id === sch.departmentId);

            return (
              <ScheduleCard
                key={sch.id}
                schedule={sch}
                canManage={canManage}
                deptName={dept?.name}
                onDelete={deleteSchedule}
                onZoom={s => setZoomTarget(s)}
              />
            );
          })}
        </div>
      )}

      {/* Modal: Add New Schedule */}
      {modalOpen && canManage && (
        <ScheduleAddModal onClose={() => setModalOpen(false)} />
      )}

      {/* Lightbox Zoom Modal */}
      {zoomTarget && (
        <ScheduleZoomModal
          schedule={zoomTarget}
          onClose={() => setZoomTarget(null)}
        />
      )}
    </div>
  );
}
