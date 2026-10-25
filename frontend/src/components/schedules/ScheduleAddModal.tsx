// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file ScheduleAddModal.tsx
 * @description نموذج إضافة جدول أسبوعي للطلاب أو للأستاذ التدريسي
 * @created 2026-10-21
 */
import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ScheduleTargetType } from '@/types';
import { Calendar, UploadCloud, X, UserCheck, GraduationCap } from 'lucide-react';
import Select from '@/components/common/Select';

interface Props {
  onClose: () => void;
}

export default function ScheduleAddModal({ onClose }: Props) {
  const { currentUser, colleges, sections, users, addSchedule } = useApp();

  const [targetType, setTargetType] = useState<ScheduleTargetType>('stage');
  const [title, setTitle] = useState('');
  const [collegeId, setCollegeId] = useState(currentUser.collegeId || colleges[0]?.id || '');
  const [departmentId, setDepartmentId] = useState(currentUser.departmentId || colleges[0]?.departments[0]?.id || '');
  const [stage, setStage] = useState<number>(currentUser.stage || 1);
  const [sectionTarget, setSectionTarget] = useState<string>('all');
  const [doctorId, setDoctorId] = useState<string>('');
  const [notes, setNotes] = useState('الدوام يبدأ يومياً الساعة 8:30 صباحاً وفق القاعات والمختبرات المحددة.');
  const [imageUrl, setImageUrl] = useState('/images/schedule-placeholder.svg');

  const isSuper = currentUser.role === 'super_admin';
  const selectedCol = colleges.find(c => c.id === collegeId);
  const availableDepts = selectedCol?.departments || [];
  const availableSections = sections.filter(
    s => s.collegeId === collegeId && s.departmentId === departmentId && s.stage === stage
  );
  const deptDoctors = users.filter(
    u => u.role === 'doctor' && (!departmentId || u.departmentId === departmentId)
  );

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = title.trim() || (
      targetType === 'doctor'
        ? `الجدول الأسبوعي للأستاذ التدريسي: ${deptDoctors.find(d => d.id === doctorId)?.name || 'تدريسي'}`
        : `الجدول الأسبوعي للمرحلة ${stage}`
    );

    const targetSec = sections.find(s => s.id === sectionTarget);
    const secName = sectionTarget === 'all' ? 'كافة الشعب' : targetSec?.name || 'شعبة محددة';
    const doc = deptDoctors.find(d => d.id === doctorId);

    await addSchedule({
      title: finalTitle,
      targetType,
      collegeId,
      departmentId,
      stage: targetType === 'stage' ? stage : undefined,
      sectionTarget: targetType === 'stage' ? sectionTarget : undefined,
      sectionName: targetType === 'stage' ? secName : undefined,
      doctorId: targetType === 'doctor' ? doctorId : undefined,
      doctorName: targetType === 'doctor' ? doc?.name : undefined,
      semester: 1,
      academicYear: '2026-2027',
      type: 'image',
      imageUrl,
      notes: notes.trim(),
      daysRange: 'من السبت إلى الأربعاء',
      createdById: currentUser.id,
      createdByName: `${currentUser.name} (${currentUser.title || 'رئاسة القسم'})`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[10px] max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-600" />
            <h3 className="text-sm font-black text-slate-900">إضافة جدول أسبوعي كامل (صورة واحدة)</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Schedule Target Switcher */}
          <div>
            <label className="font-bold text-slate-700 block mb-1.5">الجهة المستهدفة بالجدول</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl font-bold">
              <button
                type="button"
                onClick={() => setTargetType('stage')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                  targetType === 'stage' ? 'bg-[#041633] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>جدول مرحلة (للطلاب)</span>
              </button>
              <button
                type="button"
                onClick={() => setTargetType('doctor')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                  targetType === 'doctor' ? 'bg-[#041633] text-white shadow-xs' : 'text-slate-600 hover:bg-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>جدول تدريسي (للأستاذ)</span>
              </button>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">عنوان الجدول</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={targetType === 'doctor' ? 'مثال: الجدول الأسبوعي للأستاذ د. حيدر كاظم' : 'مثال: الجدول الأسبوعي لمحاضرات المرحلة الأولى'}
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

          {targetType === 'stage' ? (
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
          ) : (
            <div>
              <Select
                label="الأستاذ التدريسي المستهدف"
                value={doctorId}
                onChange={setDoctorId}
                placeholder="-- اختر الأستاذ التدريسي --"
                options={deptDoctors.map(doc => ({ value: doc.id, label: doc.name }))}
              />
            </div>
          )}

          {/* Single Weekly Image Upload */}
          <div>
            <label className="font-bold text-slate-700 block mb-1">صورة الجدول الأسبوعي الكامل</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center hover:border-cyan-500 transition-colors bg-slate-50">
              <UploadCloud className="w-7 h-7 text-cyan-600 mx-auto mb-1" />
              <span className="text-xs font-bold text-slate-700 block">اختر صورة الجدول الأسبوعي الشامل (SVG, PNG, JPG)</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="sched-file-single" />
              <label htmlFor="sched-file-single" className="mt-2 inline-block px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer shadow-xs">
                تصفح واستبدال الصورة
              </label>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">ملاحظات وتوجيهات الدوام</label>
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
