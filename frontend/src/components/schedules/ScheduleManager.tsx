// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file ScheduleManager.tsx
 * @description إدارة واستعراض جداول المحاضرات اليومية والأسبوعية
 * @created 2026-10-21
 */
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Schedule } from '@/types';
import {
  Calendar,
  UploadCloud,
  Eye,
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  X,
  FileImage,
  AlertCircle,
  Plus,
} from 'lucide-react';
import Select from '@/components/common/Select';

export default function ScheduleManager() {
  const { currentUser, colleges, sections, schedules, addSchedule, deleteSchedule } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [zoomSchedule, setZoomSchedule] = useState<Schedule | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [collegeId, setCollegeId] = useState(currentUser.collegeId || colleges[0]?.id || '');
  const [departmentId, setDepartmentId] = useState(currentUser.departmentId || colleges[0]?.departments[0]?.id || '');
  const [stage, setStage] = useState<number>(currentUser.stage || 1);
  const [sectionTarget, setSectionTarget] = useState<string>('all');
  const [semester, setSemester] = useState<1 | 2>(1);
  const [notes, setNotes] = useState('الدوام يبدأ يومياً الساعة 8:30 صباحاً من السبت إلى الأربعاء.');
  const [imageUrl, setImageUrl] = useState('/images/schedule-placeholder.svg');

  const isSuper = currentUser.role === 'super_admin';
  const isDean = currentUser.role === 'college_admin';
  const isHead = currentUser.role === 'department_admin';
  const canManage = isSuper || isDean || isHead;

  // Department heads can only manage their own department
  const selectedCol = colleges.find(c => c.id === collegeId);
  const availableDepts = selectedCol?.departments || [];
  const availableSections = sections.filter(
    s => s.collegeId === collegeId && s.departmentId === departmentId && s.stage === stage
  );

  const filteredSchedules = schedules.filter(sch => {
    if (isSuper) return true;
    if (isDean) return sch.collegeId === currentUser.collegeId;
    if (isHead) return sch.collegeId === currentUser.collegeId && sch.departmentId === currentUser.departmentId;
    if (currentUser.role === 'doctor') {
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const targetSec = sections.find(s => s.id === sectionTarget);
    const secName = sectionTarget === 'all' ? 'كافة الشعب' : targetSec?.name || 'شعبة محددة';

    await addSchedule({
      title: title.trim(),
      collegeId,
      departmentId,
      stage,
      sectionTarget,
      sectionName: secName,
      semester,
      academicYear: '2026-2027',
      type: 'image',
      imageUrl,
      notes: notes.trim(),
      daysRange: 'من السبت إلى الأربعاء',
      createdById: currentUser.id,
      createdByName: `${currentUser.name} (${currentUser.title || 'رئاسة القسم'})`,
    });

    setModalOpen(false);
    setTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            <h3 className="text-base font-black text-slate-900">جداول المحاضرات الأسبوعية (السبت - الأربعاء)</h3>
          </div>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            الجداول المعتمدة من رئاسة الأقسام العلمية لتوزيع المحاضرات والقاعات والمختبرات.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#041633] to-[#0c2b64] hover:from-[#0c2b64] hover:to-[#13408a] text-white text-xs font-black shadow-md shadow-slate-900/10 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-cyan-300" />
            <span>إضافة جدول أسبوعي</span>
          </button>
        )}
      </div>

      {/* Schedules Grid */}
      {filteredSchedules.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">لا يوجد جدول أسبوعي منشور حالياً</h4>
          <p className="text-xs text-slate-500 mt-1">سيقوم رئيس القسم باعتماد ونشر الجدول قريباً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSchedules.map(sch => {
            const col = colleges.find(c => c.id === sch.collegeId);
            const dept = col?.departments.find(d => d.id === sch.departmentId);
            return (
              <div
                key={sch.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Badge */}
                  <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-cyan-100 text-cyan-900">
                        المرحلة {sch.stage} • {sch.sectionName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 text-blue-900">
                        {sch.daysRange}
                      </span>
                    </div>
                    {canManage && (
                      <button
                        onClick={() => deleteSchedule(sch.id)}
                        className="p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                        title="حذف الجدول"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Schedule Image Preview */}
                  <div
                    onClick={() => setZoomSchedule(sch)}
                    className="relative bg-slate-100 p-2 cursor-pointer group border-b border-slate-100 overflow-hidden"
                  >
                    <img
                      src={sch.imageUrl || '/images/schedule-placeholder.svg'}
                      alt={sch.title}
                      className="w-full h-52 object-contain bg-white rounded-xl shadow-xs group-hover:scale-[1.01] transition-transform"
                    />
                    <div className="absolute inset-0 bg-[#041633]/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-xs">
                      <span className="px-4 py-2 rounded-xl bg-white text-[#041633] text-xs font-black flex items-center gap-2 shadow-lg">
                        <Eye className="w-4 h-4 text-cyan-600" />
                        <span>تكبير الجدول وملء الشاشة</span>
                      </span>
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="p-4 space-y-2">
                    <h4 className="font-black text-slate-900 text-sm">{sch.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {sch.notes || 'الدوام يبدأ من السبت إلى الأربعاء وفق التوقيتات المعتمدة.'}
                    </p>
                    <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-2 font-semibold">
                      <span>{dept?.name || 'القسم العلمي'}</span>
                      <span className="text-[11px] text-slate-400">{sch.createdByName}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 pt-0 flex items-center justify-end gap-2">
                  <a
                    href={sch.imageUrl || '/images/schedule-placeholder.svg'}
                    download={`${sch.title}.svg`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all"
                  >
                    <Download className="w-4 h-4 text-cyan-600" />
                    <span>تحميل الجدول كصورة</span>
                  </a>
                  <button
                    onClick={() => setZoomSchedule(sch)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#041633] hover:bg-[#0c2b64] text-white text-xs font-bold transition-all shadow-sm"
                  >
                    <Eye className="w-4 h-4 text-cyan-300" />
                    <span>عرض ملء الشاشة</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add New Schedule */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-600" />
                <h3 className="text-sm font-black text-slate-900">إضافة جدول محاضرات أسبوعي جديد</h3>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">عنوان الجدول</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="مثال: جدول المحاضرات الأسبوعي للمرحلة الأولى - الفصل الأول"
                  className={`w-full p-2.5 rounded-lg border outline-none font-semibold ${
                    title.trim() ? 'border-s-[3px] border-s-emerald-500 border-slate-300' : 'border-s-[3px] border-s-rose-500 border-slate-200'
                  }`}
                />
              </div>

              {isSuper && (
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    label="الكلية"
                    value={collegeId}
                    onChange={setCollegeId}
                    options={colleges.map(c => ({ value: c.id, label: c.name }))}
                  />
                  <Select
                    label="القسم العلمي"
                    value={departmentId}
                    onChange={setDepartmentId}
                    options={availableDepts.map(d => ({ value: d.id, label: d.name }))}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="المرحلة الدراسية"
                  value={String(stage)}
                  onChange={v => setStage(Number(v))}
                  options={[1, 2, 3, 4, 5].map(stg => ({ value: String(stg), label: `المرحلة ${stg}` }))}
                />
                <Select
                  label="الشعبة المستهدفة"
                  value={sectionTarget}
                  onChange={setSectionTarget}
                  options={[
                    { value: 'all', label: 'كافة الشعب' },
                    ...availableSections.map(s => ({ value: s.id, label: s.name })),
                  ]}
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">رفع صورة الجدول المعتمد</label>
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-cyan-500 transition-colors bg-slate-50">
                  <UploadCloud className="w-7 h-7 text-cyan-600 mx-auto mb-1.5" />
                  <span className="text-xs font-bold text-slate-700 block">اضغط لاختيار صورة الجدول (JPG, PNG, SVG)</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="sched-file" />
                  <label htmlFor="sched-file" className="mt-2 inline-block px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 cursor-pointer shadow-xs">
                    تصفح الملفات
                  </label>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">ملاحظات وتوقيتات الدوام</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 rounded-lg border border-slate-200 outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#041633] to-[#0c2b64] text-white font-black shadow-md shadow-slate-900/10"
                >
                  حفظ ونشر الجدول
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {zoomSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-5 space-y-3 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-100">
              <h3 className="text-sm font-black text-slate-900">{zoomSchedule.title}</h3>
              <button onClick={() => setZoomSchedule(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-50 rounded-xl p-2 flex items-center justify-center">
              <img src={zoomSchedule.imageUrl || '/images/schedule-placeholder.svg'} alt={zoomSchedule.title} className="max-w-full h-auto rounded-lg shadow-sm" />
            </div>
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-slate-500 font-bold">{zoomSchedule.notes}</span>
              <a
                href={zoomSchedule.imageUrl || '/images/schedule-placeholder.svg'}
                download={`${zoomSchedule.title}.svg`}
                className="px-4 py-2 rounded-xl bg-[#041633] text-white font-black flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-cyan-300" />
                <span>تحميل</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
