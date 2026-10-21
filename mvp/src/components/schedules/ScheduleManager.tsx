// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file ScheduleManager.tsx
 * @description إدارة واستعراض جداول المحاضرات اليومية (السبت - الأربعاء) للطلاب والتدريسيين
 * @created 2026-10-21
 */
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Schedule, DayKey, WEEK_DAYS } from '@/types';
import { Calendar, Plus, Info } from 'lucide-react';
import ScheduleCard from './ScheduleCard';
import ScheduleAddModal from './ScheduleAddModal';
import ScheduleZoomModal from './ScheduleZoomModal';
import ScheduleDayFilter from './ScheduleDayFilter';

export default function ScheduleManager() {
  const { currentUser, colleges, schedules, deleteSchedule } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [zoomTarget, setZoomTarget] = useState<{ schedule: Schedule; day: DayKey } | null>(null);
  const [selectedGlobalDay, setSelectedGlobalDay] = useState<DayKey>('saturday');

  const isSuper = currentUser.role === 'super_admin';
  const isDean = currentUser.role === 'college_admin';
  const isHead = currentUser.role === 'department_admin';
  const isDoctor = currentUser.role === 'doctor';
  const isStudent = currentUser.role === 'student';

  // Strictly: only Head of Department and above can add schedules
  // Doctors and Students are strictly read-only
  const canManage = isSuper || isDean || isHead;

  const filteredSchedules = schedules.filter(sch => {
    if (isSuper) return true;
    if (isDean) return sch.collegeId === currentUser.collegeId;
    if (isHead) return sch.collegeId === currentUser.collegeId && sch.departmentId === currentUser.departmentId;
    if (isDoctor) {
      return !currentUser.departmentId || sch.departmentId === currentUser.departmentId;
    }
    // Student
    if (currentUser.collegeId && sch.collegeId !== currentUser.collegeId) return false;
    if (currentUser.departmentId && sch.departmentId !== currentUser.departmentId) return false;
    if (currentUser.stage && sch.stage !== currentUser.stage) return false;
    if (sch.sectionTarget !== 'all' && currentUser.sectionId && sch.sectionTarget !== currentUser.sectionId) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#041633] text-white flex items-center justify-center">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                جداول المحاضرات الأسبوعية
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                صور الجداول اليومية المعتمدة رسمياً من رئاسة القسم العلمي لمواعيد القاعات والمختبرات
              </p>
            </div>
          </div>
        </div>

        {/* Action Button: Exclusively for Department Head and above */}
        {canManage && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#041633] to-[#0c2b64] hover:from-[#0c2b64] hover:to-[#13408a] text-white text-xs font-black shadow-md shadow-slate-900/10 transition-all self-start md:self-auto"
          >
            <Plus className="w-4 h-4 text-cyan-300" />
            <span>إضافة جدول أسبوعي للمرحلة</span>
          </button>
        )}
      </div>

      {/* Global Day Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-700">تصفية حسب اليوم:</span>
          <span className="text-[11px] font-bold text-slate-400">
            (اختر اليوم لعرض جدول كافة المراحل)
          </span>
        </div>

        <ScheduleDayFilter
          selectedDay={selectedGlobalDay}
          onSelectDay={setSelectedGlobalDay}
          size="md"
        />
      </div>

      {/* Doctor & Student Notice */}
      {isDoctor && (
        <div className="bg-sky-50 border border-sky-200/80 p-3.5 rounded-2xl flex items-center gap-2.5 text-xs text-sky-900 font-bold">
          <Info className="w-4 h-4 text-sky-600 shrink-0" />
          <span>
            عزيزي التدريسي، يتم نشر وتحديث الجداول اليومية حصرياً من قِبل رئاسة القسم العلمي. يمكنك معاينة وتحميل جدول أي يوم مباشرة.
          </span>
        </div>
      )}

      {/* Grid of Schedules */}
      {filteredSchedules.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">لا يوجد جدول منشور حالياً لهذا القسم</h4>
          <p className="text-xs text-slate-500 mt-1">
            {canManage
              ? 'اضغط على زر (إضافة جدول أسبوعي للمرحلة) لرفع صور الجداول اليومية.'
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
                activeGlobalDay={selectedGlobalDay}
                deptName={dept?.name}
                onDelete={deleteSchedule}
                onZoom={(s, d) => setZoomTarget({ schedule: s, day: d })}
              />
            );
          })}
        </div>
      )}

      {/* Modal: Add New Schedule (Department Head and above) */}
      {modalOpen && canManage && (
        <ScheduleAddModal onClose={() => setModalOpen(false)} />
      )}

      {/* Lightbox Zoom Modal */}
      {zoomTarget && (
        <ScheduleZoomModal
          schedule={zoomTarget.schedule}
          activeDay={zoomTarget.day}
          onSelectDay={d => setZoomTarget(prev => prev ? { ...prev, day: d } : null)}
          onClose={() => setZoomTarget(null)}
        />
      )}
    </div>
  );
}
