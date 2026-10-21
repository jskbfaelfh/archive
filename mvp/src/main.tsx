// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file main.tsx
 * @description مدخل تشغيل تطبيق React 19 المستند إلى Vite
 * @created 2026-10-21
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from '@/context/AppContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
