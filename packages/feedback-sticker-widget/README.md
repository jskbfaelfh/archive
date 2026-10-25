# حزمة ستيكر إرسال الملاحظات للمشاريع (`@alzahrawi/feedback-sticker-widget`)

> **حزمة React مستقلة وقابلة لإعادة الاستخدام مباشرة في أي مشروع من مشاريع الجامعة أو الأنظمة الشقيقة لإرسال الملاحظات، الشكاوى، المقترحات، لقطات الشاشة، والصور مباشرة إلى نظام إدارة المشاريع المركزي لجامعة الزهراوي.**

---

## 🌟 المميزات الرئيسية

1. **تصميم عائم متطابق 100%:** ستيكر متفاعل يثبت على حافة الشاشة ويندفع بسلاسة عند تحويم الفأرة (Hover Animation).
2. **دعم كامل للغتين والاتجاهين (RTL / LTR):** 
   - في العربية (`lang="ar"`): يثبت على الجانب الأيسر مع واجهة وتنسيقات عربية أصيلة.
   - في الإنجليزية (`lang="en"`): يثبت على الجانب الأيمن.
3. **دعم لصق لقطات الشاشة والصور مباشرة (Ctrl+V):** إمكانية التقاط صورة للشاشة (Print Screen / Snipping Tool) ولصقها فوراً داخل النافذة دون الحاجة لحفظها على الجهاز.
4. **دعم تصفح ورفع الصور:** يقبل ملفات `PNG`, `JPG`, `WebP`, `GIF` حتى 10 ميغابايت مع معاينة فورية وإمكانية حذف المرفق.
5. **ربط تلقائي لبيانات المستخدم والصفحة:** يرسل تلقائياً رابط الصفحة الحالية (`window.location.href`)، هوية المستخدم، جهة عمله، وبريده الإلكتروني.
6. **مستقل وخفيف الوزن (Zero External Icon Dependencies):** لا يتطلب مكتبة `lucide-react` خارجية، حيث يحتوي على أيقونات SVG نقية مدمجة وخفيفة الوزن.
7. **تخزين محلي احتياطي (Offline/Fallback Cache):** يتم حفظ الملاحظات محلياً في المتصفح تلقائياً لضمان عدم ضياع أي ملاحظة حتى في حالات انقطاع الشبكة.
8. **مرونة كاملة في خيارات الربط:** يدعم الرفع عبر Supabase Storage أو عبر دالة مخصصة أو الاعتماد على الرابط الافتراضي للـ Edge Function.

---

## 📦 التثبيت والتركيب

يمكنك استخدام الحزمة في أي مشروع جديد بأحد الطرق التالية:

### الطريقة 1: نسخ مجلد البكج مباشرة إلى مجلد `packages` أو `src/components` في مشروعك
انسخ مجلد:
```text
packages/feedback-sticker-widget
```
إلى مشروعك ثم قم باستيراده مباشرة:
```tsx
import { FeedbackSticker } from './components/feedback-sticker-widget/src';
// أو
import { FeedbackSticker } from '@alzahrawi/feedback-sticker-widget';
```

### الطريقة 2: التثبيت المحلي عبر npm / yarn / pnpm
في ملف `package.json` للمشروع الآخر، أضف الحزمة كاعتمادية محلية:
```json
{
  "dependencies": {
    "@alzahrawi/feedback-sticker-widget": "file:../packages/feedback-sticker-widget"
  }
}
```
ثم نفذ:
```bash
npm install
```

---

## 🚀 دليل الاستخدام السريع (Quick Start)

### 1. الاستخدام الأساسي الافتراضي (أبسط صورة)

أضف المكون في المكون الجذري للتطبيق (مثل `App.tsx` أو `Layout.tsx`):

```tsx
import React from 'react';
import { FeedbackSticker } from '@alzahrawi/feedback-sticker-widget';

export function App() {
  return (
    <div className="min-h-screen">
      <h1>مرحباً بكم في النظام</h1>
      
      {/* ستيكر الملاحظات العائم */}
      <FeedbackSticker />
    </div>
  );
}
```

---

### 2. الاستخدام المتقدم مع تمرير بيانات المستخدم وإعدادات المشروع

