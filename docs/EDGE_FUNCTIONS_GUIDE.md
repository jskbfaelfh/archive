# دليل كتابة وهندسة دوال الحافة (Edge Functions Architecture Guide)
تاريخ التحديث: 2026-10-19 | النطاق: منظومات خادم Supabase المشترك (Multi-Project Hosting)

---

## 1. المعمارية العامة ومبدأ العزل (Architecture & Isolation)
يعمل خادم الدوال الذاتي (Self-Hosted Supabase Edge Runtime) بمبدأ **بوابة التوجيه متعددة المشاريع (Multi-Project Gateway Router)**.
لا يتم استدعاء ملفات الدوال مباشرة أو عبر استيراد ديناميكي (`dynamic import`)، بل تعمل كل دالة كـ **عامل معزول ومستقل (Standalone User Worker)** عبر `EdgeRuntime.userWorkers.create`.

### هيكلية المجلدات الإلزامية:
```text
supabase/functions/
├── index.ts                         <-- مدخل البوابة المشترك لجميع مشاريع الخادم
├── <project_name>-router.ts         <-- موجه المشروع المعزول (مثل core_university-router.ts)
└── <project_name>/                  <-- مجلد المشروع الرئيسي (سكيما المشروع حصراً)
    ├── project.json                 <-- عقد مواصفات دوال المشروع
    ├── _shared/                     <-- الأدوات والمكتبات المشتركة للمشروع
    │   ├── core.ts                  <-- عميل قاعدة البيانات وعزل السكيما والتحقق من الهوية
    │   ├── security.ts              <-- أدوات التشفير والتحقق ومطابقة الصلاحيات
    │   └── contracts.ts             <-- مخططات وعقود البيانات
    ├── <project_name>.<operation_1>/<-- مجلد الدالة المستقلة بالبادئة الإلزامية
    │   └── index.ts                 <-- نقطة دخول الدالة كعامل مستقل
    └── <project_name>.<operation_2>/
        └── index.ts
```

---

## 2. القواعد الصارمة لكتابة أي دالة جديدة (Strict Agent Rules)

### القاعدة 1: تسمية المجلدات وبادئة المسار (Project Slug & Prefix)
* **يُمنع منعاً باتاً** استخدام أسماء مشاريع قديمة مثل `projectManege` في أي كود جديد.
* اسم مجلد المشروع الرئيسي يجب أن يطابق اسم سكيما قاعدة البيانات (مثل `core_university` أو `tablesystem`).
* اسم مجلد كل دالة داخل المشروع **يجب** أن يبدأ ببادئة المشروع متبوعة بنقطة واسم العملية:  
  `<project_name>.<operation_name>`  
  * مثال: `core_university.health`  
  * مثال: `core_university.webhook-dispatcher`  
  * مثال: `tablesystem.check_lecture_conflict`

### القاعدة 2: هيكلية ملف الدالة (`index.ts`)
* يجب أن تُصدّر كل دالة المعالج كافتراضي (`export default handler`).
* **يجب** أن ينتهي الملف باستدعاء `Deno.serve(handler)` ليعمل كـ Standalone Worker:
```typescript
// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file index.ts
 * @description نقطة الدخول لدالة core_university.operation كعامل مستقل
 * @created 2026-10-19
 */

import { guard, jsonResponse, getSupabaseAdminClient } from '../_shared/core.ts';

export async function handler(request: Request): Promise<Response> {
  const blocked = guard(request, 'POST');
  if (blocked) return blocked;

  try {
    // منطق العمل
    return jsonResponse({ success: true, data: {} }, 200, request);
  } catch (error) {
    return jsonResponse({ success: false, error: 'FAILED' }, 500, request);
  }
}

export default handler;

// استدعاء خادم العامل المستقل
if (import.meta.main) {
  Deno.serve(handler);
}
```

