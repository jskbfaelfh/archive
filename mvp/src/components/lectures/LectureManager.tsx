'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Lecture, FileType } from '@/types';
import {
  FileText,
  UploadCloud,
  Download,
  Trash2,
  Edit2,
  Eye,
  Search,
  X,
  Loader2,
} from 'lucide-react';
import Select from '@/components/common/Select';

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
    refreshData,
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

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<number | 'all'>('all');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  // Preview modal state
  const [previewLecture, setPreviewLecture] = useState<Lecture | null>(null);

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Assigned subjects for doctor (Theory, Practical, or Primary)
  const myDoctorSubjects = subjects.filter(
    (s) =>
      s.theoryDoctorId === currentUser.id ||
      s.practicalDoctorId === currentUser.id ||
      s.doctorId === currentUser.id
  );
  const myDoctorSubjectIds = myDoctorSubjects.map((s) => s.id);

  // Departments list for Dean & Super Admin
  const deanDepartments = useMemo(() => {
    if (currentUser.role === 'college_admin') {
      return colleges.find((c) => c.id === currentUser.collegeId)?.departments || [];
    }
    if (currentUser.role === 'super_admin') {
      return colleges.flatMap((c) => c.departments);
    }
    return [];
  }, [currentUser, colleges]);

  // Stages list based on selected department or college
  const stagesList = useMemo(() => {
    if (currentUser.role === 'college_admin') {
      const col = colleges.find((c) => c.id === currentUser.collegeId);
      if (deptFilter !== 'all') {
        const d = col?.departments.find((dept) => dept.id === deptFilter);
        return Array.from({ length: d?.stagesCount || 4 }, (_, i) => i + 1);
      }
      const maxCount = Math.max(...(col?.departments.map((d) => d.stagesCount) || [4]), 4);
      return Array.from({ length: maxCount }, (_, i) => i + 1);
    }
    return [1, 2, 3, 4];
  }, [currentUser, colleges, deptFilter]);

  // Filter accessible lectures based on user scope and search
  const filteredLectures = lectures.filter((lec) => {
    // Department filter for Dean & Super Admin
    if (deptFilter !== 'all' && lec.departmentId !== deptFilter) return false;

    // Stage filter
    if (stageFilter !== 'all' && lec.stage !== stageFilter) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = lec.title.toLowerCase().includes(q);
      const matchSub = lec.subjectName?.toLowerCase().includes(q) || false;
      const matchDoc = lec.doctorName.toLowerCase().includes(q);
      const matchDesc = lec.description?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchSub && !matchDoc && !matchDesc) return false;
    }

    // Role-based visibility
    if (currentUser.role === 'super_admin') return true;
    if (currentUser.role === 'college_admin') return lec.collegeId === currentUser.collegeId;
    if (currentUser.role === 'department_admin') {
      return lec.collegeId === currentUser.collegeId && lec.departmentId === currentUser.departmentId;
    }
    if (currentUser.role === 'doctor') {
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
    setSelectedFile(null);
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
    setSelectedFile(null);
    setModalOpen(true);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setSelectedFile(f);
      setFileName(f.name);
      setFileSize(`${(f.size / (1024 * 1024)).toFixed(1)} MB`);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !collegeId || !departmentId || !subjectId) {
      alert('يرجى استكمال اختيار الكلية والقسم والمرحلة والمادة الدراسية!');
      return;
    }

    const sub = subjects.find((s) => s.id === subjectId);
    const sec = sections.find((s) => s.id === sectionTarget);
    const sectionName = sectionTarget === 'all' ? 'كافة الشُعب' : (sec?.name || 'شعبة محددة');

    let uploadedFilePath: string | undefined = undefined;

    // Real upload if file is attached
    if (selectedFile) {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (res.ok) {
          const upData = await res.json();
          uploadedFilePath = upData.fileKey;
        }
      } catch (err) {
        console.error('File upload failed:', err);
      } finally {
        setIsUploading(false);
      }
    }

    if (editId) {
      await updateLecture(editId, {
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
      const ext = (selectedFile?.name || fileName || '').split('.').pop()?.toLowerCase();
      const resolvedType: FileType = ext === 'pptx' || ext === 'ppt' ? 'pptx' : ext === 'docx' || ext === 'doc' ? 'docx' : ext === 'mp4' ? 'video' : 'pdf';
      await addLecture({
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
        fileType: resolvedType,
        fileSize: fileSize || '3.5 MB',
        fileName: fileName || `${title}.pdf`,
        filePath: uploadedFilePath,
      });
    }

    setModalOpen(false);
  };

  // Real server-tracked download
  const handleDownload = async (lec: Lecture) => {
    try {
      const res = await fetch(`/api/lectures/${lec.id}/download`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = lec.fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        await refreshData();
      }
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-black text-slate-900">المحاضرات</h2>
        </div>

        {currentUser.role !== 'student' && (
          <button
            onClick={openUploadModal}
            disabled={colleges.length === 0 || (currentUser.role === 'doctor' && myDoctorSubjects.length === 0)}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <UploadCloud className="w-4 h-4" />
            <span>إضافة محاضرة</span>
          </button>
        )}
      </div>

      {/* Doctor No-Subjects Warning */}
      {currentUser.role === 'doctor' && myDoctorSubjects.length === 0 && (
        <div className="bg-amber-50 border border-amber-300 p-3 rounded-2xl flex items-center gap-2.5 text-amber-900 text-xs font-bold">
          <span>⚠️ لم تُسند لك مواد دراسية بعد.</span>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-center gap-2.5 flex-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المحاضرات..."
              className="w-full text-xs font-bold text-slate-900 placeholder:text-slate-400 placeholder:font-normal pr-9 pl-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-600 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Filter for Dean (and Super Admin) */}
          {(currentUser.role === 'college_admin' || currentUser.role === 'super_admin') && deanDepartments.length > 0 && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-slate-500 shrink-0">القسم:</span>
              <select
                value={deptFilter}
                onChange={(e) => {
                  setDeptFilter(e.target.value);
                  setStageFilter('all');
                }}
                className="w-full sm:w-56 text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:border-sky-600 focus:outline-none cursor-pointer transition-all"
              >
                <option value="all">كافة الأقسام ({deanDepartments.length})</option>
                {deanDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Stage Filter Buttons */}
        {currentUser.role !== 'student' && (
          <div className="flex items-center gap-1 self-start lg:self-auto text-xs font-bold bg-slate-100 p-1 rounded-xl shrink-0 overflow-x-auto">
            <span className="text-[10px] text-slate-400 px-2 font-semibold shrink-0">المرحلة:</span>
            <button
              onClick={() => setStageFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 ${
                stageFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل
            </button>
            {stagesList.map((s) => (
              <button
                key={s}
                onClick={() => setStageFilter(s)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer shrink-0 ${
                  stageFilter === s ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                م{s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lectures List */}
      {filteredLectures.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700">لا توجد محاضرات</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <th className="py-3 px-4">المحاضرة</th>
                <th className="py-3 px-3">المادة</th>
                <th className="py-3 px-3">الشعبة</th>
                <th className="py-3 px-3">التدريسي</th>
                <th className="py-3 px-4 text-center">إجراءات</th>
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
                        {col?.name} • {dept?.name} • م{lec.stage}
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
                          onClick={() => setPreviewLecture(lec)}
                          className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-sky-900 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 border border-sky-200"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>معاينة</span>
                        </button>

                        <button
                          onClick={() => handleDownload(lec)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1 border border-slate-200"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{lec.downloadsCount}</span>
                        </button>

                        {canEdit && (
                          <>
                            <button
                              onClick={() => openEditModal(lec)}
                              className="p-1.5 text-slate-400 hover:text-sky-700 cursor-pointer"
                              title="تعديل"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`حذف محاضرة "${lec.title}"؟`)) deleteLecture(lec.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
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

      {/* MODAL: In-App Document Preview */}
      {previewLecture && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] text-sky-800 font-bold bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
                  معاينة
                </span>
                <h3 className="font-black text-base text-slate-900 mt-1">{previewLecture.title}</h3>
                <p className="text-xs text-slate-500">
                  {previewLecture.subjectName} • {previewLecture.doctorName}
                </p>
              </div>
              <button
                onClick={() => setPreviewLecture(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Content / Preview Canvas */}
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-xs text-red-600 flex items-center justify-center mx-auto border border-slate-200 font-black text-sm">
                PDF
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">{previewLecture.fileName}</h4>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">{previewLecture.fileSize}</p>
              </div>

              {previewLecture.description && (
                <div className="p-3 bg-white rounded-xl border border-slate-200 text-right text-xs text-slate-700 leading-relaxed font-medium">
                  <span className="font-bold block text-slate-900 mb-1">الوصف:</span>
                  {previewLecture.description}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-right text-xs pt-2">
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">الشعبة:</span>
                  <span className="font-bold text-slate-800">
                    م{previewLecture.stage} • {previewLecture.sectionName || 'عام'}
                  </span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] block">التاريخ:</span>
                  <span className="font-bold text-slate-800 font-mono">{previewLecture.uploadDate}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 font-medium">
                التحميلات: <b>{previewLecture.downloadsCount}</b>
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewLecture(null)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-bold cursor-pointer"
                >
                  إغلاق
                </button>
                <button
                  onClick={() => {
                    handleDownload(previewLecture);
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/30"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Upload / Edit Lecture */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-5 space-y-3 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-sm text-slate-900">
              {editId ? 'تعديل محاضرة' : 'إضافة محاضرة'}
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[13px] font-bold text-slate-800 mb-1 text-right">عنوان المحاضرة</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="اكتب عنوان المحاضرة بدقة..."
                  className={`w-full text-[13px] font-bold text-slate-900 placeholder:text-slate-400 p-2.5 rounded-[7px] bg-white border border-slate-300 focus:border-sky-600 focus:outline-none transition-all shadow-2xs ${
                    !title.trim() ? 'border-s-[3px] border-s-rose-500' : 'border-s-[3px] border-s-emerald-500'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-slate-800 mb-1 text-right">الوصف أو الملاحظات</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ملاحظات حول المحاضرة..."
                  rows={2}
                  className="w-full text-[13px] font-medium text-slate-900 placeholder:text-slate-400 p-2.5 rounded-[7px] bg-white border border-slate-300 focus:border-sky-600 focus:outline-none"
                />
              </div>

              {/* Cascading Selection */}
              <div className="p-3 bg-slate-50/90 rounded-[10px] border border-slate-200 space-y-3">
                {/* 1. College */}
                <div>
                  {currentUser.role === 'super_admin' ? (
                    <Select
                      label="الكلية"
                      value={collegeId}
                      onChange={(val) => {
                        setCollegeId(val);
                        const c = colleges.find((col) => col.id === val);
                        if (c && c.departments.length > 0) setDepartmentId(c.departments[0].id);
                      }}
                      required
                      placeholder="اختر الكلية..."
                      options={colleges.map((c) => ({ value: c.id, label: c.name }))}
                    />
                  ) : (
                    <div>
                      <span className="block text-[13px] font-bold text-slate-800 mb-1">الكلية</span>
                      <div className="p-2.5 bg-slate-200/80 rounded-[7px] text-slate-900 font-bold text-xs border border-slate-300">
                        {colleges.find((c) => c.id === currentUser.collegeId)?.name}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Department */}
                <div>
                  {currentUser.role === 'department_admin' || currentUser.role === 'doctor' ? (
                    <div>
                      <span className="block text-[13px] font-bold text-slate-800 mb-1">القسم</span>
                      <div className="p-2.5 bg-slate-200/80 rounded-[7px] text-slate-900 font-bold text-xs border border-slate-300">
                        {availableDepts.find((d) => d.id === currentUser.departmentId)?.name}
                      </div>
                    </div>
                  ) : (
                    <Select
                      label="القسم العلمي"
                      value={departmentId}
                      onChange={(val) => setDepartmentId(val)}
                      required
                      placeholder="اختر القسم..."
                      options={availableDepts.map((d) => ({ value: d.id, label: d.name }))}
                    />
                  )}
                </div>

                {/* Doctor specific subject selection */}
                {currentUser.role === 'doctor' ? (
                  <div className="space-y-3">
                    <Select
                      label="المادة الدراسية"
                      value={subjectId}
                      onChange={(val) => {
                        setSubjectId(val);
                        const chosen = myDoctorSubjects.find((s) => s.id === val);
                        if (chosen) {
                          setStage(chosen.stage);
                          setSectionTarget('all');
                        }
                      }}
                      required
                      placeholder="اختر المادة المسندة إليك..."
                      options={myDoctorSubjects.map((s) => {
                        const isTheory = s.theoryDoctorId === currentUser.id;
                        const isPractical = s.practicalDoctorId === currentUser.id;
                        let typeDesc = 'نظري وعملي';
                        if (isTheory && isPractical) typeDesc = 'نظري وعملي';
                        else if (isTheory) typeDesc = 'محاضرات نظرية';
                        else if (isPractical) typeDesc = 'مختبر وعملي';
                        return {
                          value: s.id,
                          label: s.name,
                          description: `المرحلة ${s.stage} (${typeDesc})`,
                        };
                      })}
                    />

                    <Select
                      label="الشعبة المستهدفة"
                      value={sectionTarget}
                      onChange={(val) => setSectionTarget(val)}
                      placeholder="كافة الشُعب"
                      options={[
                        { value: 'all', label: 'كافة الشُعب' },
                        ...availableSections.map((sec) => ({ value: sec.id, label: sec.name })),
                      ]}
                    />
                  </div>
                ) : (
                  <>
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
                          value={sectionTarget}
                          onChange={(val) => setSectionTarget(val)}
                          placeholder="كافة الشُعب"
                          options={[
                            { value: 'all', label: 'كافة الشُعب' },
                            ...availableSections.map((sec) => ({ value: sec.id, label: sec.name })),
                          ]}
                        />
                      </div>
                    </div>

                    <Select
                      label="المادة الدراسية"
                      value={subjectId}
                      onChange={(val) => setSubjectId(val)}
                      required
                      placeholder="اختر المادة الدراسية..."
                      options={availableSubjects.map((s) => ({
                        value: s.id,
                        label: s.name,
                        description: `المرحلة ${s.stage}`,
                      }))}
                    />
                  </>
                )}
              </div>

              {/* File upload */}
              <div>
                <label className="block text-[13px] font-bold text-slate-800 mb-1 text-right">ملف المحاضرة (PDF / PPTX / DOCX / MP4)</label>
                <input
                  type="file"
                  onChange={handleFile}
                  accept=".pdf,.pptx,.ppt,.docx,.mp4"
                  className={`w-full text-xs p-2 bg-white border rounded-[7px] cursor-pointer transition-all shadow-2xs ${
                    !selectedFile && !fileName ? 'border-s-[3px] border-s-rose-500' : 'border-s-[3px] border-s-emerald-500'
                  }`}
                />
                {fileName && <p className="text-[11px] font-bold text-emerald-800 mt-1">{fileName} ({fileSize})</p>}
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
                  disabled={isUploading}
                  className="px-5 py-2 text-xs bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl cursor-pointer font-black flex items-center gap-1.5 disabled:opacity-50 shadow-md shadow-sky-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUploading ? 'جاري الرفع...' : 'حفظ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
