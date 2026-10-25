// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file feedbackService.ts
 * @description خدمة إرسال الملاحظات ورفع الصور لنظام إدارة المشاريع
 */

import { FeedbackConfig, FeedbackUser, SendFeedbackNoteParams, SendFeedbackResponse } from './types';

const DEFAULT_API_URL = 'https://api.supabase.alzahu.edu.iq/functions/v1/projectManege.submitExternalNote';
const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJyb2xlIjogImFub24iLCAiaXNzIjogInN1cGFiYXNlIiwgImlhdCI6IDE3OTE2MzA0ODEsICJleHAiOiAyMTA2OTkwNDgxfQ.SR3-R_GE6lwuENPcSWfcCzxdAEyfUE3NvpFiKgrE4Pc';

/**
 * استخراج رابط الصفحة الحالية بأمان
 */
export function getCurrentPageUrl(): string {
  if (typeof window !== 'undefined' && window.location) {
    return window.location.href;
  }
  return '';
}

/**
 * تحويل ملف الصورة إلى Base64 Data URL لحفظه محلياً وعرضه
 */
function fileToDataUrl(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    } catch {
      resolve(null);
    }
  });
}

/**
 * رفع صورة الملاحظة
 */
export async function uploadFeedbackAttachment(
  file: File,
  config?: FeedbackConfig
): Promise<string | null> {
  try {
    // 1. إذا كان لدى المستخدم دالة رفع مخصصة
    if (config?.customImageUploader) {
      return await config.customImageUploader(file);
    }

    // 2. إذا توفر كائن Supabase Client
    if (config?.supabaseClient) {
      const bucket = config.storageBucket || 'tablesystem';
      const folder = config.storageFolder || 'feedback_notes';
      const fileExt = file.name.split('.').pop() || 'png';
      const cleanName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
      const filePath = `${folder}/${cleanName}`;

      const { error } = await config.supabaseClient.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || 'image/png'
        });

      if (error) {
        return await fileToDataUrl(file);
      }

      const { data } = config.supabaseClient.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data?.publicUrl || (await fileToDataUrl(file));
    }

    // 3. حفظ الصورة كـ Data URL محلياً
    return await fileToDataUrl(file);
  } catch {
    return null;
  }
}

/**
 * بناء مسمى جهة العمل أو صفة المستخدم
 */
export function buildWorkplaceDescription(user?: FeedbackUser | null): string {
  if (!user) return 'مستخدم عام';
  if (user.workplace) return user.workplace;

  const role = user.jobTitle || user.role || 'مستخدم النظام';
  const college = user.collegeName || user.collegeId;
  const dept = user.deptName || user.deptId;

  if (college && dept) return `${role} - ${college} / ${dept}`;
  if (college) return `${role} - ${college}`;
  if (dept) return `${role} - ${dept}`;
  return role;
}

/**
 * دالة إرسال الملاحظة الرئيسية
 */
export async function sendFeedbackNote(params: SendFeedbackNoteParams): Promise<SendFeedbackResponse> {
  const { title, content, user, imageFile, imageUrl, pageUrl, config } = params;

  // 1. رفع الصورة إذا وجدت
  let finalImageUrl = imageUrl || null;
  if (imageFile && !finalImageUrl) {
    finalImageUrl = await uploadFeedbackAttachment(imageFile, config);
  }

  // 2. دمج رابط الصورة إن وجد داخل نص الملاحظة للـ API الخارجي
  const isHttpImage = finalImageUrl && finalImageUrl.startsWith('http');
  const contentWithImage = isHttpImage
    ? `${content.trim()}\n\n📷 مرفق صورة:\n${finalImageUrl}`
    : content.trim();

  const senderName = user?.nameAr || user?.name || user?.nameEn || 'مستخدم غير محدد';
  const senderEmail = user?.email || '';
  const workplace = buildWorkplaceDescription(user);

  // إعدادات الـ API
  const apiUrl = config?.apiUrl || DEFAULT_API_URL;
  const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('alzahrawi_feedback_api_key') || '' : '';
  const apiKey = config?.apiKey || storedKey || '';
  const projectId = config?.projectId || 'lectures-archive';
  const anonKey = config?.supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY;

  const noteId = `note-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

  const payload: Record<string, unknown> = {
    id: noteId,
    ...(projectId ? { projectId } : {}),
    pageUrl: pageUrl || getCurrentPageUrl(),
    title: title.trim(),
    content: content.trim(),
    sender: senderName,
    senderEmail: senderEmail,
    workplace,
    ...(finalImageUrl ? { imageUrl: finalImageUrl } : {})
  };

  // 3. حفظ الملاحظة محلياً وإشعار الواجهات
  try {
    if (typeof localStorage !== 'undefined') {
      const localHistory = JSON.parse(localStorage.getItem('university_project_notes') || '[]');
      localHistory.unshift({
        ...payload,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('university_project_notes', JSON.stringify(localHistory));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('feedback_notes_updated'));
      }
    }
  } catch (err) {
    console.warn('[FeedbackWidget] Failed to cache note locally:', err);
  }

  // 4. إرسال الطلب للـ API السحابي إذا توفر مفتاح الربط (X-Feedback-Key)
  if (apiUrl && apiKey) {
    try {
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
        'X-Feedback-Key': apiKey
      };

      if (anonKey) {
        headers['apikey'] = anonKey;
        headers['Authorization'] = `Bearer ${anonKey}`;
      }

      const remotePayload = {
        ...payload,
        content: contentWithImage
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(remotePayload)
      });

      if (!response.ok) {
        return {
          success: true,
          imageUrl: finalImageUrl
        };
      }

      return { success: true, imageUrl: finalImageUrl };
    } catch {
      return {
        success: true,
        imageUrl: finalImageUrl
      };
    }
  }

  return { success: true, imageUrl: finalImageUrl };
}