```tsx
import React from 'react';
import { FeedbackSticker, FeedbackConfig, FeedbackUser } from '@alzahrawi/feedback-sticker-widget';

export function MainLayout({ children }: { children: React.ReactNode }) {
  // بيانات المستخدم المسجل حالياً في مشروعك
  const currentUser: FeedbackUser = {
    name: "د. أحمد علي",
    email: "ahmed@alzahu.edu.iq",
    jobTitle: "رئيس قسم هندسة البرمجيات",
    collegeName: "كلية تكنولوجيا المعلومات",
    deptName: "قسم هندسة البرمجيات"
  };

  // إعدادات الربط مع نظام إدارة المشاريع
  const feedbackConfig: FeedbackConfig = {
    // رابط Edge Function في نظام إدارة المشاريع
    apiUrl: import.meta.env.VITE_PROJECTS_API_URL || 'https://api.supabase.alzahu.edu.iq/functions/v1/projectManage-submitExternalNote',
    // مفتاح الأمان السري الخاص بالمشروع
    apiKey: import.meta.env.VITE_PROJECTS_API_KEY,
    // معرف المشروع (اختياري)
    projectId: import.meta.env.VITE_PROJECTS_PROJECT_ID || 'tablesystem',
    // مفتاح anon key لـ Supabase للترويسة
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY
  };

  return (
    <div className="layout">
      <main>{children}</main>

      <FeedbackSticker
        currentUser={currentUser}
        config={feedbackConfig}
        lang="ar"
        onSuccess={() => {
          console.log('تم إرسال الملاحظة بنجاح!');
        }}
      />
    </div>
  );
}
```

---

### 3. إعداد رفع الصور عبر Supabase Storage في مشروعك

إذا أردت رفع صور الملاحظات ولقطات الشاشة مباشرة إلى Bucket خاص بمشروعك (مثل `myproject-bucket`) عبر عميل Supabase:

```tsx
import { FeedbackSticker } from '@alzahrawi/feedback-sticker-widget';
import { supabase } from './lib/supabaseClient'; // عميل Supabase الخاص بمشروعك

export function App() {
  return (
    <FeedbackSticker
      config={{
        supabaseClient: supabase,
        storageBucket: 'myproject-storage',
        storageFolder: 'notes_screenshots',
        apiKey: 'YOUR_FEEDBACK_API_KEY'
      }}
    />
  );
}
```

---

### 4. استخدام دالة مخصصة لرفع الصور (Custom Image Uploader)

إذا كان مشروعك يستخدم خادماً مختلفاً أو واجهة خلفية مخصصة لرفع المرفقات (مثل AWS S3, Cloudinary, أو PHP/Node Backend):

```tsx
<FeedbackSticker
  config={{
    customImageUploader: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      return data.url; // رابط الصورة العمومي المرفوعة
    }
  }}
/>
```

---

### 5. الاستخدام باللغة الإنجليزية (English LTR Mode)

```tsx
<FeedbackSticker
  lang="en"
  currentUser={{
    name: "John Doe",
    email: "john@example.com",
    jobTitle: "Software Engineer"
  }}
/>
```

---

## 🛠️ الخصائص والمواصفات (Props Reference)

### `FeedbackStickerProps`

| الخاصية | النوع | الافتراضي | الوصف |
| :--- | :--- | :--- | :--- |
| `currentUser` | `FeedbackUser` | `null` | كائن يحتوي على اسم المستخدم، بريده، صفته الوظيفية وجهة عمله. |
| `config` | `FeedbackConfig` | `{}` | إعدادات الـ API والمفاتيح وعميل التخزين السحابي. |
| `lang` | `'ar' \| 'en'` | `'ar'` | لغة العرض وتحديد جهة ثبات الستيكر (يسار للشاشات العربية، يمين للإنجليزية). |
| `texts` | `FeedbackI18nTexts` | نصوص افتراضية | تمكّنك من تخصيص أو استبدال أي نص من نصوص الواجهة. |
| `positionClass` | `string` | `'top-1/2 -translate-y-1/2'` | فئة Tailwind لتحديد موضع الستيكر رأسياً على الشاشة. |
| `className` | `string` | `''` | فئات إضافية للزر العائم. |
| `onSuccess` | `() => void` | `undefined` | دالة رد نداء تُستدعى عند نجاح إرسال الملاحظة. |
| `onError` | `(err: string) => void` | `undefined` | دالة رد نداء تُستدعى عند فشل الإرسال. |

---

## 📋 المتطلبات والبيئة
- **React:** الإصدار 16.8 أو أعلى (يدعم React 18 و 19).
- **Tailwind CSS:** يفضل وجود Tailwind CSS في المشروع للاستفادة الكاملة من التنسيقات الرائعة. إذا لم يكن متوفراً، يمكنك استيراد ملف `styles.css` المرفق مع الحزمة.

---

## 📄 الترخيص
مرخص بموجب رخصة MIT - خاص بجامعة الزهراوي ومشاريعها المعتمدة.
