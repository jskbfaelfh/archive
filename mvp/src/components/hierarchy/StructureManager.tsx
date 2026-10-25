'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Building2,
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import Select from '@/components/common/Select';

export default function StructureManager() {
  const {
    currentUser,
    colleges,
    sections,
    subjects,
    users,
    addCollege,
    updateCollege,
    deleteCollege,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    addSection,
    updateSection,
    deleteSection,
    addSubject,
    updateSubject,
    deleteSubject,
    integrationSettings,
  } = useApp();

  // Role flags
  const isSuper = currentUser.role === 'super_admin';
  const isCollegeAdmin = currentUser.role === 'college_admin';
  const isDeptAdmin = currentUser.role === 'department_admin';
  const isDoctor = currentUser.role === 'doctor';
  const isStudent = currentUser.role === 'student';

  // Filter colleges based on role
  const visibleColleges = colleges.filter((col) => {
    if (isSuper) return true;
    return col.id === currentUser.collegeId;
  });

  // Collapsible state
  const [openColleges, setOpenColleges] = useState<Record<string, boolean>>({});
  const [openDepts, setOpenDepts] = useState<Record<string, boolean>>({});

  // Modals state
  const [collegeModal, setCollegeModal] = useState<{ open: boolean; editId?: string; name: string }>({
    open: false,
    name: '',
  });

  const [deptModal, setDeptModal] = useState<{ open: boolean; collegeId: string; editId?: string; name: string; stagesCount: number }>({
    open: false,
    collegeId: '',
    name: '',
    stagesCount: 4,
  });

  const [sectionModal, setSectionModal] = useState<{ open: boolean; collegeId: string; departmentId: string; stage: number; editId?: string; name: string }>({
    open: false,
    collegeId: '',
    departmentId: '',
    stage: 1,
    name: '',
  });

  const [subjectModal, setSubjectModal] = useState<{
    open: boolean;
    collegeId: string;
    departmentId: string;
    stage: number;
    editId?: string;
    name: string;
    subjectType: 'both' | 'theory' | 'practical';
    theoryDoctorId?: string;
    practicalDoctorId?: string;
  }>({
    open: false,
    collegeId: '',
    departmentId: '',
    stage: 1,
    name: '',
    subjectType: 'both',
    theoryDoctorId: '',
    practicalDoctorId: '',
  });

  const toggleCollege = (id: string) => {
    setOpenColleges((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleDept = (id: string) => {
    setOpenDepts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const userCollege = colleges.find((c) => c.id === currentUser.collegeId);
  const userDept = userCollege?.departments.find((d) => d.id === currentUser.departmentId);

  return (
    <div className="space-y-6">
      {/* Scope Alert Badge */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-black text-slate-800">الصلاحية:</span>
          <span className="px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-800 border border-slate-300">
            {isSuper && 'سوبر أدمن'}
            {isCollegeAdmin && `عميد • ${userCollege?.name || ''}`}
            {isDeptAdmin && `رئيس قسم • ${userDept?.name || ''}`}
            {isDoctor && `تدريسي • ${userDept?.name || ''}`}
            {isStudent && 'طالب'}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900">الهيكلية الأكاديمية</h2>
        </div>

        {isSuper && !integrationSettings.isEnabled && (
          <button
            onClick={() => setCollegeModal({ open: true, name: '' })}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة كلية</span>
          </button>
        )}
      </div>

      {integrationSettings.isEnabled && (
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-bold flex items-center gap-2">
          <span>🔒</span>
          <span>تكامل الهيكلية المركزية مفعّل: تم إخفاء أزرار الإضافة وقفل إدخال الكليات والأقسام والشعب لضمان المزامنة التلقائية.</span>
        </div>
      )}

      {/* Warning if non-super has no college */}
      {!isSuper && !currentUser.collegeId && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-bold">
          ⚠️ الحساب غير مرتبط بكلية.
        </div>
      )}

      {/* Colleges Tree */}
      {visibleColleges.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">لا توجد كليات</p>
          {isSuper && !integrationSettings.isEnabled && (
            <button
              onClick={() => setCollegeModal({ open: true, name: '' })}
              className="mt-3 px-4 py-2 bg-sky-700 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              إضافة كلية
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {visibleColleges.map((col) => {
            const isColOpen = openColleges[col.id] !== false; // default open
            const depts = (col.departments || []).filter((dept) => {
              if (isSuper || isCollegeAdmin) return true;
              return dept.id === currentUser.departmentId;
            });
            const colAdmin = users.find((u) => u.role === 'college_admin' && u.collegeId === col.id);
            const canManageCollege = isSuper || (isCollegeAdmin && currentUser.collegeId === col.id);

            return (
              <div key={col.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                {/* College Header Row */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-3">
                  <div
                    onClick={() => toggleCollege(col.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <button className="text-slate-400 hover:text-slate-700">
                      {isColOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <Building2 className="w-5 h-5 text-sky-700 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900">{col.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        العميد:{' '}
                        {colAdmin ? (
                          <span className="font-bold text-sky-800">{colAdmin.name}</span>
                        ) : (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">غير معيّن</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Actions for College */}
                  <div className="flex items-center gap-1.5">
                    {canManageCollege && !integrationSettings.isEnabled && (
                      <button
                        onClick={() =>
                          setDeptModal({
                            open: true,
                            collegeId: col.id,
                            name: '',
                            stagesCount: 4,
                          })
                        }
                        className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>إضافة قسم</span>
                      </button>
                    )}

                    {canManageCollege && (
                      <button
                        onClick={() =>
                          setCollegeModal({
                            open: true,
                            editId: col.id,
                            name: col.name,
                          })
                        }
                        className="p-1.5 text-slate-500 hover:text-sky-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="تعديل الكلية"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}

                    {isSuper && (
                      <button
                        onClick={() => {
                          if (confirm(`حذف "${col.name}" وجميع أقسامها وشعبها ومحاضراتها نهائياً؟`)) {
                            deleteCollege(col.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="حذف الكلية"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Departments Container */}
                {isColOpen && (
                  <div className="p-4 bg-white space-y-4">
                    {depts.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">
                        لا توجد أقسام.
                      </p>
                    ) : (
                      depts.map((dept) => {
                        const isDeptOpen = openDepts[dept.id] !== false;
                        const stagesArray = Array.from({ length: dept.stagesCount }, (_, i) => i + 1);
                        const deptAdmin = users.find((u) => u.role === 'department_admin' && u.departmentId === dept.id);

                        return (
                          <div
                            key={dept.id}
                            className="mr-3 border-r-2 border-teal-500 pr-4 rounded-xl bg-slate-50/50 p-4 border border-slate-200/80 space-y-3"
                          >
                            {/* Department Header Row */}
                            <div className="flex items-center justify-between gap-3">
                              <div
                                onClick={() => toggleDept(dept.id)}
                                className="flex items-center gap-2 cursor-pointer flex-1 min-w-0"
                              >
                                <button className="text-slate-400">
                                  {isDeptOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </button>
                                <FolderTree className="w-4 h-4 text-teal-700 shrink-0" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs sm:text-sm text-slate-900">{dept.name}</span>
                                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-bold">
                                      {dept.stagesCount} مراحل
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    رئيس القسم:{' '}
                                    {deptAdmin ? (
                                      <span className="font-bold text-teal-800">{deptAdmin.name}</span>
                                    ) : (
                                      <span className="text-amber-700 font-medium bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">غير معيّن</span>
                                    )}
                                  </p>
                                </div>
                              </div>

                              {/* Department Actions */}
                              {canManageCollege && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      setDeptModal({
                                        open: true,
                                        collegeId: col.id,
                                        editId: dept.id,
                                        name: dept.name,
                                        stagesCount: dept.stagesCount,
                                      })
                                    }
                                    className="p-1 text-slate-400 hover:text-sky-700 rounded cursor-pointer"
                                    title="تعديل القسم"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (confirm(`حذف قسم "${dept.name}" وشعبه ومواده؟`)) {
                                        deleteDepartment(col.id, dept.id);
                                      }
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                    title="حذف القسم"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Stages & Sections inside Dept */}
                            {isDeptOpen && (
                              <div className="space-y-3 pt-2">
                                {stagesArray
                                  .filter((stg) => {
                                    if (isStudent && currentUser.stage) return stg === currentUser.stage;
                                    return true;
                                  })
                                  .map((stg) => {
                                    const canManageInDept =
                                      isSuper ||
                                      (isCollegeAdmin && currentUser.collegeId === col.id) ||
                                      (isDeptAdmin && currentUser.departmentId === dept.id);

                                    const stageSections = sections
                                      .filter(
                                        (s) => s.collegeId === col.id && s.departmentId === dept.id && s.stage === stg
                                      )
                                      .filter((s) => {
                                        if (isStudent && currentUser.sectionId) return s.id === currentUser.sectionId;
                                        return true;
                                      });

                                    const stageSubjects = subjects.filter(
                                      (sub) => sub.collegeId === col.id && sub.departmentId === dept.id && sub.stage === stg
                                    );

                                    return (
                                      <div
                                        key={stg}
                                        className="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-2"
                                      >
                                        {/* Stage Bar */}
                                        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100">
                                          <div className="flex items-center gap-2">
                                            <span className="font-extrabold text-slate-800">المرحلة {stg}</span>
                                            <span className="text-[10px] text-slate-400">
                                              ({stageSections.length} شُعب • {stageSubjects.length} مواد)
                                            </span>
                                          </div>

                                          {canManageInDept && (
                                            <div className="flex items-center gap-2">
                                              {!integrationSettings.isEnabled && (
                                                <button
                                                  onClick={() =>
                                                    setSectionModal({
                                                      open: true,
                                                      collegeId: col.id,
                                                      departmentId: dept.id,
                                                      stage: stg,
                                                      name: '',
                                                    })
                                                  }
                                                  className="px-2 py-0.5 bg-sky-50 text-sky-800 hover:bg-sky-100 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                                >
                                                  <Plus className="w-3 h-3" />
                                                  <span>إضافة شعبة</span>
                                                </button>
                                              )}

                                              <button
                                                onClick={() =>
                                                  setSubjectModal({
                                                    open: true,
                                                    collegeId: col.id,
                                                    departmentId: dept.id,
                                                    stage: stg,
                                                    name: '',
                                                    subjectType: 'both',
                                                    theoryDoctorId: '',
                                                    practicalDoctorId: '',
                                                  })
                                                }
                                                className="px-2 py-0.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                              >
                                                <Plus className="w-3 h-3" />
                                                <span>إضافة مادة</span>
                                              </button>
                                            </div>
                                          )}
                                        </div>

                                        {/* Sections Pills */}
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-slate-400 font-semibold text-[10px]">الشُعب:</span>
                                          {stageSections.length === 0 ? (
                                            <span className="text-slate-400 text-[10px]">لا توجد شُعب</span>
                                          ) : (
                                            stageSections.map((sec) => (
                                              <div
                                                key={sec.id}
                                                className="bg-slate-100 hover:bg-slate-200/80 text-slate-800 px-2 py-1 rounded-lg flex items-center gap-1.5"
                                              >
                                                <span className="font-bold text-[11px]">{sec.name}</span>
                                                {canManageInDept && (
                                                  <>
                                                    <button
                                                      onClick={() =>
                                                        setSectionModal({
                                                          open: true,
                                                          collegeId: col.id,
                                                          departmentId: dept.id,
                                                          stage: stg,
                                                          editId: sec.id,
                                                          name: sec.name,
                                                        })
                                                      }
                                                      className="text-slate-400 hover:text-sky-700 cursor-pointer"
                                                      title="تعديل"
                                                    >
                                                      <Edit2 className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        if (confirm(`حذف ${sec.name}؟`)) deleteSection(sec.id);
                                                      }}
                                                      className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                                      title="حذف"
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                    </button>
                                                  </>
                                                )}
                                              </div>
                                            ))
                                          )}
                                        </div>

                                        {/* Subjects Pills */}
                                        <div className="flex items-center gap-2 flex-wrap pt-1">
                                          <span className="text-slate-400 font-semibold text-[10px]">المواد:</span>
                                          {stageSubjects.length === 0 ? (
                                            <span className="text-slate-400 text-[10px]">لا توجد مواد</span>
                                          ) : (
                                            stageSubjects.map((sub) => (
                                              <div
                                                key={sub.id}
                                                className="bg-emerald-50 text-emerald-950 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[11px]"
                                              >
                                                <span className="font-bold">{sub.name}</span>
                                                <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-cyan-100 text-cyan-900 border border-cyan-300">
                                                  {sub.subjectType === 'theory' ? 'نظري' : sub.subjectType === 'practical' ? 'عملي' : 'نظري + عملي'}
                                                </span>
                                                {sub.subjectType === 'theory' ? (
                                                  <span className="text-[10px] bg-white text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-300">
                                                    {sub.theoryDoctorName || sub.doctorName || 'شاغر'}
                                                  </span>
                                                ) : sub.subjectType === 'practical' ? (
                                                  <span className="text-[10px] bg-white text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-300">
                                                    {sub.practicalDoctorName || sub.doctorName || 'شاغر'}
                                                  </span>
                                                ) : (
                                                  <span className="text-[10px] bg-white text-emerald-800 px-1.5 py-0.5 rounded font-bold border border-emerald-300">
                                                    {sub.theoryDoctorId === sub.practicalDoctorId && sub.theoryDoctorName
                                                      ? `${sub.theoryDoctorName}`
                                                      : `ن: ${sub.theoryDoctorName || 'شاغر'} • ع: ${sub.practicalDoctorName || 'شاغر'}`}
                                                  </span>
                                                )}
                                                {canManageInDept && (
                                                  <>
                                                    <button
                                                      onClick={() =>
                                                        setSubjectModal({
                                                          open: true,
                                                          collegeId: col.id,
                                                          departmentId: dept.id,
                                                          stage: stg,
                                                          editId: sub.id,
                                                          name: sub.name,
                                                          subjectType: sub.subjectType || 'both',
                                                          theoryDoctorId: sub.theoryDoctorId || sub.doctorId || '',
                                                          practicalDoctorId: sub.practicalDoctorId || '',
                                                        })
                                                      }
                                                      className="text-emerald-700 hover:text-emerald-950 cursor-pointer"
                                                      title="تعديل المادة أو تغيير الأستاذ"
                                                    >
                                                      <Edit2 className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                      onClick={() => {
                                                        if (confirm(`حذف مقرر "${sub.name}"؟`)) deleteSubject(sub.id);
                                                      }}
                                                      className="text-emerald-600 hover:text-rose-600 cursor-pointer"
                                                    >
                                                      <Trash2 className="w-3 h-3" />
                                                    </button>
                                                  </>
                                                )}
                                              </div>
                                            ))
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: College */}
      {collegeModal.open && (
        <div className="fixed inset-0 z-50 bg-[#02091b]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-sm p-5 space-y-3.5 border border-slate-200">
            <h3 className="font-black text-sm text-[#041633] text-right">
              {collegeModal.editId ? 'تعديل بيانات الكلية' : 'إضافة كلية جديدة'}
            </h3>
            <div>
              <label className="block text-[13px] font-bold text-slate-800 mb-1 text-right">اسم الكلية</label>
              <input
                type="text"
                required
                value={collegeModal.name}
                onChange={(e) => setCollegeModal({ ...collegeModal, name: e.target.value })}
                placeholder="مثال: كلية العلوم الطبية..."
                className={`w-full text-[13px] font-bold text-slate-900 placeholder:text-slate-400 p-2.5 rounded-[7px] bg-white border border-slate-300 focus:border-sky-600 focus:outline-none transition-all shadow-2xs ${
                  !collegeModal.name.trim() ? 'border-s-[3px] border-s-rose-500' : 'border-s-[3px] border-s-emerald-500'
                }`}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setCollegeModal({ ...collegeModal, open: false })}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (!collegeModal.name.trim()) return;
                  if (collegeModal.editId) {
                    updateCollege(collegeModal.editId, {
                      name: collegeModal.name,
                    });
                  } else {
                    addCollege({
                      name: collegeModal.name,
                    });
                  }
                  setCollegeModal({ ...collegeModal, open: false });
                }}
                className="px-5 py-2 text-xs bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl cursor-pointer font-black shadow-md shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                حفظ الكلية
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Department */}
      {deptModal.open && (
        <div className="fixed inset-0 z-50 bg-[#02091b]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-sm p-5 space-y-3.5 border border-slate-200">
            <h3 className="font-black text-sm text-[#041633] text-right">
              {deptModal.editId ? 'تعديل بيانات القسم' : 'إضافة قسم علمي جديد'}
            </h3>
            <div>
              <label className="block text-[13px] font-bold text-slate-800 mb-1 text-right">اسم القسم</label>
              <input
                type="text"
                required
                value={deptModal.name}
                onChange={(e) => setDeptModal({ ...deptModal, name: e.target.value })}
                placeholder="مثال: قسم التخدير والعناية..."
                className={`w-full text-[13px] font-bold text-slate-900 placeholder:text-slate-400 p-2.5 rounded-[7px] bg-white border border-slate-300 focus:border-sky-600 focus:outline-none transition-all shadow-2xs ${
                  !deptModal.name.trim() ? 'border-s-[3px] border-s-rose-500' : 'border-s-[3px] border-s-emerald-500'
                }`}
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-slate-800 mb-1 text-right">عدد المراحل الدراسية</label>
              <select
                value={deptModal.stagesCount}
                onChange={(e) => setDeptModal({ ...deptModal, stagesCount: Number(e.target.value) })}
                className="w-full text-[13px] font-bold text-slate-900 p-2.5 rounded-[7px] bg-white border border-slate-300 focus:border-sky-600 focus:outline-none shadow-2xs"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} مراحل
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setDeptModal({ ...deptModal, open: false })}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (!deptModal.name.trim()) return;
                  if (deptModal.editId) {
                    updateDepartment(deptModal.collegeId, deptModal.editId, {
                      name: deptModal.name,
                      stagesCount: deptModal.stagesCount,
                    });
                  } else {
                    addDepartment(deptModal.collegeId, {
                      name: deptModal.name,
                      stagesCount: deptModal.stagesCount,
                    });
                  }
                  setDeptModal({ ...deptModal, open: false });
                }}
                className="px-5 py-2 text-xs bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl cursor-pointer font-black shadow-md shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                حفظ القسم
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Section */}
      {sectionModal.open && (
        <div className="fixed inset-0 z-50 bg-[#02091b]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-sm p-5 space-y-3.5 border border-slate-200">
            <h3 className="font-black text-sm text-[#041633] text-right">
              {sectionModal.editId ? 'تعديل الشعبة' : `إضافة شعبة • المرحلة ${sectionModal.stage}`}
            </h3>
            <div>
              <label className="block text-[13px] font-bold text-slate-800 mb-1 text-right">اسم أو رمز الشعبة</label>
              <input
                type="text"
                required
                value={sectionModal.name}
                onChange={(e) => setSectionModal({ ...sectionModal, name: e.target.value })}
                placeholder="شعبة (أ)، شعبة (ب)..."
                className={`w-full text-[13px] font-bold text-slate-900 placeholder:text-slate-400 p-2.5 rounded-[7px] bg-white border border-slate-300 focus:border-sky-600 focus:outline-none transition-all shadow-2xs ${
                  !sectionModal.name.trim() ? 'border-s-[3px] border-s-rose-500' : 'border-s-[3px] border-s-emerald-500'
                }`}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSectionModal({ ...sectionModal, open: false })}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (!sectionModal.name.trim()) return;
                  if (sectionModal.editId) {
                    updateSection(sectionModal.editId, {
                      name: sectionModal.name,
                    });
                  } else {
                    addSection({
                      name: sectionModal.name,
                      collegeId: sectionModal.collegeId,
                      departmentId: sectionModal.departmentId,
                      stage: sectionModal.stage,
                    });
                  }
                  setSectionModal({ ...sectionModal, open: false });
                }}
                className="px-5 py-2 text-xs bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl cursor-pointer font-black shadow-md shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                حفظ الشعبة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Subject */}
      {subjectModal.open && (
        <div className="fixed inset-0 z-50 bg-[#02091b]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-sm p-5 space-y-3.5 border border-slate-200">
            <h3 className="font-black text-sm text-[#041633] text-right">
              {subjectModal.editId ? 'تعديل المادة الدراسية' : `إضافة مادة • المرحلة ${subjectModal.stage}`}
            </h3>
            <div>
              <label className="block text-[13px] font-bold text-slate-800 mb-1 text-right">اسم المادة</label>
              <input
                type="text"
                required
                value={subjectModal.name}
                onChange={(e) => setSubjectModal({ ...subjectModal, name: e.target.value })}
                placeholder="اسم المادة العلمية..."
                className={`w-full text-[13px] font-bold text-slate-900 placeholder:text-slate-400 p-2.5 rounded-[7px] bg-white border border-slate-300 focus:border-sky-600 focus:outline-none transition-all shadow-2xs ${
                  !subjectModal.name.trim() ? 'border-s-[3px] border-s-rose-500' : 'border-s-[3px] border-s-emerald-500'
                }`}
              />
            </div>
            <div>
              <label className="block text-[12px] font-bold text-slate-700 mb-1.5 text-right">طبيعة المادة</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSubjectModal({ ...subjectModal, subjectType: 'both' })}
                  className={`py-1.5 rounded-lg transition-all ${
                    subjectModal.subjectType === 'both' ? 'bg-[#041633] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  نظري وعملي
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectModal({ ...subjectModal, subjectType: 'theory' })}
                  className={`py-1.5 rounded-lg transition-all ${
                    subjectModal.subjectType === 'theory' ? 'bg-[#041633] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  نظري فقط
                </button>
                <button
                  type="button"
                  onClick={() => setSubjectModal({ ...subjectModal, subjectType: 'practical' })}
                  className={`py-1.5 rounded-lg transition-all ${
                    subjectModal.subjectType === 'practical' ? 'bg-[#041633] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  عملي فقط
                </button>
              </div>
            </div>

            {(subjectModal.subjectType === 'theory' || subjectModal.subjectType === 'both') && (
              <div>
                <Select
                  label="أستاذ المحاضرات النظرية"
                  value={subjectModal.theoryDoctorId || ''}
                  onChange={(val) => setSubjectModal({ ...subjectModal, theoryDoctorId: val })}
                  placeholder="-- بدون تدريسي --"
                  options={[
                    { value: '', label: '-- بدون تدريسي --' },
                    ...users
                      .filter((u) => u.role === 'doctor' && u.departmentId === subjectModal.departmentId)
                      .map((doc) => ({ value: doc.id, label: doc.name })),
                  ]}
                />
              </div>
            )}

            {(subjectModal.subjectType === 'practical' || subjectModal.subjectType === 'both') && (
              <div>
                <Select
                  label="أستاذ المختبر / الدروس العملية"
                  value={subjectModal.practicalDoctorId || ''}
                  onChange={(val) => setSubjectModal({ ...subjectModal, practicalDoctorId: val })}
                  placeholder="-- بدون تدريسي --"
                  options={[
                    { value: '', label: '-- بدون تدريسي --' },
                    ...users
                      .filter((u) => u.role === 'doctor' && u.departmentId === subjectModal.departmentId)
                      .map((doc) => ({ value: doc.id, label: doc.name })),
                  ]}
                />
              </div>
            )}

            {subjectModal.subjectType === 'both' && (
              <p className="text-[11px] text-sky-800 bg-sky-50 border border-sky-200 p-2 rounded-xl font-medium">
                💡 يمكنك اختيار نفس التدريسي للاثنين معاً، أو اختيار أستاذين مختلفين للنظري والعملي.
              </p>
            )}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSubjectModal({ ...subjectModal, open: false })}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer font-bold"
              >
                إلغاء
              </button>
              <button
                onClick={() => {
                  if (!subjectModal.name.trim()) return;
                  const theoryDoc = users.find((u) => u.id === subjectModal.theoryDoctorId);
                  const practicalDoc = users.find((u) => u.id === subjectModal.practicalDoctorId);
                  const primaryDoc = theoryDoc || practicalDoc;

                  const payload = {
                    name: subjectModal.name.trim(),
                    subjectType: subjectModal.subjectType,
                    doctorId: primaryDoc?.id || undefined,
                    doctorName: primaryDoc?.name,
                    theoryDoctorId: (subjectModal.subjectType === 'theory' || subjectModal.subjectType === 'both') ? (subjectModal.theoryDoctorId || undefined) : undefined,
                    theoryDoctorName: (subjectModal.subjectType === 'theory' || subjectModal.subjectType === 'both') ? theoryDoc?.name : undefined,
                    practicalDoctorId: (subjectModal.subjectType === 'practical' || subjectModal.subjectType === 'both') ? (subjectModal.practicalDoctorId || undefined) : undefined,
                    practicalDoctorName: (subjectModal.subjectType === 'practical' || subjectModal.subjectType === 'both') ? practicalDoc?.name : undefined,
                  };

                  if (subjectModal.editId) {
                    updateSubject(subjectModal.editId, payload);
                  } else {
                    addSubject({
                      ...payload,
                      collegeId: subjectModal.collegeId,
                      departmentId: subjectModal.departmentId,
                      stage: subjectModal.stage,
                      semester: 1,
                    });
                  }
                  setSubjectModal({ ...subjectModal, open: false });
                }}
                className="px-5 py-2 text-xs bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl cursor-pointer font-black shadow-md shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                حفظ المادة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
