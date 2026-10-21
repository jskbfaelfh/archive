// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file ScheduleAddModal.tsx
 * @description نموذج إضافة أو تحديث جدول المحاضرات اليومي برئاسة القسم
 * @created 2026-10-21
 */
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DayKey, WEEK_DAYS } from '@/types';
import { Calendar, UploadCloud, X, CheckCircle2 } from 'lucide-react';
import Select from '@/components/common/Select';

interface Props {
  onClose: () => void;
}

export default function ScheduleAddModal({ onClose }: Props) {
  const { currentUser, colleges, sections, addSchedule } = useApp();

  const [title, setTitle] = useState('');
  const [collegeId, setCollegeId] = useState(currentUser.collegeId || colleges[0]?.id || '');
  const [departmentId, setDepartmentId] = useState(currentUser.departmentId || colleges[0]?.departments[0]?.id || '');
  const [stage, setStage] = useState<number>(currentUser.stage || 1);
  const [sectionTarget, setSectionTarget] = useState<string>('all');
  const [semester, setSemester] = useState<1 | 2>(1);
  const [notes, setNotes] = useState('الدوام يبدأ يومياً الساعة 8:30 صباحاً في القاعات المحددة.');

  // Daily Images mapping
  const [dailyImages, setDailyImages] = useState<Record<DayKey, string>>({
    saturday: '/images/schedules/saturday.svg',
    sunday: '/images/schedules/sunday.svg',
    monday: '/images/schedules/monday.svg',
    tuesday: '/images/schedules/tuesday.svg',
    wednesday: '/images/schedules/wednesday.svg',
  });

  const isSuper = currentUser.role === 'super_admin';
  const selectedCol = colleges.find(c => c.id === collegeId);
  const availableDepts = selectedCol?.departments || [];
  const availableSections = sections.filter(
    s => s.collegeId === collegeId && s.departmentId === departmentId && s.stage === stage
  );

  const handleFileUpload = (day: DayKey, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setDailyImages(prev => ({ ...prev, [day]: url }));
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
      imageUrl: dailyImages.saturday || '/images/schedules/saturday.svg',
      dailyImages,
      notes: notes.trim(),
      daysRange: 'من السبت إلى الأربعاء',
      createdById: currentUser.id,
      createdByName: `${currentUser.name} (${currentUser.title || 'رئاسة القسم'})`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            <h3 className="text-sm font-black text-slate-900">إضافة جدول أسبوعي (صور يومية السبت - الأربعاء)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">عنوان الجدول</label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: جدول المحاضرات الأسبوعي للمرحلة الأولى - الفصل الأول"
              className="w-full p-2.5 rounded-xl border border-slate-300 outline-none font-semibold focus:border-cyan-600"
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

          {/* Daily Images Upload List */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">
              صور الجداول اليومية (من السبت إلى الأربعاء)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {WEEK_DAYS.map(d => {
                const img = dailyImages[d.key];
                return (
                  <div
                    key={d.key}
                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#041633] text-white flex items-center justify-center text-[10px] font-black">
                        {d.label[0]}
                      </span>
                      <div>
                        <span className="font-black text-slate-800 block text-xs">يوم {d.label}</span>
                        <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {img ? 'الصورة جاهزة' : 'بانتظار الصورة'}
                        </span>
                      </div>
                    </div>
                    <label
                      htmlFor={`file-${d.key}`}
                      className="cursor-pointer px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] font-bold text-cyan-800 hover:bg-cyan-50 shadow-xs flex items-center gap-1"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>تغيير</span>
                    </label>
                    <input
                      id={`file-${d.key}`}
                      type="file"
                      accept="image/*"
                      onChange={e => handleFileUpload(d.key, e)}
                      className="hidden"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">ملاحظات وتوجيهات الحضور</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-xl border border-slate-200 outline-none font-semibold text-slate-800"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
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
  );
}
