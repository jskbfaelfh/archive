// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file FeedbackNotesCard.tsx
 * @description بطاقة استعراض الملاحظات ولقطات الشاشة الواردة من ستيكر الملاحظات وإعداد مفتاح الربط المركزي
 * @created 2026-10-25
 */
import React, { useState, useEffect } from 'react';
import { MessageSquarePlus, Key, Trash2, ExternalLink, Image as ImageIcon, Check, Clock, User } from 'lucide-react';
import { useDialog } from '@/context/DialogContext';

interface StoredFeedbackNote {
  id?: string;
  title: string;
  content: string;
  sender: string;
  senderEmail?: string;
  workplace?: string;
  pageUrl?: string;
  imageUrl?: string;
  createdAt: string;
}

export const FeedbackNotesCard: React.FC = () => {
  const dialog = useDialog();
  const [notes, setNotes] = useState<StoredFeedbackNote[]>([]);
  const [apiKey, setApiKey] = useState<string>(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('alzahrawi_feedback_api_key') || '';
    }
    return '';
  });
  const [savedKeyNotice, setSavedKeyNotice] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadNotes = () => {
    try {
      const raw = localStorage.getItem('university_project_notes');
      if (raw) {
        setNotes(JSON.parse(raw));
      } else {
        setNotes([]);
      }
    } catch {
      setNotes([]);
    }
  };

  useEffect(() => {
    loadNotes();
    const handler = () => loadNotes();
    window.addEventListener('feedback_notes_updated', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('feedback_notes_updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const handleSaveApiKey = () => {
    localStorage.setItem('alzahrawi_feedback_api_key', apiKey.trim());
    setSavedKeyNotice(true);
    setTimeout(() => setSavedKeyNotice(false), 2000);
  };

  const handleDeleteNote = async (idx: number) => {
    const ok = await dialog.confirm({
      title: 'حذف الملاحظة',
      message: 'هل أنت متأكد من حذف هذه الملاحظة من السجل؟',
      isDanger: true,
      confirmText: 'حذف',
      cancelText: 'إلغاء',
    });
    if (!ok) return;
    const updated = notes.filter((_, i) => i !== idx);
    setNotes(updated);
    localStorage.setItem('university_project_notes', JSON.stringify(updated));
  };

  return (
    <div className="bg-white rounded-[10px] sm:rounded-2xl shadow-sm border border-slate-200 p-3.5 sm:p-6 space-y-4 sm:space-y-5">
      {/* رأس البطاقة */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-[7px] sm:rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0">
            <MessageSquarePlus className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-base font-bold text-slate-800">
              <span className="hidden sm:inline">سجل الملاحظات والشكاوى المستلمة (ستيكر الملاحظات)</span>
              <span className="sm:hidden">سجل الملاحظات</span>
            </h3>
            <p className="text-xs text-slate-500 hidden sm:block">
              استعراض الملاحظات ولقطات الشاشة المرسلة من المستخدمين وإعداد مفتاح الربط مع نظام إدارة المشاريع
            </p>
          </div>
        </div>
        <span className="text-[10px] sm:text-xs bg-purple-50 text-purple-800 border border-purple-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-bold shrink-0">
          {notes.length} ملاحظة
        </span>
      </div>

      {/* إعداد مفتاح X-Feedback-Key */}
      <div className="bg-slate-50 p-3 sm:p-4 rounded-[10px] border border-slate-200 space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          <span className="hidden sm:inline">مفتاح ربط نظام إدارة المشاريع المركزي (X-Feedback-Key - اختياري)</span>
          <span className="sm:hidden">مفتاح ربط المشاريع (اختياري)</span>
        </label>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Key className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="أدخل مفتاح المشروع لإرسال الملاحظات سحابياً إلى project.management.alzahu.edu.iq"
              className="w-full min-w-0 pr-9 pl-3 py-2 bg-white border border-slate-200 rounded-[7px] text-xs font-mono text-slate-800 focus:border-purple-500 focus:outline-none"
              dir="ltr"
            />
          </div>
          <button
            type="button"
            onClick={handleSaveApiKey}
            className="w-full sm:w-auto justify-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-[7px] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{savedKeyNotice ? 'تم الحفظ' : 'حفظ المفتاح'}</span>
          </button>
        </div>
      </div>

      {/* قائمة الملاحظات */}
      {notes.length === 0 ? (
        <div className="text-center py-6 sm:py-8 text-slate-400 text-xs font-semibold">
          <MessageSquarePlus className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          لا توجد ملاحظات مرسلة حالياً. جرب إرسال ملاحظة من الستيكر البنفسجي على يمين/يسار الشاشة وستظهر هنا فوراً.
        </div>
      ) : (
        <div className="space-y-2.5 max-h-96 overflow-y-auto">
          {notes.map((note, idx) => (
            <div
              key={note.id || idx}
              className="p-3 bg-slate-50/80 hover:bg-slate-50 rounded-[10px] border border-slate-200/80 space-y-2 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">{note.title}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                    <span className="flex items-center gap-1 font-bold text-purple-800">
                      <User className="w-3 h-3" />
                      {note.sender}
                    </span>
                    {note.workplace && <span>• {note.workplace}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(note.createdAt).toLocaleString('en-GB', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteNote(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-[5px] hover:bg-rose-50 transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-700 bg-white p-2.5 rounded-[7px] border border-slate-100 whitespace-pre-wrap leading-relaxed">
                {note.content}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                {note.imageUrl ? (
                  <button
                    type="button"
                    onClick={() => setPreviewImage(note.imageUrl || null)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-[7px] text-[11px] font-bold cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>معاينة الصورة المرفقة</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-slate-400">بدون مرفق</span>
                )}

                {note.pageUrl && (
                  <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]" dir="ltr">
                    {note.pageUrl}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* نافذة معاينة الصورة المرفقة */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="bg-white p-3 rounded-[10px] max-w-3xl w-full max-h-[90vh] overflow-auto space-y-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-bold text-slate-800">معاينة لقطة الشاشة المرفقة</span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-[7px] text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
            <img src={previewImage} alt="مرفق الملاحظة" className="w-full h-auto max-h-[75vh] object-contain rounded-[7px]" />
          </div>
        </div>
      )}
    </div>
  );
};
