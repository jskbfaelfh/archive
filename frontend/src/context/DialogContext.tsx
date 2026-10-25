// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file DialogContext.tsx
 * @description نظام الحوار والتنبيهات الموحد البديل لدوال المتصفح الافتراضية وفق القاعدة 41 والقاعدة 24
 * @created 2026-10-25
 * @modified 2026-10-25
 */
import React, { createContext, useContext, useState, useRef, useEffect, ReactNode } from 'react';
import { AlertTriangle, Info, CheckCircle2, XCircle } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export interface AlertOptions {
  title?: string;
  message: string;
  buttonText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

interface DialogContextValue {
  confirm: (options: string | ConfirmOptions) => Promise<boolean>;
  alert: (options: string | AlertOptions) => Promise<void>;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const [alertState, setAlertState] = useState<AlertOptions | null>(null);

  const confirmResolver = useRef<((value: boolean) => void) | null>(null);
  const alertResolver = useRef<(() => void) | null>(null);

  const confirm = (options: string | ConfirmOptions): Promise<boolean> => {
    const opts = typeof options === 'string' ? { message: options } : options;
    setConfirmState(opts);
    return new Promise<boolean>((resolve) => {
      confirmResolver.current = resolve;
    });
  };

  const alert = (options: string | AlertOptions): Promise<void> => {
    const opts = typeof options === 'string' ? { message: options } : options;
    setAlertState(opts);
    return new Promise<void>((resolve) => {
      alertResolver.current = resolve;
    });
  };

  const handleConfirmClose = (result: boolean) => {
    setConfirmState(null);
    if (confirmResolver.current) {
      confirmResolver.current(result);
      confirmResolver.current = null;
    }
  };

  const handleAlertClose = () => {
    setAlertState(null);
    if (alertResolver.current) {
      alertResolver.current();
      alertResolver.current = null;
    }
  };

  // Keyboard shortcut listener for Esc and Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmState) handleConfirmClose(false);
        if (alertState) handleAlertClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [confirmState, alertState]);

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}

      {/* Confirmation Modal */}
      {confirmState && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[999999] bg-[#02091b]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => handleConfirmClose(false)}
        >
          <div
            className="bg-white rounded-[10px] shadow-2xl w-full max-w-sm p-5 space-y-4 border border-slate-200 text-slate-900 text-right animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  confirmState.isDanger ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-[#041633]">
                {confirmState.title || (confirmState.isDanger ? 'تأكيد الحذف والإجراء' : 'تأكيد العملية')}
              </h3>
            </div>

            <p className="text-[13px] font-medium text-slate-600 leading-relaxed">
              {confirmState.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => handleConfirmClose(false)}
                className="px-4 py-2 text-[13px] font-bold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-[7px] cursor-pointer transition-colors shadow-2xs"
              >
                {confirmState.cancelText || 'إلغاء'}
              </button>
              <button
                type="button"
                onClick={() => handleConfirmClose(true)}
                className={`px-4 py-2 text-[13px] font-bold text-white rounded-[7px] cursor-pointer transition-colors shadow-2xs ${
                  confirmState.isDanger
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-[#041633] hover:bg-[#07234f]'
                }`}
              >
                {confirmState.confirmText || 'تأكيد'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertState && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[999999] bg-[#02091b]/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={handleAlertClose}
        >
          <div
            className="bg-white rounded-[10px] shadow-2xl w-full max-w-sm p-5 space-y-4 border border-slate-200 text-slate-900 text-right animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                  alertState.type === 'error'
                    ? 'bg-rose-100 text-rose-600'
                    : alertState.type === 'success'
                    ? 'bg-emerald-100 text-emerald-600'
                    : alertState.type === 'warning'
                    ? 'bg-amber-100 text-amber-600'
                    : 'bg-sky-100 text-sky-600'
                }`}
              >
                {alertState.type === 'error' ? (
                  <XCircle className="w-5 h-5" />
                ) : alertState.type === 'success' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : alertState.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>
              <h3 className="font-black text-sm text-[#041633]">
                {alertState.title || 'إشعار من المنظومة'}
              </h3>
            </div>

            <p className="text-[13px] font-medium text-slate-600 leading-relaxed whitespace-pre-line">
              {alertState.message}
            </p>

            <div className="flex items-center justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handleAlertClose}
                className="w-full sm:w-auto px-5 py-2 text-[13px] font-bold text-white bg-[#041633] hover:bg-[#07234f] rounded-[7px] cursor-pointer transition-colors shadow-2xs"
              >
                {alertState.buttonText || 'موافق'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
