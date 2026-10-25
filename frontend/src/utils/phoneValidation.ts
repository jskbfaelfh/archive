// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file phoneValidation.ts
 * @description أدوات التحقق المركزية لأرقام الهواتف العراقية وفق المعايير الهندسية الجامعية
 * @created 2026-10-25
 * @modified 2026-10-25
 */

/**
 * تحديد الحد الأقصى للأرقام المسموح بها ديناميكياً:
 * إذا بدأ الرقم بـ 0 يسمح بـ 11 رقماً، وإذا لم يبدأ بـ 0 يسمح بـ 10 أرقام.
 */
export function getPhoneMaxDigits(value: string): number {
  const clean = value.replace(/\D/g, '');
  return clean.startsWith('0') ? 11 : 10;
}

/**
 * تنقية وتطهير رقم الهاتف من أي أحرف أو رموز أو مسافات واقتصاره على الأرقام فقط
 * مع قص أي زيادة تتجاوز الحد الأقصى المسموح.
 */
export function sanitizePhoneNumber(input: string): string {
  const digitsOnly = input.replace(/\D/g, '');
  if (!digitsOnly) return '';
  const maxDigits = getPhoneMaxDigits(digitsOnly);
  return digitsOnly.slice(0, maxDigits);
}

/**
 * التحقق من اكتمال وصحة رقم الهاتف العراقي
 */
export function isPhoneNumberComplete(value: string): boolean {
  const clean = value.replace(/\D/g, '');
  if (!clean) return false;
  const expectedLength = getPhoneMaxDigits(clean);
  return clean.length === expectedLength;
}
