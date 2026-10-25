/**
 * @file FeedbackSticker.tsx
 * @description المكون الرئيسي للستيكر العائم على حافة الشاشة مع حركة الاندفاع
 */

import React, { useState } from 'react';
import { FeedbackConfig, FeedbackI18nTexts, FeedbackLanguage, FeedbackUser } from './types';
import { getMergedTexts } from './i18n';
import { FeedbackModal } from './FeedbackModal';
import { StickyNoteIcon } from './Icons';

export interface FeedbackStickerProps {
  /** بيانات المستخدم الحالي اختيارياً لربط هوية المرسل */
  currentUser?: FeedbackUser | null;
  /** إعدادات الاتصال بنظام إدارة المشاريع */
  config?: FeedbackConfig;
  /** لغة العرض واتجاه الستيكر: 'ar' (يسار الشاشة RTL) أو 'en' (يمين الشاشة LTR) */
  lang?: FeedbackLanguage;
  /** إمكانية تجاوز النصوص وترجمتها */
  texts?: FeedbackI18nTexts;
  /** موضع الستيكر عمودياً (افتراضياً: top-1/2 -translate-y-1/2) */
  positionClass?: string;
  /** فئة تنسيق إضافية للزر */
  className?: string;
  /** حدث يطلق عند نجاح الإرسال */
  onSuccess?: () => void;
  /** حدث يطلق عند حدوث خطأ */
  onError?: (err: string) => void;
}

export const FeedbackSticker: React.FC<FeedbackStickerProps> = ({
  currentUser,
  config,
  lang = 'ar',
  texts,
  positionClass = 'top-1/2 -translate-y-1/2',
  className = '',
  onSuccess,
  onError
}) => {
  const t = getMergedTexts(lang, texts);
  const isRtl = lang === 'ar';
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* 
        الستيكر العائم على حافة الشاشة:
        - عند اللغة العربية (isRtl = true): يثبت على الحافة اليسرى (left-0)
        - عند اللغة الإنجليزية (isRtl = false): يثبت على الحافة اليمنى (right-0)
        - يظهر منه جزء فقط ويكون مستطيلاً شبه مخفي
        - عند تحويم الماوس (hover): يندفع نحو الشاشة بسلاسة كاملة
      */}
      <div
        className={`fixed ${positionClass} z-[99990] select-none print:hidden transition-all duration-300 ease-out ${
          isRtl
            ? 'left-0 -translate-x-[calc(100%-36px)] hover:translate-x-0'
            : 'right-0 translate-x-[calc(100%-36px)] hover:translate-x-0'
        } ${className}`}
      >
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label={t.add_note_sticker}
          className={`group flex items-center gap-2.5 px-3.5 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:from-purple-700 hover:via-indigo-700 hover:to-purple-800 text-white font-bold text-[13px] shadow-xl hover:shadow-purple-500/25 transition-all duration-200 cursor-pointer border border-purple-400/40 focus:outline-none focus:ring-2 focus:ring-purple-400/50 ${
            isRtl ? 'rounded-r-xl' : 'rounded-l-xl'
          }`}
        >
          {isRtl ? (
            <>
              <span className="whitespace-nowrap tracking-wide">
                {t.add_note_sticker}
              </span>
              <div className="w-6 h-6 rounded-lg bg-purple-700/60 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                <StickyNoteIcon className="w-4 h-4" />
              </div>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-lg bg-purple-700/60 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                <StickyNoteIcon className="w-4 h-4" />
              </div>
              <span className="whitespace-nowrap tracking-wide">
                {t.add_note_sticker}
              </span>
            </>
          )}
        </button>
      </div>

      {/* نافذة الملاحظة المنبثقة المتجاوبة */}
      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        config={config}
        lang={lang}
        texts={texts}
        onSuccess={onSuccess}
        onError={onError}
      />
    </>
  );
};
