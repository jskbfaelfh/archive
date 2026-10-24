// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file initialData.ts
 * @description البيانات الافتراضية لمنظومة جامعة الزهراوي (النسخة الرسمية - نظيفة ومصفرة للتشغيل التجريبي)
 * @created 2026-10-21
 * @updated 2026-10-24
 */
import { College, Section, Subject, User, Lecture, Schedule } from '@/types';

export const initialColleges: College[] = [];

export const initialSections: Section[] = [];

export const initialUsers: User[] = [
  {
    id: 'user-super-admin',
    name: 'المشرف العام على المنظومة',
    email: 'admin@alzahrawi.edu.iq',
    role: 'super_admin',
    title: 'المشرف العام - رئاسة الجامعة',
  },
];

export const initialSubjects: Subject[] = [];

export const initialLectures: Lecture[] = [];

export const initialSchedules: Schedule[] = [];
