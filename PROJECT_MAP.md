# خريطة بنية المشروع (PROJECT_MAP.md)
## منظومة الهيكلية المركزية وإدارة البيانات المرجعية للجامعة

**تاريخ التحديث الآلي:** 2026-10-21T09:00:44.739Z
**إجمالي الملفات غير المولدة:** 64
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
| `root` | 11 |
| `docs` | 4 |
| `prisma` | 3 |
| `public` | 7 |
| `scripts` | 8 |
| `src/App.tsx` | 1 |
| `src/components` | 8 |
| `src/context` | 1 |
| `src/data` | 1 |
| `src/index.css` | 1 |
| `src/lib` | 6 |
| `src/main.tsx` | 1 |
| `src/types` | 1 |
| `src/vite-env.d.ts` | 1 |
| `uploads` | 1 |

### واجهات التطبيق (Vite + React)
- [`src/App.tsx`](src/App.tsx)
- [`src/components/analytics/AnalyticsView.tsx`](src/components/analytics/AnalyticsView.tsx)
- [`src/components/common/Select.tsx`](src/components/common/Select.tsx)
- [`src/components/common/SelectMenuPortal.tsx`](src/components/common/SelectMenuPortal.tsx)
- [`src/components/hierarchy/StructureManager.tsx`](src/components/hierarchy/StructureManager.tsx)
- [`src/components/layout/Navbar.tsx`](src/components/layout/Navbar.tsx)
- [`src/components/layout/NotificationBell.tsx`](src/components/layout/NotificationBell.tsx)
- [`src/components/lectures/LectureManager.tsx`](src/components/lectures/LectureManager.tsx)
- [`src/components/users/UserManager.tsx`](src/components/users/UserManager.tsx)
- [`src/main.tsx`](src/main.tsx)

### خدمات البيانات والمصادقة
لا توجد ملفات في هذا النطاق.

### قاعدة البيانات والدوال
لا توجد ملفات في هذا النطاق.

### الاختبارات
لا توجد ملفات في هذا النطاق.

### التوثيق
- [`README.md`](README.md)
- [`docs/Alzahrawi_System_Executive_Proposal.docx`](docs/Alzahrawi_System_Executive_Proposal.docx)
- [`docs/EDGE_FUNCTIONS_GUIDE.md`](docs/EDGE_FUNCTIONS_GUIDE.md)
- [`docs/PROJECT_MAP.md`](docs/PROJECT_MAP.md)
- [`docs/SUPERADMIN_FUNCTION_GUIDE.md`](docs/SUPERADMIN_FUNCTION_GUIDE.md)

### قواعد المشروع
- جميع الملفات والتنزيلات والسجلات داخل مجلد النظام.
- سقف 300 سطر لكل ملف كود، والترويسة المعتمدة، وTypeScript الصارم والتحقق وقت التشغيل.
- بيانات الكادر الحساسة تخضع للنطاق والصلاحية؛ قاعدة البيانات هي سلطة التفويض النهائية.
- الأرقام الغربية 0-9 والترجمة العربية والإنجليزية والمكونات المشتركة الميسرة.
- لا تنفيذ ترحيلات أو اختبارات كتابية على الإنتاج دون إجراء نشر مصرح وآمن.
- هذه نواة بيانات مرجعية؛ وظائف الجداول والحضور أنظمة فرعية تتصل عبر عقود تكامل.
