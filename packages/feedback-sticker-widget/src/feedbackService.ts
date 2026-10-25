/**
 * @file feedbackService.ts
 * @description خدمة إرسال الملاحظات ورفع الصور لنظام إدارة المشاريع
 */

import { FeedbackConfig, FeedbackUser, SendFeedbackNoteParams, SendFeedbackResponse } from './types';

const DEFAULT_API_URL = 'https://api.supabase.alzahu.edu.iq/functions/v1/projectManage-submitExternalNote';

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
        console.warn('[FeedbackWidget] Storage upload failed:', error.message);
        return null;
      }

      const { data } = config.supabaseClient.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return data?.publicUrl || null;
    }

    return null;
  } catch (err) {
    console.warn('[FeedbackWidget] Upload exception:', err);
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

  // 2. دمج رابط الصورة إن وجد داخل نص الملاحظة لضمان وصوله دائماً
  const contentWithImage = finalImageUrl
    ? `${content.trim()}\n\n📷 مرفق صورة:\n${finalImageUrl}`
    : content.trim();

  const senderName = user?.nameAr || user?.name || user?.nameEn || 'مستخدم غير محدد';
  const senderEmail = user?.email || '';
  const workplace = buildWorkplaceDescription(user);

  // إعدادات الـ API
  const apiUrl = config?.apiUrl || DEFAULT_API_URL;
  const apiKey = config?.apiKey || '';
  const projectId = config?.projectId;
  const anonKey = config?.supabaseAnonKey;

  const payload: Record<string, unknown> = {
    ...(projectId ? { projectId } : {}),
    pageUrl: pageUrl || getCurrentPageUrl(),
    title: title.trim(),
    content: contentWithImage,
    sender: senderName,
    senderEmail: senderEmail,
    workplace,
    ...(finalImageUrl ? { imageUrl: finalImageUrl } : {})
  };

  // 3. تخزين محلي احتياطي (Offline/Fallback Cache)
  try {
    if (typeof localStorage !== 'undefined') {
      const localHistory = JSON.parse(localStorage.getItem('university_project_notes') || '[]');
      localHistory.push({
        ...payload,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('university_project_notes', JSON.stringify(localHistory));
    }
  } catch (err) {
    console.warn('[FeedbackWidget] Failed to cache note locally:', err);
  }

  // 4. إرسال الطلب للـ API
  if (apiUrl) {
    try {
      const idempotencyKey = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `idem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey
      };

      if (anonKey) {
        headers['apikey'] = anonKey;
        headers['Authorization'] = `Bearer ${anonKey}`;
      }

      if (apiKey) {
        headers['X-Feedback-Key'] = apiKey;
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`[FeedbackWidget] Projects API error (${response.status}):`, errText);
        return {
          success: false,
          error: errText || `HTTP Error ${response.status}`,
          imageUrl: finalImageUrl
        };
      }

      return { success: true, imageUrl: finalImageUrl };
    } catch (networkErr: unknown) {
      console.warn('[FeedbackWidget] Network error:', networkErr);
      // في حال تعذر الاتصال نعتبرها ناجحة محلياً عبر الكاش
      return {
        success: true,
        imageUrl: finalImageUrl,
        error: networkErr instanceof Error ? networkErr.message : 'Network error'
      };
    }
  }

  return { success: true, imageUrl: finalImageUrl };
}
