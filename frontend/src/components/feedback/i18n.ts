// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file i18n.ts
 * @description النصوص والترجمة الافتراضية للبكج باللغتين العربية والإنجليزية
 */

import { FeedbackI18nTexts, FeedbackLanguage } from './types';

export const DEFAULT_TEXTS_AR: Required<FeedbackI18nTexts> = {
  add_note_sticker: 'أضف ملاحظة',
  note_title_label: 'عنوان الملاحظة',
  note_title_placeholder: 'أدخل عنواناً واضحاً وموجزاً للملاحظة...',
  note_content_label: 'الملاحظة',
  note_content_placeholder: 'اكتب تفاصيل ملاحظتك أو استفسارك هنا...',
  send_note: 'إرسال',
  note_sent_success: 'تم إرسال الملاحظة بنجاح',
  attach_image: 'إرفاق صورة',
  remove_attachment: 'حذف المرفق',
  paste_or_upload_image_hint: 'يمكنك لصق صورة من الحافظة (Ctrl+V) أو النقر لاختيار ملف',
  image_size_exceeded: 'حجم الصورة يتجاوز الحد المسموح (10 ميغابايت)',
  close: 'إغلاق',
  sending: 'جاري الإرسال...'
};

export const DEFAULT_TEXTS_EN: Required<FeedbackI18nTexts> = {
  add_note_sticker: 'Add Note',
  note_title_label: 'Note Title',
  note_title_placeholder: 'Enter a clear title for your note...',
  note_content_label: 'Note Content',
  note_content_placeholder: 'Write your note or feedback details here...',
  send_note: 'Send',
  note_sent_success: 'Note sent successfully',
  attach_image: 'Attach image',
  remove_attachment: 'Remove attachment',
  paste_or_upload_image_hint: 'You can paste an image from clipboard (Ctrl+V) or click to browse',
  image_size_exceeded: 'Image size exceeds allowed limit (10MB)',
  close: 'Close',
  sending: 'Sending...'
};

export function getMergedTexts(lang: FeedbackLanguage = 'ar', customTexts?: FeedbackI18nTexts): Required<FeedbackI18nTexts> {
  const base = lang === 'en' ? DEFAULT_TEXTS_EN : DEFAULT_TEXTS_AR;
  return { ...base, ...customTexts };
}