### القاعدة 3: عزل سكيما قاعدة البيانات (Schema Isolation)
* عند إنشاء عميل Supabase داخل الدالة، يجب ضبطه صراحة على سكيما المشروع الخاصة به، وعدم الاعتماد على `public`:
```typescript
export function getSupabaseClient() {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    db: { schema: 'core_university' }, // سكيما المشروع حصراً
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
```

### القاعدة 4: حدود حجم البيانات والتحقق من المدخلات (Payload Limits & Zod)
* يجب وضع حد أقصى لحجم جسم الطلب (Request Body Size) ومطابقته لطبيعة البيانات (مثلاً 64KB للبيانات العادية، 1MB للبيانات الضخمة أو الإشعارات).
* **إلزامية التحقق بوقت التشغيل (Runtime Validation):** تمرير كافة مدخلات الطلب عبر `zod.safeParse()` قبل تنفيذ أي استعلام في قاعدة البيانات.

### القاعدة 5: معالجة الـ CORS والأمان
* ضبط ترويسات CORS للسماح بنطاقات المنظومة فقط ومنع الوصول غير المصرح به:
```typescript
headers.set('Access-Control-Allow-Origin', origin);
headers.set('Access-Control-Allow-Headers', 'authorization,apikey,content-type,x-system-key');
headers.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
```
* الرد الفوري على طلبات التمهيد `OPTIONS` بحالة `204 No Content` دون استهلاك موارد العامل.

---

## 3. آلية التوجيه الموحدة في خادم الإنتاج (`Gateway Router`)

عند إضافة أي منظومة جديدة إلى السيرفر، يتم تسجيل الموجه الخاص بها داخل [supabase/functions/index.ts](supabase/functions/index.ts) كالتالي:

```typescript
import { routeRequest as routeProjectManage } from './router.ts';
import { routeTableSystem } from './tablesystem-router.ts';
import { routeCoreUniversity } from './core_university-router.ts';

Deno.serve(async (request: Request) => {
  try {
    // 1. فحص وتوجيه طلبات منظومة الهيكلية المركزية
    const coreUniversityResponse = await routeCoreUniversity(request);
    if (coreUniversityResponse !== null) return coreUniversityResponse;

    // 2. فحص وتوجيه طلبات منظومة الجداول الدراسية
    const tablesystemResponse = await routeTableSystem(request);
    if (tablesystemResponse !== null) return tablesystemResponse;

    // 3. التحويل للمشاريع القديمة أو المسارات العامة (Fallback)
    return await routeProjectManage(request);
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: 'GATEWAY_ERROR' }), { status: 500 });
  }
});
```

---

## 4. ملف مواصفات المشروع (`project.json`)
يجب أن يحتوي مجلد كل مشروع على ملف `project.json` يعرف العمليات المتاحة وطريقة الدخول لكل عملية:
```json
{
  "contractVersion": 1,
  "projectSlug": "<project_name>",
  "databaseSchema": "<project_schema>",
  "routeStyle": "project.operation",
  "executionModel": "edge-user-worker",
  "functions": [
    { "operation": "health", "method": "GET", "auth": "public" },
    { "operation": "action_name", "method": "POST", "auth": "user" }
  ]
}
```

---

## 5. مصفوفة التحقق قبل النشر (Pre-Flight Agent Checklist)
قبل اعتماد أي دالة حافة جديدة أو تسليمها، يجب على الوكيل التأكد من:
1. ✅ اسم المجلد يبدأ بـ `<project_name>.<operation_name>` ويقع داخل `<project_name>/`.
2. ✅ الملف ينتهي بـ `export default handler;` و `Deno.serve(handler);`.
3. ✅ العميل مرتبط بسكيما المشروع حصراً (`schema: '<project_schema>'`).
4. ✅ اجتياز فحص الترويسة الإلزامية في السطر الأول: `npm run check:headers`.
5. ✅ اجتياز فحص سقف الـ 300 سطر للملف: `npm run check:lines`.
6. ✅ اجتياز اختبارات Deno المحلية إن وُجدت: `node scripts/run-edge-tests.mjs`.
