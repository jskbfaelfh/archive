---
name: minimal-sidebar-navigation
description: Trigger this skill whenever creating, styling, or updating sidebar navigation menus, tab bars, or drawer navigation in web and mobile applications. Enforces minimalist icon + title navigation, complete elimination of rectangular button borders and background boxes, CSS cascade/layer override handling, and dynamic active/hover color transitions.
---

# مهارة القائمة الجانبية المبسطة الخالية من الحدود (Minimalist Borderless Sidebar Navigation)

## 1. فلسفة المهارة والهدف المعماري
تهدف هذه المهارة إلى تقديم واجهة تنقل جانبية نقية، خفيفة، وراقية بصرياً تعتمد على **الأيقونة والعنوان فقط** (`Icon + Title Navigation`) دون أي تشويش بصري، وإلغاء المربعات والبطاقات والمستطيلات المحيطة بكل عنصر تنقل.

في العديد من التطبيقات:
- تُحاط عناصر التنقل في القوائم الجانبية بمربعات أو كروت ذات حدود (`borders`) أو خلفيات داكنة/ملونة تجعل القائمة ثقيلة ومزدحمة بصرياً.
- المشكلة التقنية الشائعة: عند محاولة إزالة الحدود باستخدام أدوات مثل Tailwind CSS (`border-0` أو `bg-transparent`)، قد تفشل الإزالة وتظل الحدود ظاهرة بسبب **أولوية التتالي في CSS** (`CSS Cascade Specificity`)، حيث إن قواعد عناصر HTML العامة (مثل `button { border: 1px solid #cbd5e1; }`) المكتوبة خارج طبقات `@layer` تتفوق في الأولوية على كلاسات Tailwind v4.
- تقدم هذه المهارة الحل البصري والحل المعماري الصارم لضمان النظافة البصرية الكاملة.

---

## 2. القواعد الحتمية للتصميم والتنفيذ (The Invariant Rules)

### القاعدة 1: الاقتصار على الأيقونة والعنوان (Icon + Title Minimalism)
- يتكون كل عنصر في القائمة الجانبية حصراً من:
  1. أيقونة معبرة ورفيعة من مكتبة `lucide-react`.
  2. عنوان نصي واضح ومباشر (`label`).
- **يُمنع منعاً باتاً** إدراج شارات أعداد (`count badges`) أو كبسولات ملونة داخل عناصر التنقل الرئيسية إلا بطلب استثنائي صريح.

### القاعدة 2: الإلغاء الشامل للمستطيلات والحدود (Zero Box Boundaries)
- يُحظر ظهور أي إطار أو مستطيل أو حد رمادي حول عناصر القائمة الجانبية:
  - `border: none !important;`
  - `background: transparent !important;`
  - `box-shadow: none !important;`
  - `border-radius: 0 !important;`

### القاعدة 3: الحصانة من أنماط الأزرار العامة (Global Button Style Immunity)
- للتغلب على قاعدة `button` العامة في `globals.css`، يتم تطبيق العزل عبر مستويين:
  1. **قاعدة CSS مخصصة في `globals.css`:**
     ```css
     aside nav button,
     .sidebar-nav-btn {
       border: none !important;
       background: transparent !important;
       box-shadow: none !important;
       border-radius: 0 !important;
     }
     aside nav button:hover:not(:disabled),
     .sidebar-nav-btn:hover:not(:disabled) {
       border: none !important;
       background: transparent !important;
       box-shadow: none !important;
     }
     .dark aside nav button,
     .dark .sidebar-nav-btn {
       border: none !important;
       background: transparent !important;
       box-shadow: none !important;
     }
     ```
  2. **نمط مباشر وكلاسات معززة في المكون (`Inline Style & Utility`)**:
     ```tsx
     style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
     className="sidebar-nav-btn !border-0 !border-none !bg-transparent !shadow-none !rounded-none ..."
     ```

### القاعدة 4: التفاعل اللوني الديناميكي السلس (Dynamic Color Transitions)
- **العنصر النشط (`isActive`):**
  - يتحول لون النص والأيقونة إلى اللون الأساسي المميز (`text-blue-600 dark:text-blue-400 font-bold`).
  - تكبير ميكروي خفيف للأيقونة لإضفاء حيوية راقية (`scale-105 transition-transform`).
  - انعدام تام لأي مستطيل أو خلفية ملونة.
- **العناصر غير النشطة (`inactive`):**
  - تظهر بلون رمادي متوازن ومريح للعين (`text-slate-600 dark:text-slate-400 font-medium`).
  - عند التحويم (`hover`): يتحول النص والأيقونة بسلاسة إلى اللون الأزرق (`hover:text-blue-600 dark:hover:text-blue-400`) دون ظهور أي خلفية مستطيلة.

### القاعدة 5: مرونة وضع الطي (Collapsed Sidebar Elegance)
- عند طي القائمة الجانبية للشاشات الكبيرة (`isCollapsed`):
  - تتوسط الأيقونات عمودياً مع الاحتفاظ بكامل التفاعل اللوني (`lg:justify-center`).
  - تظل خالية من أي إطار أو مستطيل.

---

## 3. نمط التطبيق الهندسي المرجعي (Reference Implementation Pattern)

```tsx
<nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto" role="tablist">
  {tabs.map((tab) => {
    const Icon = TAB_ICONS[tab];
    const isActive = currentTab === tab;
    const label = term(tab, language);

    return (
      <button
        key={tab}
        id={`tab-${tab}`}
        role="tab"
        aria-selected={isActive}
        aria-controls={`panel-${tab}`}
        tabIndex={isActive ? 0 : -1}
        onClick={() => onNavigate(tab)}
        title={label}
        style={{ border: 'none', background: 'transparent', boxShadow: 'none' }}
        className={`sidebar-nav-btn w-full flex items-center gap-3 py-2.5 px-3 !border-0 !border-none !bg-transparent !shadow-none !rounded-none text-[14px] transition-colors duration-150 group ${
          isActive
            ? 'text-blue-600 dark:text-blue-400 font-bold'
            : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-medium'
        } ${isCollapsed ? 'lg:justify-center lg:px-2' : ''}`}
      >
        <Icon
          className={`w-5 h-5 shrink-0 transition-transform ${
            isActive
              ? 'scale-105 text-blue-600 dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
          }`}
        />
        {!isCollapsed && (
          <span className="block truncate flex-1 text-start">{label}</span>
        )}
      </button>
    );
  })}
</nav>
```

---

## 4. قائمة التحقق الإلزامية (Compliance Checklist)
- [ ] هل تم التحقق بصرياً من خلو عناصر القائمة الجانبية من أي مستطيلات أو إطارات رمادية؟
- [ ] هل يتغير لون العنوان والأيقونة فور الانتقال إلى التبويب النشط؟
- [ ] هل تم تحصين أزرار التنقل من أنماط `button` العامة عبر CSS المخصص والنمط المباشر؟
- [ ] هل تعمل القائمة بسلاسة في الوضعين النهاري والليلي وفي واجهات RTL و LTR؟
