// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file StudentPortalView.tsx
 * @description بوابة الطالب الأكاديمية لاستعراض وتحميل المحاضرات والمقررات
 * @created 2026-10-21
 */
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Lecture } from '@/types';
import {
  BookOpen,
  FileText,
  Download,
  Eye,
  Search,
  Sparkles,
  Calendar,
  GraduationCap,
  Layers,
  UserCheck,
  CheckCircle2,
  FileSpreadsheet,
  X,
  LayoutGrid,
  List,
} from 'lucide-react';

export default function StudentPortalView() {
  const { currentUser, colleges, subjects, lectures, updateLecture } = useApp();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<'all' | 1 | 2>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewLecture, setPreviewLecture] = useState<Lecture | null>(null);

  // Student Context
  const myCollege = colleges.find(c => c.id === currentUser.collegeId);
  const myDept = myCollege?.departments.find(d => d.id === currentUser.departmentId);

  // Student Subjects
  const mySubjects = subjects.filter(s =>
    (!currentUser.collegeId || s.collegeId === currentUser.collegeId) &&
    (!currentUser.departmentId || s.departmentId === currentUser.departmentId) &&
    (!currentUser.stage || s.stage === currentUser.stage)
  );

  // Student Lectures
  const myLectures = lectures.filter(lec => {
    if (currentUser.collegeId && lec.collegeId !== currentUser.collegeId) return false;
    if (currentUser.departmentId && lec.departmentId !== currentUser.departmentId) return false;
    if (currentUser.stage && lec.stage !== currentUser.stage) return false;
    if (lec.sectionTarget !== 'all' && currentUser.sectionId && lec.sectionTarget !== currentUser.sectionId) {
      return false;
    }
    if (selectedSubjectId !== 'all' && lec.subjectId !== selectedSubjectId) return false;
    if (semesterFilter !== 'all') {
      const sub = subjects.find(s => s.id === lec.subjectId);
      if (sub && sub.semester !== semesterFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = lec.title.toLowerCase().includes(q);
      const matchDoc = lec.doctorName.toLowerCase().includes(q);
      const matchDesc = lec.description?.toLowerCase().includes(q) || false;
      const matchSub = lec.subjectName?.toLowerCase().includes(q) || false;
      if (!matchTitle && !matchDoc && !matchDesc && !matchSub) return false;
    }
    return true;
  });

  const handleDownload = (lec: Lecture) => {
    updateLecture(lec.id, { downloadsCount: (lec.downloadsCount || 0) + 1 });
    // Trigger virtual download
    const blob = new Blob([`محتوى المحاضرة: ${lec.title}\nالجامعة: جامعة الزهراوي\nالتدريسي: ${lec.doctorName}`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = lec.fileName || `${lec.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreview = (lec: Lecture) => {
    updateLecture(lec.id, { viewsCount: (lec.viewsCount || 0) + 1 });
    setPreviewLecture(lec);
  };

  return (
    <div className="space-y-6">
      {/* 1. Student Academic Profile Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#041633] to-[#0c2b64] text-cyan-300 flex items-center justify-center font-black text-xl shadow-md border border-cyan-500/30 shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">{currentUser.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-cyan-100 text-cyan-900 border border-cyan-300">
                  طالب منتظم
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1 font-semibold">
                <span>{myCollege?.name || 'كلية الطب البشري'}</span>
                <span>•</span>
                <span>{myDept?.name || 'قسم الجراحة العامة'}</span>
                <span>•</span>
                <span className="text-cyan-800 font-bold">المرحلة {currentUser.stage || 1}</span>
                <span>•</span>
                <span className="text-emerald-700 font-bold">{currentUser.sectionName || 'شعبة (أ)'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 self-start md:self-auto">
            <div className="text-center px-3 border-l border-slate-200">
              <div className="text-xs text-slate-500 font-bold">المواد المسجلة</div>
              <div className="text-lg font-black text-[#041633]">{mySubjects.length}</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-slate-500 font-bold">المحاضرات المتاحة</div>
              <div className="text-lg font-black text-cyan-600">{myLectures.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Subjects Filter Chips */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-cyan-600" />
            <span>المقررات الدراسية الخاصة بك:</span>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedSubjectId === 'all'
                ? 'bg-gradient-to-r from-[#041633] to-[#0c2b64] text-white shadow-md shadow-slate-900/10'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }`}
          >
            جميع المقررات ({myLectures.length})
          </button>
          {mySubjects.map(sub => {
            const count = lectures.filter(l => l.subjectId === sub.id).length;
            const isSelected = selectedSubjectId === sub.id;
            return (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#041633] to-[#0c2b64] text-white shadow-md shadow-slate-900/10'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{sub.name}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? 'bg-white/20 text-cyan-200' : 'bg-slate-100 text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Search and View Controls */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المحاضرة، التدريسي، أو الوصف..."
            className={`w-full pr-10 pl-4 py-2 text-xs font-semibold rounded-xl border outline-none transition-all ${
              searchQuery.trim() ? 'border-s-[3px] border-s-emerald-500 border-slate-300' : 'border-s-[3px] border-s-cyan-500 border-slate-200'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setSemesterFilter('all')}
              className={`px-2.5 py-1 rounded-lg ${semesterFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              كافة الفصول
            </button>
            <button
              onClick={() => setSemesterFilter(1)}
              className={`px-2.5 py-1 rounded-lg ${semesterFilter === 1 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              فصل 1
            </button>
            <button
              onClick={() => setSemesterFilter(2)}
              className={`px-2.5 py-1 rounded-lg ${semesterFilter === 2 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
            >
              فصل 2
            </button>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white text-[#041633] shadow-sm' : 'text-slate-500'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white text-[#041633] shadow-sm' : 'text-slate-500'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Lectures List / Grid */}
      {myLectures.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">لا توجد محاضرات مطابقة لبحثك حالياً</h4>
          <p className="text-xs text-slate-500 mt-1">تأكد من اختيار المادة الصحيحة أو قم بمسح نص البحث.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {myLectures.map(lec => (
            <div
              key={lec.id}
              className="bg-white rounded-2xl border border-slate-200/90 hover:border-cyan-500/50 hover:shadow-md transition-all p-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200">
                    <FileText className="w-3 h-3 text-rose-600" />
                    {lec.fileType?.toUpperCase() || 'PDF'}
                  </span>
                  <span className="text-[11px] text-slate-500 font-bold">{lec.fileSize || '3.5 MB'}</span>
                </div>

                <div>
                  <span className="text-[11px] font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-lg">
                    {lec.subjectName || 'مادة تخصصية'}
                  </span>
                  <h4 className="font-black text-slate-900 text-sm mt-2 line-clamp-2 group-hover:text-cyan-900 transition-colors">
                    {lec.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 font-medium">
                    {lec.description || 'لا يوجد وصف تفصيلي إضافي للمحاضرة.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 font-bold">
                    <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{lec.doctorName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-semibold">{lec.uploadDate}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePreview(lec)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>معاينة</span>
                  </button>
                  <button
                    onClick={() => handleDownload(lec)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-[#041633] to-[#0c2b64] hover:from-[#0c2b64] hover:to-[#13408a] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-300" />
                    <span>تحميل</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
          {myLectures.map(lec => (
            <div key={lec.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-100 text-rose-800">
                    {lec.fileType?.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold text-cyan-700">{lec.subjectName}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{lec.title}</h4>
                <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                  <span>الأستاذ: {lec.doctorName}</span>
                  <span>•</span>
                  <span>التاريخ: {lec.uploadDate}</span>
                  <span>•</span>
                  <span>الحجم: {lec.fileSize}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handlePreview(lec)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة</span>
                </button>
                <button
                  onClick={() => handleDownload(lec)}
                  className="px-4 py-2 rounded-xl bg-[#041633] hover:bg-[#0c2b64] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-300" />
                  <span>تحميل</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. Lecture Preview Modal */}
      {previewLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800">
                  {previewLecture.fileType?.toUpperCase()}
                </span>
                <span className="text-xs font-bold text-cyan-700">{previewLecture.subjectName}</span>
              </div>
              <button onClick={() => setPreviewLecture(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <h3 className="text-base font-black text-slate-900">{previewLecture.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                {previewLecture.description || 'المحتوى الأكاديمي المرفوع يغطي المحاور والمحاضرات النظرية والتطبيقية لهذا المقرر.'}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 py-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-semibold text-[11px]">الأستاذ المحاضر</div>
                <div className="font-bold text-slate-800 mt-0.5">{previewLecture.doctorName}</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="text-slate-400 font-semibold text-[11px]">تاريخ الرفع</div>
                <div className="font-bold text-slate-800 mt-0.5">{previewLecture.uploadDate}</div>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
                <div className="text-slate-400 font-semibold text-[11px]">حجم الملف</div>
                <div className="font-bold text-slate-800 mt-0.5">{previewLecture.fileSize || '3.5 MB'}</div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setPreviewLecture(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  handleDownload(previewLecture);
                  setPreviewLecture(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#041633] to-[#0c2b64] text-white text-xs font-black flex items-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4 text-cyan-300" />
                <span>تحميل المحاضرة الآن</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
