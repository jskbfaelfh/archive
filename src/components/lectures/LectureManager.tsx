'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Lecture, FileType } from '@/types';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Edit2,
  Eye,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function LectureManager() {
  const {
    currentUser,
    colleges,
    sections,
    subjects,
    lectures,
    addLecture,
    updateLecture,
    deleteLecture,
  } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [stage, setStage] = useState<number>(1);
  const [subjectId, setSubjectId] = useState('');
  const [sectionTarget, setSectionTarget] = useState<string>('all');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('3.5 MB');

  // Assigned subjects for doctor
  const myDoctorSubjects = subjects.filter((s) => s.doctorId === currentUser.id);
  const myDoctorSubjectIds = myDoctorSubjects.map((s) => s.id);

  // Filter accessible lectures based on user scope
  const filteredLectures = lectures.filter((lec) => {
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'college_admin') return lec.collegeId === currentUser.collegeId;
    if (currentUser.role === 'department_admin') {
      return lec.collegeId === currentUser.collegeId && lec.departmentId === currentUser.departmentId;
    }
    if (currentUser.role === 'doctor') {
      // التدريسي يرى حصراً محاضرات مواده المسندة إليه
      return myDoctorSubjectIds.includes(lec.subjectId);
    }
    if (currentUser.role === 'student') {
      if (currentUser.collegeId && lec.collegeId !== currentUser.collegeId) return false;
      if (currentUser.departmentId && lec.departmentId !== currentUser.departmentId) return false;
      if (currentUser.stage && lec.stage !== currentUser.stage) return false;
      if (lec.sectionTarget === 'all') return true;
      if (currentUser.sectionId && lec.sectionTarget === currentUser.sectionId) return true;
      return false;
    }
    return true;
  });

  const selectedCol = colleges.find((c) => c.id === collegeId);
  const availableDepts = selectedCol?.departments || [];

  const availableSubjects = subjects.filter(
    (s) => s.collegeId === collegeId && s.departmentId === departmentId && s.stage === stage
  );

  const availableSections = sections.filter(
    (s) => s.collegeId === collegeId && s.departmentId === departmentId && s.stage === stage
  );

  const openUploadModal = () => {
    setEditId(null);
    setTitle('');
    setDescription('');
    const cId = currentUser.collegeId || colleges[0]?.id || '';
    setCollegeId(cId);
    const dId = currentUser.departmentId || colleges.find((c) => c.id === cId)?.departments[0]?.id || '';
    setDepartmentId(dId);

    if (currentUser.role === 'doctor') {
      if (myDoctorSubjects.length > 0) {
        setStage(myDoctorSubjects[0].stage);
        setSubjectId(myDoctorSubjects[0].id);
      } else {
        setStage(1);
        setSubjectId('');
      }
    } else {
      setStage(currentUser.stage || 1);
      setSubjectId('');
    }

    setSectionTarget('all');
    setFileName('');
    setModalOpen(true);
  };

  const openEditModal = (lec: Lecture) => {
    setEditId(lec.id);
    setTitle(lec.title);
    setDescription(lec.description || '');
    setCollegeId(lec.collegeId);
    setDepartmentId(lec.departmentId);
    setStage(lec.stage);
    setSubjectId(lec.subjectId);
    setSectionTarget(lec.sectionTarget);
    setFileName(lec.fileName);
    setFileSize(lec.fileSize);
    setModalOpen(true);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFileName(f.name);
      setFileSize(`${(f.size / (1024 * 1024)).toFixed(1)} MB`);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !collegeId || !departmentId || !subjectId) {
      alert('يرجى استكمال اختيار الكلية والقسم والمرحلة والمادة الدراسية!');
      return;
    }

    const sub = subjects.find((s) => s.id === subjectId);
    const sec = sections.find((s) => s.id === sectionTarget);
    const sectionName = sectionTarget === 'all' ? 'كافة الشُعب' : (sec?.name || 'شعبة محددة');

    if (editId) {
      updateLecture(editId, {
        title: title.trim(),
        description: description.trim(),
        collegeId,
        departmentId,
        stage,
        subjectId,
        subjectName: sub?.name,
        sectionTarget,
        sectionName,
      });
    } else {
      addLecture({
        title: title.trim(),
        description: description.trim(),
        collegeId,
        departmentId,
        stage,
        subjectId,
        subjectName: sub?.name,
        sectionTarget,
        sectionName,
        doctorId: currentUser.id,
        doctorName: currentUser.name,
        fileType: 'pdf',
        fileSize: fileSize || '3.5 MB',
        fileName: fileName || `${title}.pdf`,
      });
    }

    setModalOpen(false);
  };

  const handleDownload = (lec: Lecture) => {
    const element = document.createElement('a');
    const content = `جامعة الزهراوي - أرشيف المحاضرات
المحاضرة: ${lec.title}
المادة: ${lec.subjectName || ''}
التدريسي: ${lec.doctorName}
المرحلة: ${lec.stage} - ${lec.sectionName || ''}
التاريخ: ${lec.uploadDate}`;
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${lec.fileName}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-slate-900">مستودع المحاضرات</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser.role === 'student'
              ? `المحاضرات المتاحة لك (${currentUser.sectionName || 'شعبتك'})`
              : currentUser.role === 'doctor'
              ? `محاضرات موادك الدراسية (${myDoctorSubjects.map((s) => s.name).join('، ') || 'لم تسند لك مواد'})`
              : 'إيداع وإدارة المحاضرات بحسب الكلية والقسم والمرحلة والشعبة'}
          </p>
        </div>

        {currentUser.role !== 'student' && (
          <button
            onClick={openUploadModal}
            disabled={colleges.length === 0 || (currentUser.role === 'doctor' && myDoctorSubjects.length === 0)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>إيداع محاضرة</span>
          </button>
        )}
      </div>

      {/* Doctor No-Subjects Warning */}
      {currentUser.role === 'doctor' && myDoctorSubjects.length === 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 p-4 rounded-2xl flex items-center gap-3 text-amber-900">
          <div className="p-2 bg-amber-100 rounded-xl font-bold text-lg">⚠️</div>
          <div>
            <h4 className="font-bold text-sm">لم يتم إسناد أي مادة دراسية لحسابك حتى الآن</h4>
            <p className="text-xs text-amber-800 mt-0.5">
              لم يقم رئيس القسم أو العميد بربطك بأي مادة دراسية بعد. يرجى التواصل مع رئاسة القسم لإسناد موادك الدراسية لتتمكن من إيداع المحاضرات وإدارتها.
            </p>
          </div>
        </div>
      )}

      {/* Lectures List */}
      {filteredLectures.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">لا توجد محاضرات مودعة حالياً</p>
          <p className="text-xs text-slate-400 mt-1">
            {currentUser.role === 'student'
              ? 'لم يقم التدريسي برفع محاضرات لشعبتك حتى الآن.'
              : currentUser.role === 'doctor'
              ? 'لم تقم برفع محاضرات لموادك المسندة إليك حتى الآن.'
              : 'اضغط على (إيداع محاضرة) لرفع ونشر أول محاضرة في النظام.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-3 px-4">عنوان المحاضرة</th>
                <th className="py-3 px-3">التسلسل الأكاديمي</th>
                <th className="py-3 px-3">الشعبة</th>
                <th className="py-3 px-3">التدريسي</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLectures.map((lec) => {
                const col = colleges.find((c) => c.id === lec.collegeId);
                const dept = col?.departments.find((d) => d.id === lec.departmentId);
                const sub = subjects.find((s) => s.id === lec.subjectId);

                const canEdit =
                  currentUser.role === 'super_admin' ||
                  (currentUser.role === 'college_admin' && currentUser.collegeId === lec.collegeId) ||
                  (currentUser.role === 'department_admin' && currentUser.departmentId === lec.departmentId) ||
                  (currentUser.role === 'doctor' && (myDoctorSubjectIds.includes(lec.subjectId) || currentUser.id === lec.doctorId));

                return (
                  <tr key={lec.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{lec.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {lec.fileName} ({lec.fileSize})
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-700">
                      <span className="font-semibold block">{sub?.name || 'مقرر'}</span>
                      <span className="text-[10px] text-slate-500 block">
                        {col?.name} • قسم {dept?.name} • مرحلة {lec.stage}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">
                        {lec.sectionName || 'عام'}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-medium text-slate-800">{lec.doctorName}</td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleDownload(lec)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          تحميل
                        </button>

                        {canEdit && (
                          <>
                            <button
                              onClick={() => openEditModal(lec)}
                              className="p-1 text-slate-400 hover:text-sky-700 cursor-pointer"
                              title="تعديل"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`حذف محاضرة "${lec.title}"؟`)) deleteLecture(lec.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: Upload / Edit Lecture */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-sm text-slate-900">
              {editId ? 'تعديل المحاضرة' : 'إيداع محاضرة بالهيكلية'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">عنوان المحاضرة</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: المحاضرة 1: تشريح الصدر"
                  className="w-full text-sm font-bold text-slate-900 placeholder:text-slate-500 placeholder:font-normal p-2.5 rounded-xl bg-white border-2 border-slate-300 focus:border-sky-600 focus:outline-none shadow-xs"
                />
              </div>

              {/* Cascading Selection */}
              <div className="p-3.5 bg-slate-100 rounded-xl border-2 border-slate-200 space-y-2.5">
                <span className="font-black text-slate-900 block text-xs">
                  التسلسل الإلزامي لإيداع المحاضرة:
                </span>

                {/* 1. College */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">1. الكلية</label>
                  {currentUser.role === 'super_admin' ? (
                    <select
                      value={collegeId}
                      onChange={(e) => {
                        setCollegeId(e.target.value);
                        const c = colleges.find((col) => col.id === e.target.value);
                        if (c && c.departments.length > 0) setDepartmentId(c.departments[0].id);
                      }}
                      required
                      className="w-full text-sm font-bold text-slate-900 p-2 bg-white rounded-lg border-2 border-slate-300 cursor-pointer"
                    >
                      <option value="">-- اختر الكلية --</option>
                      {colleges.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-2.5 bg-slate-200/80 rounded-lg text-slate-900 font-bold text-xs border border-slate-300">
                      {colleges.find((c) => c.id === currentUser.collegeId)?.name || 'كليتك الحصرية'}
                    </div>
                  )}
                </div>

                {/* 2. Department */}
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">2. القسم</label>
                  {currentUser.role === 'department_admin' || currentUser.role === 'doctor' ? (
                    <div className="p-2.5 bg-slate-200/80 rounded-lg text-slate-900 font-bold text-xs border border-slate-300">
                      {availableDepts.find((d) => d.id === currentUser.departmentId)?.name || 'قسمك الحصري'}
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

                {/* Doctor specific subject selection */}
                {currentUser.role === 'doctor' ? (
                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1">3. المادة الدراسية المسندة إليك</label>
                      <select
                        value={subjectId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSubjectId(val);
                          const chosen = myDoctorSubjects.find((s) => s.id === val);
                          if (chosen) {
                            setStage(chosen.stage);
                            setSectionTarget('all');
                          }
                        }}
                        required
                        className="w-full text-sm font-black text-slate-900 p-2.5 bg-white rounded-lg border-2 border-slate-300 cursor-pointer"
                      >
                        <option value="">-- اختر مادتك الدراسية --</option>
                        {myDoctorSubjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} (المرحلة {s.stage})
                          </option>
                        ))}
                      </select>
                      {myDoctorSubjects.length === 0 && (
                        <span className="text-[11px] font-bold text-amber-700 block mt-1">
                          لم يتم تكليفك بأي مادة بعد. يرجى التواصل مع رئيس القسم.
                        </span>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1">4. الشعبة المستهدفة بالمحاضرة</label>
                      <select
                        value={sectionTarget}
                        onChange={(e) => setSectionTarget(e.target.value)}
                        className="w-full text-sm font-bold text-slate-900 p-2 bg-white rounded-lg border-2 border-slate-300 cursor-pointer"
                      >
                        <option value="all">كافة الشُعب (عام للمرحلة {stage})</option>
                        {availableSections.map((sec) => (
                          <option key={sec.id} value={sec.id}>
                            {sec.name} فقط
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 3. Stage & Section */}
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
                        <label className="block text-xs font-black text-slate-800 mb-1">4. الشعبة المستهدفة</label>
                        <select
                          value={sectionTarget}
                          onChange={(e) => setSectionTarget(e.target.value)}
                          className="w-full text-sm font-black text-slate-900 p-2 bg-white rounded-lg border-2 border-slate-300 cursor-pointer"
                        >
                          <option value="all">كافة الشُعب (عام)</option>
                          {availableSections.map((sec) => (
                            <option key={sec.id} value={sec.id}>
                              {sec.name} فقط
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* 4. Subject */}
                    <div>
                      <label className="block text-xs font-black text-slate-800 mb-1">5. المادة الدراسية</label>
                      <select
                        value={subjectId}
                        onChange={(e) => setSubjectId(e.target.value)}
                        required
                        className="w-full text-sm font-black text-slate-900 p-2 bg-white rounded-lg border-2 border-slate-300 cursor-pointer"
                      >
                        <option value="">-- اختر المادة --</option>
                        {availableSubjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      {availableSubjects.length === 0 && (
                        <span className="text-[11px] font-bold text-amber-700 block mt-1">
                          لا توجد مواد مسجلة لهذه المرحلة. أضف مادة أولاً من تبويب الهيكلية.
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* File upload */}
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">ملف المحاضرة (PDF / PPTX)</label>
                <input
                  type="file"
                  onChange={handleFile}
                  accept=".pdf,.pptx,.ppt,.docx"
                  className="w-full text-xs p-2 bg-white border-2 border-slate-300 rounded-xl"
                />
                {fileName && <p className="text-[11px] font-bold text-emerald-800 mt-1">الملف: {fileName}</p>}
              </div>

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
                  إيداع المحاضرة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
