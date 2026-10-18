'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { User, UserRole } from '@/types';
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

export default function UserManager() {
  const { users, colleges, sections, subjects, addUser, updateUser, deleteUser, currentUser, refreshData } = useApp();

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

  // Excel Bulk Import States
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ count: number; errors: string[] } | null>(null);

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
        setImportResult({ count: data.importedCount, errors: data.errors || [] });
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

  const getAllowedRoles = (): { role: UserRole; label: string }[] => {
    if (isSuper) {
      return [
        { role: 'college_admin', label: 'أدمن كلية (عمادة الكلية)' },
        { role: 'department_admin', label: 'أدمن قسم (رئاسة القسم)' },
        { role: 'doctor', label: 'تدريسي (أستاذ مقرر)' },
        { role: 'student', label: 'طالب جامعي' },
        { role: 'super_admin', label: 'سوبر أدمن الجامعة' },
      ];
    }
    if (isCollegeAdmin) {
      return [
        { role: 'department_admin', label: 'أدمن قسم (رئاسة القسم)' },
        { role: 'doctor', label: 'تدريسي (أستاذ مقرر)' },
        { role: 'student', label: 'طالب جامعي' },
      ];
    }
    if (isDeptAdmin) {
      return [
        { role: 'doctor', label: 'تدريسي (أستاذ مقرر)' },
        { role: 'student', label: 'طالب جامعي' },
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
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const targetCollegeId = isSuper ? collegeId : currentUser.collegeId;
    const targetDeptId = isDeptAdmin ? currentUser.departmentId : departmentId;

    // Strict validation for students
    if (role === 'student') {
      if (!targetCollegeId || !targetDeptId || !sectionId) {
        alert('تنبيه: لا يمكن تسجيل طالب بدون تحديد الكلية والقسم والمرحلة والشعبة التابع لها!');
        return;
      }
    }

    const sec = sections.find((s) => s.id === sectionId);

    if (editId) {
      updateUser(editId, {
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
      addUser({
        name,
        email,
        role,
        title: title || (role === 'college_admin' ? 'عميد الكلية' : role === 'department_admin' ? 'رئيس القسم' : role === 'doctor' ? 'أستاذ' : 'طالب'),
        collegeId: role === 'super_admin' ? undefined : targetCollegeId,
        departmentId: (role === 'department_admin' || role === 'doctor' || role === 'student') ? targetDeptId : undefined,
        stage: role === 'student' ? stage : undefined,
        sectionId: role === 'student' ? sectionId : undefined,
        sectionName: role === 'student' ? sec?.name : undefined,
      });
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
        return <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded text-[11px]">أدمن كلية</span>;
      case 'department_admin':
        return <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded text-[11px]">أدمن قسم</span>;
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
        <p className="text-sm font-bold text-slate-700">غير مصرح لك بإدارة الحسابات</p>
        <p className="text-xs text-slate-400 mt-1">تقتصر إدارة الحسابات على الإدارة المركزية وعمداء الكليات ورؤساء الأقسام فقط.</p>
      </div>
    );
  }

  const userColName = colleges.find((c) => c.id === currentUser.collegeId)?.name || 'كليتك';
  const userDeptName = colleges.find((c) => c.id === currentUser.collegeId)?.departments.find((d) => d.id === currentUser.departmentId)?.name || 'قسمك';

  return (
    <div className="space-y-6">
      {/* Scope Alert Badge */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-black text-slate-800">نطاق صلاحيات إدارة المستخدمين:</span>
          <span className="px-2.5 py-1 rounded-lg font-bold bg-slate-100 text-slate-800 border border-slate-300">
            {isSuper && 'سوبر أدمن: إدارة كافة مستخدمي وحسابات الجامعة'}
            {isCollegeAdmin && `عميد كلية: إدارة حسابات (${userColName}) فقط`}
            {isDeptAdmin && `رئيس قسم: إدارة حسابات أساتذة وطلبة قسم (${userDeptName}) فقط`}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900">إدارة الحسابات والصلاحيات</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSuper && 'إضافة وتعديل وحذف حسابات المسؤولين، التدريسيين، والطلبة بكافة الكليات'}
            {isCollegeAdmin && `إدارة حسابات التدريسيين ورؤساء الأقسام والطلبة في ${userColName}`}
            {isDeptAdmin && `إدارة حسابات التدريسيين والطلبة في قسم ${userDeptName}`}
          </p>
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
            <span>استيراد إكسل (Excel)</span>
          </button>

          <button
            onClick={openAddModal}
            disabled={colleges.length === 0}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة مستخدم</span>
          </button>
        </div>
      </div>

      {colleges.length === 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
          تنبيه: يجب إضافة كلية أولاً من تبويب (الهيكلية) قبل إنشاء الحسابات لربط كل حساب بموقعه الإداري.
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-right text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
              <th className="py-3 px-4">الاسم والصفة</th>
              <th className="py-3 px-3">البريد الإلكتروني</th>
              <th className="py-3 px-3">الدور</th>
              <th className="py-3 px-3">التبعية الأكاديمية (التسلسل)</th>
              <th className="py-3 px-4 text-center">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleUsers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400">
                  لا يوجد مستخدمون مسجلون ضمن نطاق صلاحياتك حالياً.
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
                        <span className="text-slate-400 font-bold">إدارة الجامعة المركزية</span>
                      ) : (
                        <div className="space-y-0.5">
                          <span className="font-semibold block">{col?.name || '-'}</span>
                          {dept && <span className="text-[11px] text-slate-500 block">قسم: {dept.name}</span>}
                          {u.stage && (
                            <span className="text-[10px] text-teal-700 block">
                              المرحلة {u.stage} {u.sectionName ? `• ${u.sectionName}` : ''}
                            </span>
                          )}
                          {u.role === 'doctor' && (
                            <div className="pt-1 flex flex-wrap gap-1">
                              {subjects.filter((s) => s.doctorId === u.id).length > 0 ? (
                                subjects
                                  .filter((s) => s.doctorId === u.id)
                                  .map((s) => (
                                    <span
                                      key={s.id}
                                      className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded font-bold"
                                    >
                                      مادة: {s.name} (م{s.stage})
                                    </span>
                                  ))
                              ) : (
                                <span className="text-[10px] text-amber-700 font-medium">لم تُسند له مواد بعد</span>
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
              {editId ? 'تعديل بيانات المستخدم' : 'إضافة حساب جديد بالهيكلية'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="الاسم الثلاثي"
                  className="w-full text-sm font-bold text-slate-900 placeholder:text-slate-500 placeholder:font-normal p-2.5 rounded-xl bg-white border-2 border-slate-300 focus:border-sky-600 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@alzahrawi.edu.iq"
                  className="w-full text-sm font-bold text-slate-900 placeholder:text-slate-500 placeholder:font-normal p-2.5 rounded-xl bg-white border-2 border-slate-300 focus:border-sky-600 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">نوع الدور والصلاحية</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full text-sm font-black text-slate-900 p-2.5 rounded-xl bg-white border-2 border-slate-300 focus:border-sky-600 focus:outline-none shadow-xs cursor-pointer"
                >
                  {getAllowedRoles().map((item) => (
                    <option key={item.role} value={item.role}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Strict Hierarchy Selection */}
              {role !== 'super_admin' && (
                <div className="p-3.5 bg-slate-100 rounded-xl border-2 border-slate-200 space-y-3">
                  <span className="font-black text-slate-900 block text-xs">
                    التسلسل الأكاديمي الإلزامي:
                  </span>

                  {/* 1. College */}
                  <div>
                    <label className="block text-xs font-black text-slate-800 mb-1">1. الكلية التابع لها</label>
                    {isSuper ? (
                      <select
                        value={collegeId}
                        onChange={(e) => {
                          setCollegeId(e.target.value);
                          const c = colleges.find((col) => col.id === e.target.value);
                          if (c && c.departments.length > 0) {
                            setDepartmentId(c.departments[0].id);
                          } else {
                            setDepartmentId('');
                          }
                        }}
                        required
                        className="w-full text-sm font-bold text-slate-900 p-2 bg-white rounded-lg border-2 border-slate-300 cursor-pointer"
                      >
                        <option value="">-- اختر الكلية --</option>
                        {colleges.map((col) => (
                          <option key={col.id} value={col.id}>
                            {col.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-2.5 bg-slate-200/80 rounded-lg text-slate-900 font-bold text-xs border border-slate-300">
                        {userColName} (كليتك الحصرية)
                      </div>
                    )}
                  </div>

                  {/* 2. Department */}
                  {(role === 'department_admin' || role === 'doctor' || role === 'student') && (
                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1">2. القسم العلمي</label>
                      {isDeptAdmin ? (
                        <div className="p-2.5 bg-slate-200/80 rounded-lg text-slate-900 font-bold text-xs border border-slate-300">
                          {userDeptName} (قسمك الحصري)
                        </div>
                      ) : (
                        <select
                          value={departmentId}
                          onChange={(e) => setDepartmentId(e.target.value)}
                          required
                          className="w-full text-sm font-bold text-slate-900 p-2 bg-white rounded-lg border-2 border-slate-300 cursor-pointer"
                        >
                          <option value="">-- اختر القسم --</option>
                          {availableDepts.map((d) => (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* 3. Stage & Section for Student */}
                  {role === 'student' && (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-black text-slate-800 mb-1">3. المرحلة</label>
                        <select
                          value={stage}
                          onChange={(e) => setStage(Number(e.target.value))}
                          className="w-full text-sm font-bold text-slate-900 p-2 bg-white rounded-lg border-2 border-slate-300 cursor-pointer"
                        >
                          {[1, 2, 3, 4, 5, 6].map((s) => (
                            <option key={s} value={s}>
                              المرحلة {s}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-black text-slate-800 mb-1">4. الشعبة الحصرية</label>
                        <select
                          value={sectionId}
                          onChange={(e) => setSectionId(e.target.value)}
                          required
                          className="w-full text-sm font-black text-slate-900 p-2 bg-white rounded-lg border-2 border-slate-300 cursor-pointer"
                        >
                          <option value="">-- اختر الشعبة --</option>
                          {availableSections.map((sec) => (
                            <option key={sec.id} value={sec.id}>
                              {sec.name}
                            </option>
                          ))}
                        </select>
                        {availableSections.length === 0 && (
                          <span className="text-[11px] font-bold text-rose-600 block mt-1">
                            لا توجد شعب لهذه المرحلة. يرجى إضافة شعبة من تبويب الهيكلية أولاً!
                          </span>
                        )}
                      </div>
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
                  className="px-4 py-1.5 text-xs bg-slate-900 text-white rounded-lg cursor-pointer font-bold"
                >
                  حفظ الحساب
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
                <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  استيراد الحسابات دفعة واحدة
                </span>
                <h3 className="font-black text-base text-slate-900 mt-1">استيراد الطلاب والأساتذة من ملف إكسل</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  ارفع ملف .xlsx أو .csv لإنشاء مئات أو آلاف الحسابات ومطابقتها بالشعب تلقائياً.
                </p>
              </div>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Download Alert */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-900 block">هل تحتاج قالب الإكسل النموذجي؟</span>
                <span className="text-[11px] text-slate-500">حمل القالب الجاهز بالأعمدة المعتمدة واملأه ببياناتك.</span>
              </div>
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
              <label className="block text-xs font-black text-slate-900">اختر ملف الإكسل (.xlsx / .csv)</label>
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
                  <span>الملف الجاهز للاستيراد: {importFile.name}</span>
                </div>
              )}
            </div>

            {/* Import Results Banner */}
            {importResult && (
              <div className="space-y-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>تم استيراد وإنشاء {importResult.count} حساب بنجاح!</span>
                </div>
                {importResult.errors.length > 0 && (
                  <div className="space-y-1 pt-1 border-t border-slate-200">
                    <span className="font-bold text-amber-800 text-[11px] block">
                      تنبيهات وتجاوزات ({importResult.errors.length}):
                    </span>
                    <div className="max-h-28 overflow-y-auto space-y-1">
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
                className="px-5 py-2 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50 flex items-center gap-2 shadow-xs"
              >
                {isImporting && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>{isImporting ? 'جاري قراءة واستيراد الحسابات...' : 'بدء الاستيراد للجامعة'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
