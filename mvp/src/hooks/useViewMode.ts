// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file useViewMode.ts
 * @description خطاف مخصص لإدارة مود العرض (مود الحاسبة مقابل مود الموبايل)
 */
import { useState, useEffect, useCallback } from 'react';

export type ViewMode = 'auto' | 'desktop' | 'mobile';

const STORAGE_KEY = 'alzahrawi_preferred_view_mode';

export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'desktop' || saved === 'mobile' || saved === 'auto') return saved;
    } catch {}
    return 'auto';
  });

  const [windowWidth, setWindowWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 1200;
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  }, []);

  // مود الموبايل نشط إذا تم اختياره يدوياً أو إذا كان التحديد تلقائي والشاشة أصغر من 1024 بكسل
  const isMobileMode = viewMode === 'mobile' || (viewMode === 'auto' && windowWidth < 1024);

  const toggleViewMode = useCallback(() => {
    setViewMode(isMobileMode ? 'desktop' : 'mobile');
  }, [isMobileMode, setViewMode]);

  return {
    viewMode,
    isMobileMode,
    setViewMode,
    toggleViewMode,
  };
}
