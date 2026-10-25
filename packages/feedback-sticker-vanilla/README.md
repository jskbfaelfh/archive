# حزمة ستيكر الملاحظات العامة لصفحات الويب (`feedback-sticker-vanilla`)

> **مكتبة JavaScript نقية (Zero-Dependency Vanilla JS) بحجم صغير جداً تعمل مع أي تطبيق ويب: PHP (Laravel, Native, CodeIgniter, WordPress), C# (ASP.NET Core, MVC, Razor Pages, Blazor), Python (Django, Flask), أو حتى ملفات HTML الثابتة.**

---

## 🌟 المميزات
- **مستقلة بنسبة 100%:** لا تتطلب React, jQuery, Tailwind أو أي حزم خارجية.
- **تركيب في سطرين فقط:** استدعاء ملف الـ JS وتهيئة الحساب.
- **متطابقة مع واجهة React:** نفس الستيكر العائم، نفس تأثيرات التحويم، نفس حقول الملاحظات والرفع.
- **دعم لصق لقطات الشاشة (Ctrl+V):** إمكانية التقاط صورة الشاشة ولصقها مباشرة في النافذة.

---

## 🚀 طريقة الاستخدام

### 1. في مشاريع Laravel (داخل `resources/views/layouts/app.blade.php`)
ضع الكود قبل وسم الإغلاق `</body>`:

```html
<!-- استدعاء سكريبت ستيكر الملاحظات -->
<script src="{{ asset('js/feedback-sticker.js') }}"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    AlzahrawiFeedback.init({
      user: {
        name: "{{ auth()->check() ? auth()->user()->name : 'زائر' }}",
        email: "{{ auth()->check() ? auth()->user()->email : '' }}",
        jobTitle: "{{ auth()->check() ? (auth()->user()->job_title ?? 'موظف') : '' }}",
        workplace: "بوابة الكلية / النظام"
      },
      apiKey: "YOUR_PROJECT_FEEDBACK_KEY",
      projectId: "your_project_slug",
      lang: "{{ app()->getLocale() == 'ar' ? 'ar' : 'en' }}"
    });
  });
</script>
```

---

### 2. في مشاريع PHP التقليدية (Native PHP)
```php
<script src="/assets/feedback-sticker.js"></script>
<script>
  AlzahrawiFeedback.init({
    user: {
      name: "<?= isset($_SESSION['user_name']) ? $_SESSION['user_name'] : 'مستخدم' ?>",
      email: "<?= isset($_SESSION['user_email']) ? $_SESSION['user_email'] : '' ?>"
    },
    apiKey: "YOUR_API_KEY",
    lang: "ar"
  });
</script>
```

---

### 3. في مشاريع C# ASP.NET Core (داخل `_Layout.cshtml`)
```html
<script src="~/js/feedback-sticker.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', function () {
    AlzahrawiFeedback.init({
      user: {
        name: "@User.Identity?.Name",
        email: "@User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value",
        workplace: "نظام إدارة الموارد"
      },
      apiKey: "YOUR_API_KEY",
      lang: "ar"
    });
  });
</script>
```

---

## ⚙️ خيارات التهيئة (`options`)

| الخاصية | النوع | الافتراضي | الوصف |
| :--- | :--- | :--- | :--- |
| `user` | `Object` | `{}` | بيانات المستخدم (`name`, `email`, `jobTitle`, `collegeName`, `workplace`) |
| `apiKey` | `String` | `""` | مفتاح `X-Feedback-Key` الخاص بالمشروع |
| `projectId` | `String` | `""` | معرف المشروع في بوابة المشاريع |
| `apiUrl` | `String` | رابط الدالة الافتراضي | رابط Edge Function في نظام إدارة المشاريع |
| `lang` | `'ar' \| 'en'` | `'ar'` | لغة العرض وتحديد جهة ثبات الزر |
| `onSuccess` | `Function` | `null` | دالة رد نداء تُستدعى عند نجاح الإرسال |
