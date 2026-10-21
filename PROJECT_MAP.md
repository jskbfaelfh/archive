# خريطة بنية المشروع (PROJECT_MAP.md)
## منظومة الهيكلية المركزية وإدارة البيانات المرجعية للجامعة

**تاريخ التحديث الآلي:** 2026-10-21T09:38:33.370Z
**إجمالي الملفات غير المولدة:** 110
**حدود الخريطة:** جرد ملفات؛ لا يمثل إثبات صحة الوظائف أو جاهزية الإنتاج. يستثني الأسرار والتبعيات وملفات العمل المولدة.

### المكدس التقني
- **react ^19.3.1**
- **typescript ^5.8.2**
- **tailwindcss ^4.3.3**
- **@supabase/supabase-js ^2.118.0**
- **zod ^4.6.7**
- **@playwright/test ^1.64.1**

### توزيع الملفات
| المجلد | العدد |
|---|---:|
| `.agent-skills` | 9 |
| `root` | 7 |
| `backend` | 7 |
| `docs` | 5 |
| `frontend` | 35 |
| `mvp` | 35 |
| `prisma` | 3 |
| `scripts` | 8 |
| `uploads` | 1 |

### واجهات التطبيق (Vite + React)
- [`frontend/src/App.tsx`](frontend/src/App.tsx)
- [`frontend/src/components/analytics/AnalyticsView.tsx`](frontend/src/components/analytics/AnalyticsView.tsx)
- [`frontend/src/components/common/Select.tsx`](frontend/src/components/common/Select.tsx)
- [`frontend/src/components/common/SelectMenuPortal.tsx`](frontend/src/components/common/SelectMenuPortal.tsx)
- [`frontend/src/components/hierarchy/StructureManager.tsx`](frontend/src/components/hierarchy/StructureManager.tsx)
- [`frontend/src/components/layout/Navbar.tsx`](frontend/src/components/layout/Navbar.tsx)
- [`frontend/src/components/layout/NotificationBell.tsx`](frontend/src/components/layout/NotificationBell.tsx)
- [`frontend/src/components/lectures/LectureManager.tsx`](frontend/src/components/lectures/LectureManager.tsx)
- [`frontend/src/components/student/StudentPortalView.tsx`](frontend/src/components/student/StudentPortalView.tsx)
- [`frontend/src/components/users/UserManager.tsx`](frontend/src/components/users/UserManager.tsx)
- [`frontend/src/main.tsx`](frontend/src/main.tsx)

### خدمات البيانات والمصادقة
- [`frontend/src/context/AppContext.tsx`](frontend/src/context/AppContext.tsx)
- [`frontend/src/lib/audit.ts`](frontend/src/lib/audit.ts)
- [`frontend/src/lib/auth.ts`](frontend/src/lib/auth.ts)
- [`frontend/src/lib/init-db.ts`](frontend/src/lib/init-db.ts)
- [`frontend/src/lib/prisma.ts`](frontend/src/lib/prisma.ts)
- [`frontend/src/lib/storage.ts`](frontend/src/lib/storage.ts)
- [`frontend/src/lib/supabase.ts`](frontend/src/lib/supabase.ts)

### قاعدة البيانات والدوال (Backend & Supabase)
- [`backend/supabase/functions/core_university.superadmin/index.ts`](backend/supabase/functions/core_university.superadmin/index.ts)
- [`backend/supabase/functions/core_university/project.json`](backend/supabase/functions/core_university/project.json)
- [`backend/supabase/migrations/20261021_init_core_university.sql`](backend/supabase/migrations/20261021_init_core_university.sql)

### الاختبارات
لا توجد ملفات في هذا النطاق.

### التوثيق
- [`README.md`](README.md)
- [`docs/Alzahrawi_System_Executive_Proposal.docx`](docs/Alzahrawi_System_Executive_Proposal.docx)
- [`docs/EDGE_FUNCTIONS_GUIDE.md`](docs/EDGE_FUNCTIONS_GUIDE.md)
- [`docs/MVP.md`](docs/MVP.md)
- [`docs/PROJECT_MAP.md`](docs/PROJECT_MAP.md)
- [`docs/SUPERADMIN_FUNCTION_GUIDE.md`](docs/SUPERADMIN_FUNCTION_GUIDE.md)

### قواعد المشروع
- جميع الملفات والتنزيلات والسجلات داخل مجلد النظام.
- سقف 300 سطر لكل ملف كود، والترويسة المعتمدة، وTypeScript الصارم والتحقق وقت التشغيل.
- بيانات الكادر الحساسة تخضع للنطاق والصلاحية؛ قاعدة البيانات هي سلطة التفويض النهائية.
- الأرقام الغربية 0-9 والترجمة العربية والإنجليزية والمكونات المشتركة الميسرة.
- لا تنفيذ ترحيلات أو اختبارات كتابية على الإنتاج دون إجراء نشر مصرح وآمن.
- هذه نواة بيانات مرجعية؛ وظائف الجداول والحضور أنظمة فرعية تتصل عبر عقود تكامل.
