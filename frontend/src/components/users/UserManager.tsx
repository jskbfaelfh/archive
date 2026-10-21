'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { User, UserRole, Subject } from '@/types';
import {
  UserPlus,
  Edit2,
  Trash2,
  Shield,
  FileSpreadsheet,
  Download,
  Loader2,
  CheckCircle2,
  X,
} from 'lucide-react';
import Select from '@/components/common/Select';

export default function UserManager() {
  const { users, colleges, sections, subjects, addUser, updateUser, deleteUser, updateSubject, currentUser, refreshData } = useApp();

  const isSuper = currentUser.role === 'super_admin';
  const isCollegeAdmin = currentUser.role === 'college_admin';
  const isDeptAdmin = currentUser.role === 'department_admin';
  const canManageUsers = isSuper || isCollegeAdmin || isDeptAdmin;

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('doctor');
  const [title, setTitle] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [stage, setStage] = useState<number>(1);
  const [sectionId, setSectionId] = useState('');

  // Doctor Subject Assignments
  const [doctorSubjectAssignments, setDoctorSubjectAssignments] = useState<
    Record<string, { selected: boolean; role: 'both' | 'theory' | 'practical' }>
  >({});

  // Excel Bulk Import States
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    count: number;
    errors: string[];
    createdAccounts?: { name: string; email: string; tempPassword: string; role: string }[];
  } | null>(null);

  // Single Created User Success Modal/Banner
  const [createdUserNotice, setCreatedUserNotice] = useState<{
    name: string;
    email: string;
    tempPassword?: string;
  } | null>(null);

  const handleImportExcel = async () => {
    if (!importFile) return;
    setIsImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      const res = await fetch('/api/users/import', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setImportResult({
          count: data.importedCount,
          errors: data.errors || [],
          createdAccounts: data.createdAccounts || [],
        });
        await refreshData();
      } else {
        alert(data.error || 'فشل استيراد الملف');
      }
    } catch {
      alert('حدث خطأ أثناء رفع ومعالجة ملف الإكسل');
    } finally {
      setIsImporting(false);
    }
  };

  // Visible users based on scope
  const visibleUsers = users.filter((u) => {
    if (isSuper) return true;
    if (isCollegeAdmin) return u.collegeId === currentUser.collegeId;
    if (isDeptAdmin) return u.collegeId === currentUser.collegeId && u.departmentId === currentUser.departmentId;
    return false;
  });

  // Selected College & Departments
  const effectiveCollegeId = isSuper ? collegeId : (currentUser.collegeId || '');
  const selectedCollege = colleges.find((c) => c.id === effectiveCollegeId);
  const availableDepts = isDeptAdmin
    ? (selectedCollege?.departments || []).filter((d) => d.id === currentUser.departmentId)
    : (selectedCollege?.departments || []);

  // Available sections for chosen dept and stage
  const effectiveDeptId = isDeptAdmin ? (currentUser.departmentId || '') : departmentId;
  const availableSections = sections.filter(
    (s) => s.collegeId === effectiveCollegeId && s.departmentId === effectiveDeptId && s.stage === stage
  );
  const availableDeptSubjects = subjects.filter(
    (s) => !effectiveDeptId || s.departmentId === effectiveDeptId
  );

  const getAllowedRoles = (): { role: UserRole; label: string }[] => {
    if (isSuper) {
      return [
        { role: 'college_admin', label: 'عميد كلية' },
        { role: 'department_admin', label: 'رئيس قسم' },
        { role: 'doctor', label: 'تدريسي' },
        { role: 'student', label: 'طالب' },
        { role: 'super_admin', label: 'سوبر أدمن' },
      ];
    }
    if (isCollegeAdmin) {
      return [
        { role: 'department_admin', label: 'رئيس قسم' },
        { role: 'doctor', label: 'تدريسي' },
        { role: 'student', label: 'طالب' },
      ];
    }
    if (isDeptAdmin) {
      return [
        { role: 'doctor', label: 'تدريسي' },
        { role: 'student', label: 'طالب' },
      ];
    }
    return [];
  };

  const openAddModal = () => {
    setEditId(null);
    setName('');
    setEmail('');
    setTitle('');
    
    const allowed = getAllowedRoles();
    setRole(allowed[0]?.role || 'student');

    if (isSuper) {
      const firstCol = colleges[0]?.id || '';
      setCollegeId(firstCol);
      const firstDept = colleges[0]?.departments[0]?.id || '';
      setDepartmentId(firstDept);
    } else if (isCollegeAdmin) {
      const colId = currentUser.collegeId || '';
      setCollegeId(colId);
      const myCol = colleges.find((c) => c.id === colId);
      setDepartmentId(myCol?.departments[0]?.id || '');
    } else if (isDeptAdmin) {
      setCollegeId(currentUser.collegeId || '');
      setDepartmentId(currentUser.departmentId || '');
    }

    setStage(1);
    setSectionId('');
    setDoctorSubjectAssignments({});
    setModalOpen(true);
  };

  const openEditModal = (u: User) => {
    setEditId(u.id);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setTitle(u.title || '');
    setCollegeId(u.collegeId || currentUser.collegeId || colleges[0]?.id || '');
    setDepartmentId(u.departmentId || currentUser.departmentId || '');
    setStage(u.stage || 1);
    setSectionId(u.sectionId || '');

    if (u.role === 'doctor') {
      const existing: Record<string, { selected: boolean; role: 'both' | 'theory' | 'practical' }> = {};
      subjects.forEach((sub) => {
        const isTheory = sub.theoryDoctorId === u.id;
        const isPractical = sub.practicalDoctorId === u.id;
        const isPrimary = sub.doctorId === u.id;
        if (isTheory || isPractical || isPrimary) {
          let r: 'both' | 'theory' | 'practical' = 'both';
          if (isTheory && isPractical) r = 'both';
          else if (isTheory) r = 'theory';
          else if (isPractical) r = 'practical';
          else r = sub.subjectType === 'practical' ? 'practical' : 'theory';
          existing[sub.id] = { selected: true, role: r };
        }
      });
      setDoctorSubjectAssignments(existing);
    } else {
      setDoctorSubjectAssignments({});
    }

    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const targetCollegeId = isSuper ? collegeId : currentUser.collegeId;
    const targetDeptId = isDeptAdmin ? currentUser.departmentId : departmentId;

    // Strict validation for students
    if (role === 'student') {
      if (!targetCollegeId || !targetDeptId || !sectionId) {
        alert('يرجى تحديد الكلية والقسم والمرحلة والشعبة!');
        return;
      }
    }

    const sec = sections.find((s) => s.id === sectionId);
    let savedDoctorId: string | undefined = editId || undefined;

    if (editId) {
      await updateUser(editId, {
        name,
        email,
        role,
        title,
        collegeId: role === 'super_admin' ? undefined : targetCollegeId,
        departmentId: (role === 'department_admin' || role === 'doctor' || role === 'student') ? targetDeptId : undefined,
        stage: role === 'student' ? stage : undefined,
        sectionId: role === 'student' ? sectionId : undefined,
        sectionName: role === 'student' ? sec?.name : undefined,
      });
    } else {
      const result = (await addUser({
        name,
        email,
        role,
        title: title || (role === 'college_admin' ? 'عميد' : role === 'department_admin' ? 'رئيس قسم' : role === 'doctor' ? 'تدريسي' : 'طالب'),
        collegeId: role === 'super_admin' ? undefined : targetCollegeId,
        departmentId: (role === 'department_admin' || role === 'doctor' || role === 'student') ? targetDeptId : undefined,
        stage: role === 'student' ? stage : undefined,
        sectionId: role === 'student' ? sectionId : undefined,
        sectionName: role === 'student' ? sec?.name : undefined,
      })) as { tempPassword?: string; user?: User } | undefined;

      savedDoctorId = result?.user?.id;

      if (result?.tempPassword) {
        setCreatedUserNotice({
          name,
          email,
          tempPassword: result.tempPassword,
        });
      }
    }

    // Sync doctor subjects if role === 'doctor'
    if (role === 'doctor' && savedDoctorId) {
      const relevantSubjects = subjects.filter(
        (s) => !targetDeptId || s.departmentId === targetDeptId
      );
      for (const sub of relevantSubjects) {
        const assignment = doctorSubjectAssignments[sub.id];
        if (assignment?.selected) {
          const r = assignment.role;
          const updates: Partial<Subject> = {};
          if (r === 'theory') {
            updates.theoryDoctorId = savedDoctorId;
            updates.theoryDoctorName = name;
            updates.doctorId = savedDoctorId;
            updates.doctorName = name;
            if (sub.practicalDoctorId === savedDoctorId) {
              updates.practicalDoctorId = undefined;
              updates.practicalDoctorName = undefined;
            }
          } else if (r === 'practical') {
            updates.practicalDoctorId = savedDoctorId;
            updates.practicalDoctorName = name;
            if (sub.theoryDoctorId === savedDoctorId) {
              updates.theoryDoctorId = undefined;
              updates.theoryDoctorName = undefined;
            }
          } else {
            updates.theoryDoctorId = savedDoctorId;
            updates.theoryDoctorName = name;
            updates.practicalDoctorId = savedDoctorId;
            updates.practicalDoctorName = name;
            updates.doctorId = savedDoctorId;
            updates.doctorName = name;
          }
          await updateSubject(sub.id, updates);
        } else {
          const wasAssigned =
            sub.theoryDoctorId === savedDoctorId ||
            sub.practicalDoctorId === savedDoctorId ||
            sub.doctorId === savedDoctorId;
          if (wasAssigned) {
            const updates: Partial<Subject> = {};
            if (sub.theoryDoctorId === savedDoctorId) {
              updates.theoryDoctorId = undefined;
              updates.theoryDoctorName = undefined;
            }
            if (sub.practicalDoctorId === savedDoctorId) {
              updates.practicalDoctorId = undefined;
              updates.practicalDoctorName = undefined;
            }
            if (sub.doctorId === savedDoctorId) {
              updates.doctorId = undefined;
              updates.doctorName = undefined;
            }
            await updateSubject(sub.id, updates);
          }
        }
      }
    }

    setModalOpen(false);
  };

  const canEditUser = (u: User) => {
    if (isSuper) return true;
    if (isCollegeAdmin) return u.collegeId === currentUser.collegeId && u.role !== 'super_admin' && (u.role !== 'college_admin' || u.id === currentUser.id);
    if (isDeptAdmin) return u.collegeId === currentUser.collegeId && u.departmentId === currentUser.departmentId && (u.role === 'doctor' || u.role === 'student');
    return false;
  };

  const canDeleteUser = (u: User) => {
    if (u.id === currentUser.id) return false;
    if (isSuper) return u.role !== 'super_admin';
    if (isCollegeAdmin) return u.collegeId === currentUser.collegeId && u.role !== 'super_admin' && u.role !== 'college_admin';
    if (isDeptAdmin) return u.collegeId === currentUser.collegeId && u.departmentId === currentUser.departmentId && (u.role === 'doctor' || u.role === 'student');
    return false;
  };

  const getRoleBadge = (r: UserRole) => {
    switch (r) {
      case 'super_admin':
        return <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded text-[11px]">سوبر أدمن</span>;
      case 'college_admin':
        return <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded text-[11px]">عميد كلية</span>;
      case 'department_admin':
        return <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[11px]">رئيس قسم</span>;
      case 'doctor':
        return <span className="bg-teal-50 text-teal-700 font-bold px-2 py-0.5 rounded text-[11px]">تدريسي</span>;
      default:
        return <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[11px]">طالب</span>;
    }
  };

  if (!canManageUsers) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
        <Shield className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <p className="text-sm font-bold text-slate-700">غير مصرح</p>
      </div>
    );
  }

  const userColName = colleges.find((c) => c.id === currentUser.collegeId)?.name || 'كليتك';
  const userDeptName = colleges.find((c) => c.id === currentUser.collegeId)?.departments.find((d) => d.id === currentUser.departmentId)?.name || 'قسمك';

  return (
    <div className="space-y-6">
      {/* Scope Alert Badge */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-500">الصلاحية:</span>
          <span className="px-2 py-0.5 rounded-lg font-bold bg-slate-100 text-slate-800">
            {isSuper && 'سوبر أدمن'}
            {isCollegeAdmin && `عميد • ${userColName}`}
            {isDeptAdmin && `رئيس قسم • ${userDeptName}`}
          </span>
        </div>
      </div>

      {/* Single Created User Credentials Banner */}
      {createdUserNotice && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex items-start justify-between gap-4 animate-in fade-in">
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2 font-black text-amber-900 text-sm">
              <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0" />
              <span>تم إنشاء الحساب بنجاح</span>
            </div>
            <p className="text-amber-800 font-medium">
              زوّد المستخدم ببيانات الدخول التالية (سيتوجب عليه تعيين كلمة مرور جديدة عند أول دخول):
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2 font-mono">
              <span className="bg-white px-3 py-1.5 rounded-xl border border-amber-200 font-bold text-slate-800">
                البريد: <span className="text-sky-700">{createdUserNotice.email}</span>
              </span>
              <span className="bg-white px-3 py-1.5 rounded-xl border border-amber-200 font-bold text-slate-800">
                كلمة المرور المؤقتة: <span className="text-amber-900 font-black">{createdUserNotice.tempPassword}</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`البريد: ${createdUserNotice.email}\nكلمة المرور: ${createdUserNotice.tempPassword}`);
                  alert('تم نسخ بيانات الدخول إلى الحافظة');
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-xl font-bold font-sans cursor-pointer transition-colors"
              >
                نسخ البيانات
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCreatedUserNotice(null)}
            className="text-amber-700 hover:text-amber-900 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900">المستخدمون</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setImportModalOpen(true);
              setImportResult(null);
              setImportFile(null);
            }}
            disabled={colleges.length === 0}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>استيراد إكسل</span>
          </button>

          <button
            onClick={openAddModal}
            disabled={colleges.length === 0}
            className="px-4 py-2 bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-md shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مستخدم</span>
          </button>
        </div>
      </div>

      {colleges.length === 0 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-bold">
          ⚠️ أضف كلية أولاً من تبويب الهيكلية.
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <th className="py-3 px-4">الاسم</th>
              <th className="py-3 px-3">البريد</th>
              <th className="py-3 px-3">الدور</th>
              <th className="py-3 px-3">التبعية</th>
              <th className="py-3 px-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 font-bold">
                  لا يوجد مستخدمون
                </td>
              </tr>
            ) : (
              visibleUsers.map((u) => {
                const col = colleges.find((c) => c.id === u.collegeId);
                const dept = col?.departments.find((d) => d.id === u.departmentId);
                const showEdit = canEditUser(u);
                const showDelete = canDeleteUser(u);

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{u.name}</span>
                      <span className="text-[10px] text-slate-400">{u.title || ''}</span>
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">{u.email}</td>

                    <td className="py-3 px-3">{getRoleBadge(u.role)}</td>

                    <td className="py-3 px-3 text-slate-700">
                      {u.role === 'super_admin' ? (
                        <span className="text-slate-400 font-bold">إدارة مركزية</span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="font-semibold block">{col?.name || '-'}</span>
                          {dept && <span className="text-[11px] text-slate-500 block">{dept.name}</span>}
                          {u.stage && (
                            <span className="text-[10px] text-teal-700 block">
                              م{u.stage} {u.sectionName ? `• ${u.sectionName}` : ''}
                            </span>
                          )}
                          {u.role === 'doctor' && (
                            <div className="pt-1 flex flex-wrap gap-1">
                              {subjects.filter((s) => s.theoryDoctorId === u.id || s.practicalDoctorId === u.id || s.doctorId === u.id).length > 0 ? (
                                subjects
                                  .filter((s) => s.theoryDoctorId === u.id || s.practicalDoctorId === u.id || s.doctorId === u.id)
                                  .map((s) => {
                                    const isTheory = s.theoryDoctorId === u.id;
                                    const isPractical = s.practicalDoctorId === u.id;
                                    let tag = 'نظري وعملي';
                                    if (isTheory && isPractical) tag = 'نظري وعملي';
                                    else if (isTheory) tag = 'نظري';
                                    else if (isPractical) tag = 'عملي';
                                    return (
                                      <span
                                        key={s.id}
                                        className="text-[10px] bg-emerald-50 text-emerald-900 border border-emerald-300 px-1.5 py-0.5 rounded font-black flex items-center gap-1"
                                      >
                                        <span>{s.name}</span>
                                        <span className="text-[9px] text-emerald-700 bg-white px-1 rounded border border-emerald-200">
                                          م{s.stage} • {tag}
                                        </span>
                                      </span>
                                    );
                                  })
                              ) : (
                                <span className="text-[10px] text-amber-700 font-medium">بدون مواد مسندة</span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {showEdit && (
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-slate-500 hover:text-sky-700 rounded-lg cursor-pointer"
                            title="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {showDelete && (
                          <button
                            onClick={() => {
                              if (confirm(`حذف حساب "${u.name}" نهائياً؟`)) deleteUser(u.id);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {!showEdit && !showDelete && (
                          <span className="text-slate-300 text-[11px]">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: Add / Edit User */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-sm text-slate-900">
              {editId ? 'تعديل مستخدم' : 'إضافة مستخدم'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[13px] font-bold text-slate-800 mb-1 text-right">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم الرباعي واللقب..."
                  className={`w-full text-[13px] font-bold text-slate-900 placeholder:text-slate-400 p-2.5 rounded-[7px] bg-white border border-slate-300 focus:border-sky-600 focus:outline-none transition-all shadow-2xs ${
                    !name.trim() ? 'border-s-[3px] border-s-rose-500' : 'border-s-[3px] border-s-emerald-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-800 mb-1 text-right">البريد الإلكتروني الجامعي</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@alzahrawi.edu.iq"
                  className={`w-full text-[13px] font-bold text-slate-900 placeholder:text-slate-400 p-2.5 rounded-[7px] bg-white border border-slate-300 focus:border-sky-600 focus:outline-none transition-all shadow-2xs ${
                    !email.trim() ? 'border-s-[3px] border-s-rose-500' : 'border-s-[3px] border-s-emerald-500'
                  }`}
                />
              </div>

              <div>
                <Select
                  label="الدور / الصلاحية الأكاديمية"
                  value={role}
                  onChange={(val) => setRole(val as UserRole)}
                  options={getAllowedRoles().map((item) => ({
                    value: item.role,
                    label: item.label,
                  }))}
                />
              </div>

              {/* Strict Hierarchy Selection */}
              {role !== 'super_admin' && (
                <div className="p-3 bg-slate-50/90 rounded-[10px] border border-slate-200 space-y-3">
                  {/* 1. College */}
                  <div>
                    {isSuper ? (
                      <Select
                        label="الكلية"
                        value={collegeId}
                        onChange={(val) => {
                          setCollegeId(val);
                          const c = colleges.find((col) => col.id === val);
                          if (c && c.departments.length > 0) {
                            setDepartmentId(c.departments[0].id);
                          } else {
                            setDepartmentId('');
                          }
                        }}
                        required
                        placeholder="اختر الكلية..."
                        options={colleges.map((col) => ({
                          value: col.id,
                          label: col.name,
                        }))}
                      />
                    ) : (
                      <div>
                        <span className="block text-[13px] font-bold text-slate-800 mb-1">الكلية</span>
                        <div className="p-2.5 bg-slate-200/80 rounded-[7px] text-slate-900 font-bold text-xs border border-slate-300">
                          {userColName}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Department */}
                  {(role === 'department_admin' || role === 'doctor' || role === 'student') && (
                    <div>
                      {isDeptAdmin ? (
                        <div>
                          <span className="block text-[13px] font-bold text-slate-800 mb-1">القسم</span>
                          <div className="p-2.5 bg-slate-200/80 rounded-[7px] text-slate-900 font-bold text-xs border border-slate-300">
                            {userDeptName}
                          </div>
                        </div>
                      ) : (
                        <Select
                          label="القسم العلمي"
                          value={departmentId}
                          onChange={(val) => setDepartmentId(val)}
                          required
                          placeholder="اختر القسم..."
                          options={availableDepts.map((d) => ({
                            value: d.id,
                            label: d.name,
                          }))}
                        />
                      )}
                    </div>
                  )}

                  {/* 3. Stage & Section for Student */}
                  {role === 'student' && (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <span className="block text-[13px] font-bold text-slate-800 mb-1">المرحلة</span>
                        <select
                          value={stage}
                          onChange={(e) => setStage(Number(e.target.value))}
                          className="w-full text-[13px] font-bold text-slate-900 p-2.5 bg-white rounded-[7px] border border-slate-300 cursor-pointer shadow-2xs"
                        >
                          {[1, 2, 3, 4, 5, 6].map((s) => (
                            <option key={s} value={s}>
                              المرحلة {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <Select
                          label="الشعبة"
                          value={sectionId}
                          onChange={(val) => setSectionId(val)}
                          required
                          placeholder="اختر الشعبة..."
                          options={availableSections.map((sec) => ({
                            value: sec.id,
                            label: sec.name,
                          }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. Subject Assignments for Doctor */}
                  {role === 'doctor' && (
                    <div className="space-y-2 border-t border-slate-100 pt-2.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-[13px] font-bold text-slate-800">
                          المواد والمقررات المكلّف بها الأستاذ
                        </label>
                        <span className="text-[11px] font-semibold text-slate-400">
                          (حدد المقررات التي سيدرّسها التدريسي)
                        </span>
                      </div>

                      {availableDeptSubjects.length === 0 ? (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 font-medium">
                          لا توجد مواد مسجلة في هذا القسم بعد. يمكنك إضافة المواد من تبويب الهيكلية.
                        </div>
                      ) : (
                        <div className="max-h-56 overflow-y-auto space-y-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                          {availableDeptSubjects.map((sub) => {
                            const isAssigned = doctorSubjectAssignments[sub.id]?.selected;
                            const currentRole = doctorSubjectAssignments[sub.id]?.role || (sub.subjectType === 'practical' ? 'practical' : sub.subjectType === 'theory' ? 'theory' : 'both');

                            return (
                              <div
                                key={sub.id}
                                className={`p-2.5 rounded-xl border transition-all ${
                                  isAssigned
                                    ? 'bg-white border-cyan-400 shadow-xs'
                                    : 'bg-white/60 border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <label className="flex items-center gap-2 cursor-pointer flex-1">
                                    <input
                                      type="checkbox"
                                      checked={isAssigned || false}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        setDoctorSubjectAssignments((prev) => ({
                                          ...prev,
                                          [sub.id]: {
                                            selected: checked,
                                            role: prev[sub.id]?.role || (sub.subjectType === 'practical' ? 'practical' : sub.subjectType === 'theory' ? 'theory' : 'both'),
                                          },
                                        }));
                                      }}
                                      className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500 cursor-pointer"
                                    />
                                    <span className="text-xs font-black text-slate-900">{sub.name}</span>
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                                      المرحلة {sub.stage}
                                    </span>
                                  </label>

                                  {isAssigned && sub.subjectType === 'both' && (
                                    <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDoctorSubjectAssignments((prev) => ({
                                            ...prev,
                                            [sub.id]: { ...prev[sub.id], role: 'both' },
                                          }))
                                        }
                                        className={`px-2 py-0.5 rounded cursor-pointer ${
                                          currentRole === 'both' ? 'bg-[#041633] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                                        }`}
                                      >
                                        نظري وعملي
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDoctorSubjectAssignments((prev) => ({
                                            ...prev,
                                            [sub.id]: { ...prev[sub.id], role: 'theory' },
                                          }))
                                        }
                                        className={`px-2 py-0.5 rounded cursor-pointer ${
                                          currentRole === 'theory' ? 'bg-[#041633] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                                        }`}
                                      >
                                        نظري فقط
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          setDoctorSubjectAssignments((prev) => ({
                                            ...prev,
                                            [sub.id]: { ...prev[sub.id], role: 'practical' },
                                          }))
                                        }
                                        className={`px-2 py-0.5 rounded cursor-pointer ${
                                          currentRole === 'practical' ? 'bg-[#041633] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                                        }`}
                                      >
                                        عملي فقط
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl cursor-pointer font-black shadow-md shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Excel Bulk Import */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-black text-base text-slate-900">استيراد من إكسل</h3>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Download Alert */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
              <span className="font-bold text-slate-900">قالب إكسل</span>
              <a
                href="/api/users/template"
                download="alzahrawi_users_template.xlsx"
                className="px-3 py-1.5 bg-white text-slate-800 border border-slate-300 hover:bg-slate-100 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-sky-700" />
                <span>تحميل القالب</span>
              </a>
            </div>

            {/* File Drop / Select */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-900">الملف (.xlsx / .csv)</label>
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImportFile(e.target.files[0]);
                    setImportResult(null);
                  }
                }}
                className="w-full text-xs p-2.5 bg-white border-2 border-slate-300 rounded-2xl cursor-pointer"
              />
              {importFile && (
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{importFile.name}</span>
                </div>
              )}
            </div>

            {/* Import Results Banner */}
            {importResult && (
              <div className="space-y-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>تم إنشاء {importResult.count} حساب</span>
                </div>

                {importResult.createdAccounts && importResult.createdAccounts.length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-[11px] block">
                        الحسابات المُولَّدة:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const text = importResult.createdAccounts!
                            .map((a) => `${a.name}\t${a.email}\t${a.tempPassword}`)
                            .join('\n');
                          navigator.clipboard.writeText(text);
                          alert('تم النسخ إلى الحافظة');
                        }}
                        className="text-[10px] text-sky-700 hover:text-sky-900 font-bold underline cursor-pointer"
                      >
                        نسخ الكل
                      </button>
                    </div>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {importResult.createdAccounts.map((acc, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] font-mono bg-white p-1.5 rounded-lg border border-slate-200"
                        >
                          <span className="font-sans font-bold text-slate-800 truncate max-w-[120px]">{acc.name}</span>
                          <span className="text-slate-600 truncate max-w-[150px]">{acc.email}</span>
                          <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-bold font-mono">
                            {acc.tempPassword}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {importResult.errors.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-200">
                    <span className="font-bold text-amber-800 text-[11px] block">
                      أخطاء ({importResult.errors.length}):
                    </span>
                    <div className="max-h-24 overflow-y-auto space-y-1">
                      {importResult.errors.map((err, idx) => (
                        <p key={idx} className="text-[10px] text-amber-900 font-mono bg-amber-50 p-1 rounded">
                          {err}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={handleImportExcel}
                disabled={!importFile || isImporting}
                className="px-5 py-2 text-xs bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl font-black cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-md shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isImporting ? 'جاري الاستيراد...' : 'بدء الاستيراد'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
