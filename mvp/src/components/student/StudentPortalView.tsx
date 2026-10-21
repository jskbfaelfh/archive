// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file StudentPortalView.tsx
 * @description بوابة الطالب الأكاديمية لاستعراض المحاضرات والجدول الأسبوعي
 * @created 2026-10-21
 */
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Lecture } from '@/types';
import ScheduleManager from '@/components/schedules/ScheduleManager';
import {
  BookOpen,
  FileText,
  Download,
  Eye,
  Search,
  Calendar,
  UserCheck,
  X,
  LayoutGrid,
  List,
} from 'lucide-react';

export default function StudentPortalView() {
  const { currentUser, colleges, subjects, lectures, updateLecture, activeTab } = useApp();

  const isScheduleTab = activeTab === 'schedules';
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [semesterFilter, setSemesterFilter] = useState<'all' | 1 | 2>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewLecture, setPreviewLecture] = useState<Lecture | null>(null);

  const myCollege = colleges.find(c => c.id === currentUser.collegeId);
  const myDept = myCollege?.departments.find(d => d.id === currentUser.departmentId);

  const mySubjects = subjects.filter(s =>
    (!currentUser.collegeId || s.collegeId === currentUser.collegeId) &&
    (!currentUser.departmentId || s.departmentId === currentUser.departmentId) &&
    (!currentUser.stage || s.stage === currentUser.stage)
  );

  const myLectures = lectures.filter(lec => {
    if (currentUser.collegeId && lec.collegeId !== currentUser.collegeId) return false;
    if (currentUser.departmentId && lec.departmentId !== currentUser.departmentId) return false;
    if (currentUser.stage && lec.stage !== currentUser.stage) return false;
    if (lec.sectionTarget !== 'all' && currentUser.sectionId && lec.sectionTarget !== currentUser.sectionId) return false;
    if (selectedSubjectId !== 'all' && lec.subjectId !== selectedSubjectId) return false;
    if (semesterFilter !== 'all') {
      const sub = subjects.find(s => s.id === lec.subjectId);
      if (sub && sub.semester !== semesterFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const match = lec.title.toLowerCase().includes(q) || lec.doctorName.toLowerCase().includes(q) ||
        (lec.description && lec.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleDownload = (lec: Lecture) => {
    updateLecture(lec.id, { downloadsCount: (lec.downloadsCount || 0) + 1 });
    const blob = new Blob([`محاضرة: ${lec.title}\nالجامعة: جامعة الزهراوي\nالتدريسي: ${lec.doctorName}`], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = lec.fileName || `${lec.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* 1. Student Academic Profile Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
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
            <div className="text-xs text-slate-500 font-bold">المقررات</div>
            <div className="text-lg font-black text-[#041633]">{mySubjects.length}</div>
          </div>
          <div className="text-center px-3">
            <div className="text-xs text-slate-500 font-bold">المحاضرات</div>
            <div className="text-lg font-black text-cyan-600">{myLectures.length}</div>
          </div>
        </div>
      </div>

      {isScheduleTab ? (
        <ScheduleManager />
      ) : (
        <>
          {/* Subjects Filter Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedSubjectId('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedSubjectId === 'all'
                  ? 'bg-gradient-to-r from-[#041633] to-[#0c2b64] text-white shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              جميع المقررات ({myLectures.length})
            </button>
            {mySubjects.map(sub => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubjectId(sub.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  selectedSubjectId === sub.id
                    ? 'bg-gradient-to-r from-[#041633] to-[#0c2b64] text-white shadow-md'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <span>{sub.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-cyan-100 text-cyan-900 border border-cyan-200">
                  {sub.subjectType === 'theory' ? 'نظري' : sub.subjectType === 'practical' ? 'عملي' : 'نظري وعملي'}
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700">
                  {lectures.filter(l => l.subjectId === sub.id).length}
                </span>
              </button>
            ))}
          </div>

          {/* Search Controls */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ابحث بالمحاضرة أو التدريسي..."
                className={`w-full pr-10 pl-4 py-2 text-xs font-semibold rounded-xl border outline-none ${
                  searchQuery.trim() ? 'border-s-[3px] border-s-emerald-500 border-slate-300' : 'border-s-[3px] border-s-cyan-500 border-slate-200'
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button onClick={() => setSemesterFilter('all')} className={`px-2.5 py-1 rounded-lg ${semesterFilter === 'all' ? 'bg-white shadow-xs' : ''}`}>الكل</button>
                <button onClick={() => setSemesterFilter(1)} className={`px-2.5 py-1 rounded-lg ${semesterFilter === 1 ? 'bg-white shadow-xs' : ''}`}>فصل 1</button>
                <button onClick={() => setSemesterFilter(2)} className={`px-2.5 py-1 rounded-lg ${semesterFilter === 2 ? 'bg-white shadow-xs' : ''}`}>فصل 2</button>
              </div>
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg ${viewMode === 'grid' ? 'bg-white shadow-xs' : ''}`}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg ${viewMode === 'list' ? 'bg-white shadow-xs' : ''}`}><List className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* Lectures Cards */}
          {myLectures.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">لا توجد محاضرات مطابقة لبحثك</h4>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myLectures.map(lec => (
                <div key={lec.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-rose-50 text-rose-700 border border-rose-200">{lec.fileType?.toUpperCase()}</span>
                      <span className="text-[11px] text-slate-500 font-bold">{lec.fileSize}</span>
                    </div>
                    <span className="text-[11px] font-extrabold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-lg">{lec.subjectName}</span>
                    <h4 className="font-black text-slate-900 text-sm line-clamp-2">{lec.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{lec.description || 'محاضرة تخصصية معتمدة.'}</p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-bold">{lec.doctorName}</span>
                      <span className="text-[11px] text-slate-400">{lec.uploadDate}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setPreviewLecture(lec)} className="py-2 rounded-xl bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> معاينة
                      </button>
                      <button onClick={() => handleDownload(lec)} className="py-2 rounded-xl bg-[#041633] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs">
                        <Download className="w-3.5 h-3.5 text-cyan-300" /> تحميل
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100">
              {myLectures.map(lec => (
                <div key={lec.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-cyan-700">{lec.subjectName}</span>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{lec.title}</h4>
                    <div className="text-xs text-slate-500 mt-1">{lec.doctorName} • {lec.uploadDate} • {lec.fileSize}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPreviewLecture(lec)} className="px-3.5 py-2 rounded-xl bg-slate-100 text-xs font-bold">معاينة</button>
                    <button onClick={() => handleDownload(lec)} className="px-4 py-2 rounded-xl bg-[#041633] text-white text-xs font-bold flex items-center gap-1.5">
                      <Download className="w-3.5 h-3.5 text-cyan-300" /> تحميل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Preview Modal */}
      {previewLecture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <span className="text-xs font-bold text-cyan-700">{previewLecture.subjectName}</span>
              <button onClick={() => setPreviewLecture(null)}><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <h3 className="text-base font-black text-slate-900">{previewLecture.title}</h3>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl">{previewLecture.description || 'المحتوى الأكاديمي المرفوع يغطي المحاور المعتمدة.'}</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setPreviewLecture(null)} className="px-4 py-2 text-xs font-bold text-slate-600">إغلاق</button>
              <button onClick={() => { handleDownload(previewLecture); setPreviewLecture(null); }} className="px-5 py-2.5 rounded-xl bg-[#041633] text-white text-xs font-bold flex items-center gap-1.5">
                <Download className="w-4 h-4 text-cyan-300" /> تحميل المحاضرة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
