// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file AppContext.tsx
 * @description سياق التطبيق المركزي لمنظومة الأرشفة الأكاديمية (Vite + Supabase SPA)
 * @created 2026-10-21
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, College, Department, Section, Subject, Lecture, Schedule } from '@/types';
import { initialColleges, initialSections, initialSubjects, initialUsers, initialLectures, initialSchedules } from '@/data/initialData';
import { supabase } from '@/lib/supabase';

export type MainTab = 'structure' | 'users' | 'lectures' | 'schedules' | 'analytics';

interface AppContextType {
  currentUser: User;
  users: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;

  colleges: College[];
  sections: Section[];
  subjects: Subject[];
  lectures: Lecture[];
  schedules: Schedule[];

  addCollege: (data: { name: string }) => Promise<void>;
  updateCollege: (id: string, updates: Partial<College>) => Promise<void>;
  deleteCollege: (id: string) => Promise<void>;

  addDepartment: (collegeId: string, data: { name: string; stagesCount: number }) => Promise<void>;
  updateDepartment: (collegeId: string, deptId: string, updates: Partial<Department>) => Promise<void>;
  deleteDepartment: (collegeId: string, deptId: string) => Promise<void>;

  addSection: (data: { name: string; collegeId: string; departmentId: string; stage: number }) => Promise<void>;
  updateSection: (id: string, updates: Partial<Section>) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;

  addSubject: (data: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  addUser: (data: Omit<User, 'id'> & { password?: string }) => Promise<{ tempPassword?: string; user?: User; [key: string]: any } | void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  addLecture: (data: Omit<Lecture, 'id' | 'uploadDate' | 'downloadsCount' | 'viewsCount'>) => Promise<void>;
  updateLecture: (id: string, updates: Partial<Lecture>) => Promise<void>;
  deleteLecture: (id: string) => Promise<void>;

  addSchedule: (data: Omit<Schedule, 'id' | 'createdAt'>) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;

  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  resetAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`alzahrawi_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(`alzahrawi_${key}`, JSON.stringify(data));
  } catch {}
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => loadStorage('users', initialUsers));
  const [currentUser, setCurrentUser] = useState<User>(() => loadStorage('currentUser', initialUsers[0]));
  const [colleges, setColleges] = useState<College[]>(() => loadStorage('colleges', initialColleges));
  const [sections, setSections] = useState<Section[]>(() => loadStorage('sections', initialSections));
  const [subjects, setSubjects] = useState<Subject[]>(() => loadStorage('subjects', initialSubjects));
  const [lectures, setLectures] = useState<Lecture[]>(() => loadStorage('lectures', initialLectures));
  const [schedules, setSchedules] = useState<Schedule[]>(() => loadStorage('schedules', initialSchedules));
  const [activeTab, setActiveTab] = useState<MainTab>('structure');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => { saveStorage('users', users); }, [users]);
  useEffect(() => { saveStorage('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { saveStorage('colleges', colleges); }, [colleges]);
  useEffect(() => { saveStorage('sections', sections); }, [sections]);
  useEffect(() => { saveStorage('subjects', subjects); }, [subjects]);
  useEffect(() => { saveStorage('lectures', lectures); }, [lectures]);
  useEffect(() => { saveStorage('schedules', schedules); }, [schedules]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: dbColleges } = await supabase.from('colleges').select('*');
      if (dbColleges && dbColleges.length > 0) setColleges(dbColleges as any);
    } catch {} finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, _pass: string) => {
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      setCurrentUser(found);
      setIsLoginModalOpen(false);
      return { success: true };
    }
    return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' };
  };

  const logout = async () => { setCurrentUser(users[0]); };
  const changePassword = async () => ({ success: true });

  const addCollege = async (data: { name: string }) => {
    setColleges(prev => [...prev, { id: `col-${Date.now()}`, name: data.name, departments: [] }]);
  };
  const updateCollege = async (id: string, updates: Partial<College>) => {
    setColleges(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };
  const deleteCollege = async (id: string) => {
    setColleges(prev => prev.filter(c => c.id !== id));
  };

  const addDepartment = async (collegeId: string, data: { name: string; stagesCount: number }) => {
    setColleges(prev => prev.map(c => c.id === collegeId ? {
      ...c, departments: [...c.departments, { id: `dept-${Date.now()}`, collegeId, ...data }]
    } : c));
  };
  const updateDepartment = async (collegeId: string, deptId: string, updates: Partial<Department>) => {
    setColleges(prev => prev.map(c => c.id === collegeId ? {
      ...c, departments: c.departments.map(d => d.id === deptId ? { ...d, ...updates } : d)
    } : c));
  };
  const deleteDepartment = async (collegeId: string, deptId: string) => {
    setColleges(prev => prev.map(c => c.id === collegeId ? {
      ...c, departments: c.departments.filter(d => d.id !== deptId)
    } : c));
  };

  const addSection = async (data: { name: string; collegeId: string; departmentId: string; stage: number }) => {
    setSections(prev => [...prev, { id: `sec-${Date.now()}`, ...data }]);
  };
  const updateSection = async (id: string, updates: Partial<Section>) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  const deleteSection = async (id: string) => {
    setSections(prev => prev.filter(s => s.id !== id));
  };

  const addSubject = async (data: Omit<Subject, 'id'>) => {
    setSubjects(prev => [...prev, { id: `sub-${Date.now()}`, ...data }]);
  };
  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  const deleteSubject = async (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  const addUser = async (data: Omit<User, 'id'> & { password?: string }) => {
    const newUser: User = { id: `user-${Date.now()}`, ...data };
    setUsers(prev => [...prev, newUser]);
    return { user: newUser };
  };
  const updateUser = async (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  };
  const deleteUser = async (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const addLecture = async (data: Omit<Lecture, 'id' | 'uploadDate' | 'downloadsCount' | 'viewsCount'>) => {
    const newLec: Lecture = {
      id: `lec-${Date.now()}`, ...data,
      uploadDate: new Date().toISOString().split('T')[0],
      downloadsCount: 0, viewsCount: 0,
    };
    setLectures(prev => [newLec, ...prev]);
  };
  const updateLecture = async (id: string, updates: Partial<Lecture>) => {
    setLectures(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  };
  const deleteLecture = async (id: string) => {
    setLectures(prev => prev.filter(l => l.id !== id));
  };

  const addSchedule = async (data: Omit<Schedule, 'id' | 'createdAt'>) => {
    const newSched: Schedule = {
      id: `sched-${Date.now()}`, ...data,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setSchedules(prev => [newSched, ...prev]);
  };
  const updateSchedule = async (id: string, updates: Partial<Schedule>) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };
  const deleteSchedule = async (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  };

  const resetAll = async () => {
    localStorage.clear();
    setColleges(initialColleges);
    setSections(initialSections);
    setSubjects(initialSubjects);
    setUsers(initialUsers);
    setLectures(initialLectures);
    setSchedules(initialSchedules);
    setCurrentUser(initialUsers[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser, users, login, logout, changePassword, isLoginModalOpen, setIsLoginModalOpen,
        colleges, sections, subjects, lectures, schedules,
        addCollege, updateCollege, deleteCollege,
        addDepartment, updateDepartment, deleteDepartment,
        addSection, updateSection, deleteSection,
        addSubject, updateSubject, deleteSubject,
        addUser, updateUser, deleteUser,
        addLecture, updateLecture, deleteLecture,
        addSchedule, updateSchedule, deleteSchedule,
        activeTab, setActiveTab, isLoading, refreshData, resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
