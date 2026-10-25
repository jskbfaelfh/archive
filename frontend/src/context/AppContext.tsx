// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file AppContext.tsx
 * @description سياق التطبيق المركزي لمنظومة الأرشفة الأكاديمية (Vite + Supabase SPA)
 * @created 2026-10-21
 * @updated 2026-10-25
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, College, Department, Section, Subject, Lecture, Schedule, Facility, IntegrationSettings, SyncHistoryItem } from '@/types';
import { initialColleges, initialSections, initialSubjects, initialUsers, initialLectures, initialSchedules } from '@/data/initialData';
import { defaultIntegrationSettings } from '@/data/centralIntegrationData';
import { executeCentralHierarchySync } from '@/services/centralSyncService';
import { AppContextType, MainTab } from './appContextTypes';
import { supabase } from '@/lib/supabase';

export type { MainTab, AppContextType };

const AppContext = createContext<AppContextType | undefined>(undefined);

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(`alzahrawi_prod_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(`alzahrawi_prod_${key}`, JSON.stringify(data));
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
  const [facilities, setFacilities] = useState<Facility[]>(() => loadStorage('facilities', []));
  const [integrationSettings, setIntegrationSettings] = useState<IntegrationSettings>(() => loadStorage('integration_settings', defaultIntegrationSettings));
  const [syncHistory, setSyncHistory] = useState<SyncHistoryItem[]>(() => loadStorage('sync_history', []));
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
  useEffect(() => { saveStorage('facilities', facilities); }, [facilities]);
  useEffect(() => { saveStorage('integration_settings', integrationSettings); }, [integrationSettings]);
  useEffect(() => { saveStorage('sync_history', syncHistory); }, [syncHistory]);

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

  const checkIntegrationLock = () => {
    if (integrationSettings.isEnabled) {
      throw new Error('تم تعطيل الإضافة اليدوية: نظام التكامل مع الهيكلية المركزية مفعل.');
    }
  };

  const addCollege = async (data: { name: string }) => {
    checkIntegrationLock();
    setColleges(prev => [...prev, { id: `col-${Date.now()}`, name: data.name, departments: [] }]);
  };
  const updateCollege = async (id: string, updates: Partial<College>) => {
    setColleges(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  };
  const deleteCollege = async (id: string) => {
    setColleges(prev => prev.filter(c => c.id !== id));
  };

  const addDepartment = async (collegeId: string, data: { name: string; stagesCount: number }) => {
    checkIntegrationLock();
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
    checkIntegrationLock();
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
    checkIntegrationLock();
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

  const addFacility = async (data: Omit<Facility, 'id'>) => {
    checkIntegrationLock();
    const newFac: Facility = { id: `fac-${Date.now()}`, ...data };
    setFacilities(prev => [...prev, newFac]);
  };
  const updateFacility = async (id: string, updates: Partial<Facility>) => {
    setFacilities(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));
  };
  const deleteFacility = async (id: string) => {
    setFacilities(prev => prev.filter(f => f.id !== id));
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

  const updateIntegrationSettings = async (updates: Partial<IntegrationSettings>) => {
    setIntegrationSettings(prev => ({ ...prev, ...updates }));
  };

  const triggerCentralSync = async () => {
    setIsLoading(true);
    try {
      const result = await executeCentralHierarchySync(integrationSettings);
      if (result.success && result.colleges) {
        setColleges(result.colleges);
        if (result.users) {
          const superAdmin = users.find(u => u.role === 'super_admin') || initialUsers[0];
          setUsers([superAdmin, ...result.users.filter(u => u.role !== 'super_admin')]);
        }
        if (result.facilities) setFacilities(result.facilities);

        const now = new Date().toLocaleString('ar-IQ');
        const updatedSettings: IntegrationSettings = {
          ...integrationSettings,
          lastSyncTimestamp: now,
          lastSyncStatus: 'success',
          lastSyncMessage: result.message,
          mappings: {
            ...integrationSettings.mappings,
            colleges: { ...integrationSettings.mappings.colleges, syncedCount: result.counts.colleges, lastSyncedAt: now },
            departments: { ...integrationSettings.mappings.departments, syncedCount: result.counts.departments, lastSyncedAt: now },
            faculty: { ...integrationSettings.mappings.faculty, syncedCount: result.counts.faculty, lastSyncedAt: now },
            facilities: { ...integrationSettings.mappings.facilities, syncedCount: result.counts.facilities, lastSyncedAt: now },
          },
        };
        setIntegrationSettings(updatedSettings);

        const newLog: SyncHistoryItem = {
          id: `sync-${Date.now()}`,
          timestamp: now,
          type: 'manual',
          status: 'success',
          details: result.message || 'تمت المزامنة بنجاح',
          counts: result.counts,
        };
        setSyncHistory(prev => [newLog, ...prev.slice(0, 19)]);
        return { success: true, message: result.message || 'تمت المزامنة بنجاح', counts: result.counts };
      }
      throw new Error(result.error || 'فشلت المزامنة');
    } catch (err: any) {
      setIntegrationSettings(prev => ({ ...prev, lastSyncStatus: 'error', lastSyncMessage: err.message }));
      return { success: false, message: err.message };
    } finally {
      setIsLoading(false);
    }
  };

  const resetAll = async () => {
    localStorage.clear();
    setColleges(initialColleges);
    setSections(initialSections);
    setSubjects(initialSubjects);
    setUsers(initialUsers);
    setLectures(initialLectures);
    setSchedules(initialSchedules);
    setFacilities([]);
    setIntegrationSettings(defaultIntegrationSettings);
    setSyncHistory([]);
    setCurrentUser(initialUsers[0]);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser, users, login, logout, changePassword, isLoginModalOpen, setIsLoginModalOpen,
        colleges, sections, subjects, lectures, schedules, facilities, integrationSettings, syncHistory,
        addCollege, updateCollege, deleteCollege,
        addDepartment, updateDepartment, deleteDepartment,
        addSection, updateSection, deleteSection,
        addSubject, updateSubject, deleteSubject,
        addUser, updateUser, deleteUser,
        addFacility, updateFacility, deleteFacility,
        addLecture, updateLecture, deleteLecture,
        addSchedule, updateSchedule, deleteSchedule,
        updateIntegrationSettings, triggerCentralSync,
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
