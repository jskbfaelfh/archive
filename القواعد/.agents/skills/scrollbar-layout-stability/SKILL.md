---
name: scrollbar-layout-stability
description: Trigger this skill whenever configuring global typography/layout CSS, managing page scrollbars, navigating between pages of varying content heights, or locking body scrolling for modal dialogs. Enforces scrollbar-gutter: stable, overflow-y: scroll fallbacks, transparent tracks, and zero Cumulative Layout Shift (CLS) across RTL and LTR viewports.
---

# مهارة استقرار التمرير ومنع إزاحة التخطيط (Scrollbar Layout Stability)

## 1. فلسفة المهارة والهدف المعماري
تهدف هذه المهارة إلى القضاء النهائي على ظاهرة تذبذب عرض الصفحة وقفز المحتوى أفقياً (`Layout Shift / Horizontal Jitter`) التي تحدث عند التنقل بين صفحات ذات أطوال مختلفة (صفحات قصيرة لا تحتاج إلى تمرير وصفحات طويلة يظهر فيها شريط التمرير).

في متصفحات الويب:
- يشغل شريط التمرير الرأسي مساحة تتراوح بين `8px` إلى `17px` من عرض مساحة العرض (`viewport width`).
- عند ظهور شريط التمرير فجأة، يتقلص عرض مساحة العرض المتاحة، مما يتسبب في إزاحة كافة الحاويات الموسطة (`margin: 0 auto` مثل `.workspace` أو `header` أو الجداول) لليمين أو اليسار بمقدار نصف عرض شريط التمرير.
- في واجهات الاتجاه من اليمين لليسار (**RTL Arabic**)، يظهر شريط التمرير على **الجانب الأيسر**، مما يجعل القفزة البصرية أشد وضوحاً وتشتيتاً للمستخدم.

---

## 2. القواعد الحتمية للاستقرار البصري (The Invariant Rules)

### القاعدة 1: حجز مسار التمرير الدائم (Root Gutter Reservation)
- يتم تطبيق الحجز الدائم لمسار شريط التمرير على مستوى جذر المستند (`html`):
  ```css
  html {
    scrollbar-gutter: stable;
    overflow-y: scroll;
  }
  ```
- **لماذا نجمع بينهما؟**
  - خاصية `scrollbar-gutter: stable` هي المعيار الحديث المدعوم في Chrome/Edge/Firefox/Safari 18+ وتقوم بحجز المساحة بدقة دون رسم إطار رمادي قبيح عند عدم الحاجة.
  - خاصية `overflow-y: scroll` تعمل كحائط صد داعم للمتصفحات القديمة لضمان عدم حدوث أي قفزة أفقية إطلاقاً.

### القاعدة 2: مسار شفاف وتصميم راقٍ (Transparent Track & Custom Thumb)
- لكي لا يؤدي حجز مسار التمرير إلى مظهر فارغ مشوه في الصفحات القصيرة، يجب أن يكون مسار شريط التمرير شفافاً كلياً (`background: transparent`):
  ```css
  /* شريط تمرير نحيف وأنيق مع مسار شفاف */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: transparent;
  }
  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 9999px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  .dark ::-webkit-scrollbar-thumb {
    background: #334155;
  }
  .dark ::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }
  ```

### القاعدة 3: الحصانة ثنائية الاتجاه (Bidirectional RTL/LTR Immunity)
- في البيئة العربية (**RTL**)، يضمن حجز المسار عدم تحرك الحافة اليسرى للشبكة أو المحتوى نهائياً.
- في البيئة الإنجليزية (**LTR**)، يضمن حجز المسار عدم تحرك الحافة اليمنى.

### القاعدة 4: التنسيق مع قفل النوافذ المنبثقة (Modal Scroll Lock Coordination)
- عند فتح المودالات وتطبيق `document.body.style.overflow = 'hidden'`:
  - وجود `scrollbar-gutter: stable` على عنصر `html` يمنع قفزة المحتوى الخلفي عند تجميد التمرير وإعادة إطلاقه.

---

## 3. نمط التطبيق في ملف الأنماط الموحد (globals.css)

```css
/* ==========================================================================
   Scrollbar Gutter Stability & Zero Layout Shift
   ========================================================================== */
html {
  scrollbar-gutter: stable;
  overflow-y: scroll;
}

html, body {
  padding: 0;
  margin: 0;
  min-height: 100%;
  box-sizing: border-box;
}

/* Custom modern scrollbars with transparent track */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
.dark ::-webkit-scrollbar-thumb {
  background: #334155;
}
.dark ::-webkit-scrollbar-thumb:hover {
  background: #475569;
}
```

---

## 4. قائمة التحقق الإلزامية (Compliance Checklist)
- [ ] هل تم تعريف `scrollbar-gutter: stable` و `overflow-y: scroll` على `html` في `globals.css`؟
- [ ] هل يظل مسار شريط التمرير شفافاً (`background: transparent`) دون إطار رمادي زائد؟
- [ ] عند التنقل بين صفحة فارغة بها سطر واحد وصفحة طويلة بها مئات الصفوف، هل يظل المحتوى والموقع الأفقي ثابتاً تماماً دون إزاحة؟
- [ ] هل تم اختبار التنقل باللغتين العربية (RTL) والإنجليزية (LTR)؟
