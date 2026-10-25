// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file types.ts
 * @description تعريفات العقود والأنواع الخاصة ببكج ستيكر إرسال الملاحظات
 */

export interface FeedbackUser {
  id?: string;
  name?: string;
  nameAr?: string;
  nameEn?: string;
  email?: string;
  role?: string;
  jobTitle?: string;
  jobTitleEn?: string;
  collegeId?: string;
  collegeName?: string;
  deptId?: string;
  deptName?: string;
  workplace?: string;
  [key: string]: unknown;
}

export interface FeedbackConfig {
  /** رابط نقطة نهاية API الخاصة بنظام إدارة المشاريع */
  apiUrl?: string;
  /** مفتاح التحقق X-Feedback-Key */
  apiKey?: string;
  /** معرف المشروع في نظام إدارة المشاريع إن وجد */
  projectId?: string;
  /** مفتاح Supabase Anon Key للترويسة إن وجد */
  supabaseAnonKey?: string;
  /** دالة مخصصة لرفع الصورة وإرجاع رابط URL عمومي */
  customImageUploader?: (file: File) => Promise<string | null>;
  /** كائن Supabase Client إذا رغب المشروع باستخدامه مباشرة للرفع */
  supabaseClient?: {
    storage: {
      from: (bucket: string) => {
        upload: (path: string, file: File, options?: unknown) => Promise<{ data?: unknown; error?: { message: string } | null }>;
        getPublicUrl: (path: string) => { data: { publicUrl: string } };
      };
    };
  };
  /** اسم Storage Bucket لرفع الصور المرفقة (افتراضياً: feedback-attachments أو tablesystem) */
  storageBucket?: string;
  /** مسار التخزين داخل الـ Bucket */
  storageFolder?: string;
}

export interface SendFeedbackNoteParams {
  title: string;
  content: string;
  user?: FeedbackUser | null;
  imageFile?: File | null;
  imageUrl?: string | null;
  pageUrl?: string;
  config?: FeedbackConfig;
}

export interface SendFeedbackResponse {
  success: boolean;
  error?: string;
  imageUrl?: string | null;
}

export interface FeedbackI18nTexts {
  add_note_sticker?: string;
  note_title_label?: string;
  note_title_placeholder?: string;
  note_content_label?: string;
  note_content_placeholder?: string;
  send_note?: string;
  note_sent_success?: string;
  attach_image?: string;
  remove_attachment?: string;
  paste_or_upload_image_hint?: string;
  image_size_exceeded?: string;
  close?: string;
  sending?: string;
}

export type FeedbackLanguage = 'ar' | 'en';
