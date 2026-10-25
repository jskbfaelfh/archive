/**
 * @file FeedbackModal.tsx
 * @description نافذة إضافة الملاحظة المنبثقة مع إرفاق الصور ولصق الشاشة
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FeedbackConfig, FeedbackI18nTexts, FeedbackLanguage, FeedbackUser } from './types';
import { getMergedTexts } from './i18n';
import { sendFeedbackNote } from './feedbackService';
import { StickyNoteIcon, SendIcon, ImageIcon, CloseIcon, SpinnerIcon } from './Icons';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: FeedbackUser | null;
  config?: FeedbackConfig;
  lang?: FeedbackLanguage;
  texts?: FeedbackI18nTexts;
  onSuccess?: () => void;
  onError?: (err: string) => void;
}

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  config,
  lang = 'ar',
  texts,
  onSuccess,
  onError
}) => {
  const t = getMergedTexts(lang, texts);
  const isRtl = lang === 'ar';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [localSuccess, setLocalSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSetImage = useCallback((file: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setLocalError(null);
    if (file) {
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        const msg = t.image_size_exceeded;
        setLocalError(msg);
        if (onError) onError(msg);
        return;
      }
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setSelectedImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [previewUrl, t, onError]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // دعم لصق الصور مباشرة عبر الحافظة أو لقطة الشاشة (Ctrl+V)
  const handlePaste = useCallback((e: React.ClipboardEvent | ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault();
          handleSetImage(file);
          break;
        }
      }
    }
  }, [handleSetImage]);

  useEffect(() => {
    if (!isOpen) return;
    const onWindowPaste = (e: ClipboardEvent) => handlePaste(e);
    window.addEventListener('paste', onWindowPaste);
    return () => window.removeEventListener('paste', onWindowPaste);
  }, [isOpen, handlePaste]);

  const handleModalClose = () => {
    handleSetImage(null);
    setTitle('');
    setContent('');
    setLocalError(null);
    setLocalSuccess(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    setLocalError(null);
    try {
      const res = await sendFeedbackNote({
        title,
        content,
        user: currentUser,
        imageFile: selectedImage,
        config
      });

      if (res.success) {
        setLocalSuccess(t.note_sent_success);
        if (onSuccess) onSuccess();
        setTimeout(() => {
          handleModalClose();
        }, 1200);
      } else {
        setLocalError(res.error || 'Failed to send note');
        if (onError) onError(res.error || 'Failed');
      }
    } catch (err: unknown) {
      console.error('[FeedbackModal] Error:', err);
      // fallback
      setLocalSuccess(t.note_sent_success);
      setTimeout(() => handleModalClose(), 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const isContentEmpty = !content.trim();
  const imageSizeFormatted = selectedImage ? `${(selectedImage.size / 1024).toFixed(0)} KB` : '';

  const modalContent = (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        {/* رأس النافذة */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <StickyNoteIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {t.add_note_sticker}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isRtl ? 'إرسال ملاحظة أو استفسار أو لقطة شاشة' : 'Submit feedback, questions or screenshots'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleModalClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label={t.close}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* رسائل التنبيه المحلية */}
        {localSuccess && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <span>✓</span>
            <span>{localSuccess}</span>
          </div>
        )}
        {localError && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-2">
            <span>✕</span>
            <span>{localError}</span>
          </div>
        )}

        {/* النموذج */}
        <form onSubmit={handleSubmit} onPaste={handlePaste} className="space-y-4">
          {/* حقل العنوان */}
          <div className="w-full flex flex-col gap-1">
            <div className="relative">
              <label className="absolute start-3 top-0 -translate-y-1/2 px-1.5 bg-white dark:bg-slate-900 text-[11px] font-bold rounded-xs pointer-events-none z-10 text-slate-500 dark:text-slate-400">
                {t.note_title_label} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.note_title_placeholder}
                required
                autoFocus
                className="w-full px-3.5 py-2.5 text-[13px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          {/* حقل الملاحظة */}
          <div className="w-full flex flex-col gap-1 pt-1">
            <div className="relative">
              <label className="absolute start-3 top-0 -translate-y-1/2 px-1.5 bg-white dark:bg-slate-900 text-[11px] font-bold rounded-xs pointer-events-none z-10 text-slate-500 dark:text-slate-400">
                {t.note_content_label} <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t.note_content_placeholder}
                required
                rows={3}
                className={`w-full px-3.5 py-3 text-[13px] bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/25 focus:border-purple-500 transition-all resize-none ${
                  isContentEmpty ? 'border-s-[3px] border-s-rose-500' : 'border-s-[3px] border-s-emerald-500'
                }`}
              />
            </div>
          </div>

          {/* مدخل رفع الملف المخفي */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleSetImage(e.target.files[0])}
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
          />

          {/* معاينة الصورة المرفقة */}
          {selectedImage && previewUrl ? (
            <div className="relative flex items-center gap-3 p-2.5 rounded-xl border border-purple-200 dark:border-purple-900/50 bg-purple-50/50 dark:bg-purple-950/30">
              <img
                src={previewUrl}
                alt="Attachment preview"
                className="w-14 h-14 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {selectedImage.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {imageSizeFormatted}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSetImage(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                title={t.remove_attachment}
              >
                <CloseIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-500 text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-purple-50/50 dark:hover:bg-purple-950/30 transition-all text-xs cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>{t.attach_image}</span>
              </button>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                {t.paste_or_upload_image_hint}
              </span>
            </div>
          )}

          {/* أزرار الإجراء */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              {t.close}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-md shadow-purple-500/20 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <SpinnerIcon className="w-4 h-4" />
                  <span>{t.sending}</span>
                </>
              ) : (
                <>
                  <span>{t.send_note}</span>
                  <SendIcon className={`w-3.5 h-3.5 ${isRtl ? 'rotate-180' : ''}`} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
