# البنية التحتية الخلفية (Backend & Supabase Architecture)
## منظومة الهيكلية المركزية وأرشفة المحاضرات - جامعة الزهراوي

### 1. نظرة عامة
تم تصميم الباك إند ليعمل كمنظومة سحابية متوافقة بالكامل مع خادم **Supabase Self-Hosted** لجامعة الزهراوي (`https://api.supabase.alzahu.edu.iq`) مستنداً إلى PostgreSQL و Edge Functions و Row Level Security (RLS).

### 2. سكيما قاعدة البيانات (`core_university`)
- **`colleges`**: الكليات الرسمية بالجامعة.
- **`departments`**: الأقسام العلمية ومراحلها الدراسية.
- **`sections`**: الشعب الدراسية لكل مرحلة وقسم.
- **`subjects`**: المواد والمقررات وتوزيع التدريسيين عليها.
- **`staff_profiles`**: حسابات الكادر الأكاديمي والعمداء ورؤساء الأقسام.
- **`lectures`**: أرشيف ملفات المحاضرات والمقررات (PDF, PPTX, DOCX, Video).
- **`audit_logs`**: سجل المراقبة والعمليات الإدارية الحساسة.

### 3. دوال الحافة (Edge Functions)
- **`core_university.superadmin`**: دالة تهيئة وإصدار جلسة المشرف العام (SuperAdmin) في `auth.users` حصراً بدون أي إدراج في جداول الكادر العامة.
- **`core_university.lectures`**: دالة التدقيق والحسابات وتحميل وتوثيق المحاضرات.
