# حزمة ستيكر الملاحظات لتطبيقات Flutter (`feedback_sticker_flutter`)

> **حزمة Dart/Flutter نقية لإضافة زر ستيكر عائم ونافذة منبثقة لإرسال الملاحظات ولقطات الشاشة مباشرة من تطبيقات الهاتف إلى نظام إدارة المشاريع.**

---

## 🌟 المميزات
- ودجت عائم (`FeedbackStickerFAB`) يتمركز على حافة الشاشة تلقائياً.
- نافذة منبثقة (`Dialog`) تدعم اللغتين العربية والإنجليزية.
- إرسال الملاحظات مع اسم الشاشة الحالية وهوية المستخدم.
- توافق كامل مع كافة أجهزة Android و iOS و Flutter Web.

---

## 🚀 طريقة الاستخدام

### 1. في ملف `pubspec.yaml`
```yaml
dependencies:
  feedback_sticker_flutter:
    path: ../packages/feedback_sticker_flutter
```

### 2. في تطبيقك (داخل أي شاشة أو `Stack` رئيسي):
```dart
import 'package:flutter/material.dart';
import 'package:feedback_sticker_flutter/feedback_sticker_flutter.dart';

class HomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('الرئيسية')),
      body: Stack(
        children: [
          // محتوى شاشتك الأساسي هنا
          const Center(child: Text('محتوى التطبيق')),

          // ستيكر الملاحظات العائم على حافة الشاشة
          FeedbackStickerFAB(
            currentUser: const FeedbackUser(
              name: 'د. علي حسين',
              email: 'ali@alzahu.edu.iq',
              jobTitle: 'تدريسي',
            ),
            projectId: 'mobile_app_project',
            apiKey: 'YOUR_FEEDBACK_API_KEY',
            currentScreenName: 'HomeScreen',
            isRtl: true,
          ),
        ],
      ),
    );
  }
}
```
