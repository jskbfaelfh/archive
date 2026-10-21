// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file supabase.ts
 * @description عميل Supabase المركزي الموحد لمنظومة جامعة الزهراوي
 * @created 2026-10-21
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://api.supabase.alzahu.edu.iq';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'eyJhbGciOiAiSFMyNTYiLCAidHlwIjogIkpXVCJ9.eyJyb2xlIjogImFub24iLCAiaXNzIjogInN1cGFiYXNlIiwgImlhdCI6IDE3OTE2MzA0ODEsICJleHAiOiAyMTA2OTkwNDgxfQ.SR3-R_GE6lwuENPcSWfcCzxdAEyfUE3NvpFiKgrE4Pc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
