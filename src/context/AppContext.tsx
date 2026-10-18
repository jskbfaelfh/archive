'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, College, Department, Section, Subject, Lecture, UserRole } from '@/types';

export type MainTab = 'structure' | 'users' | 'lectures' | 'analytics';

interface AppContextType {
  currentUser: User;
  users: User[];
  switchUser: (id: string) => Promise<void>;

  colleges: College[];
  sections: Section[];
  subjects: Subject[];
  lectures: Lecture[];

  // College CRUD
  addCollege: (data: { name: string }) => Promise<void>;
  updateCollege: (id: string, updates: Partial<College>) => Promise<void>;
  deleteCollege: (id: string) => Promise<void>;

  // Department CRUD
  addDepartment: (collegeId: string, data: { name: string; stagesCount: number }) => Promise<void>;
  updateDepartment: (collegeId: string, deptId: string, updates: Partial<Department>) => Promise<void>;
  deleteDepartment: (collegeId: string, deptId: string) => Promise<void>;

  // Section CRUD
  addSection: (data: { name: string; collegeId: string; departmentId: string; stage: number }) => Promise<void>;
  updateSection: (id: string, updates: Partial<Section>) => Promise<void>;
  deleteSection: (id: string) => Promise<void>;

  // Subject CRUD
  addSubject: (data: Omit<Subject, 'id'>) => Promise<void>;
  updateSubject: (id: string, updates: Partial<Subject>) => Promise<void>;
  deleteSubject: (id: string) => Promise<void>;

  // User CRUD
  addUser: (data: Omit<User, 'id'>) => Promise<void>;
  updateUser: (id: string, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Lecture CRUD
  addLecture: (data: Omit<Lecture, 'id' | 'uploadDate' | 'downloadsCount' | 'viewsCount'>) => Promise<void>;
  updateLecture: (id: string, updates: Partial<Lecture>) => Promise<void>;
  deleteLecture: (id: string) => Promise<void>;

  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  resetAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-super-admin',
    name: 'د. عقيل الزهراوي',
    email: 'admin@alzahrawi.edu.iq',
    role: 'super_admin',
    title: 'المشرف العام على المنظومة',
  });
  const [colleges, setColleges] = useState<College[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [activeTab, setActiveTab] = useState<MainTab>('structure');
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = useCallback(async () => {
    try {
      // 1. Fetch current user
      const meRes = await fetch('/api/auth/me');
      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.user) {
          setCurrentUser(meData.user);
        } else {
          // Default to first user if no session
          await fetch('/api/auth/switch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'user-super-admin' }),
          });
        }
      }

      // 2. Fetch Colleges
      const colRes = await fetch('/api/colleges');
      if (colRes.ok) {
        const colData = await colRes.json();
        if (colData.colleges) setColleges(colData.colleges);
      }

      // 3. Fetch Sections
      const secRes = await fetch('/api/sections');
      if (secRes.ok) {
        const secData = await secRes.json();
        if (secData.sections) setSections(secData.sections);
      }

      // 4. Fetch Subjects
      const subRes = await fetch('/api/subjects');
      if (subRes.ok) {
        const subData = await subRes.json();
        if (subData.subjects) setSubjects(subData.subjects);
      }

      // 5. Fetch Users
      const usrRes = await fetch('/api/users');
      if (usrRes.ok) {
        const usrData = await usrRes.json();
        if (usrData.users) setUsers(usrData.users);
      }

      // 6. Fetch Lectures (Server filtered by role!)
      const lecRes = await fetch('/api/lectures');
      if (lecRes.ok) {
        const lecData = await lecRes.json();
        if (lecData.lectures) setLectures(lecData.lectures);
      }
    } catch (error) {
      console.error('Error refreshing backend data:', error);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Switch perspective and update JWT session on server
  const switchUser = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        await refreshData();
      }
    } catch (e) {
      console.error('Failed to switch user:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // College Operations
  const addCollege = async (data: { name: string }) => {
    await fetch('/api/colleges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await refreshData();
  };

  const updateCollege = async (id: string, updates: Partial<College>) => {
    await fetch('/api/colleges', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    await refreshData();
  };

  const deleteCollege = async (id: string) => {
    await fetch(`/api/colleges?id=${id}`, { method: 'DELETE' });
    await refreshData();
  };

  // Department Operations
  const addDepartment = async (collegeId: string, data: { name: string; stagesCount: number }) => {
    await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collegeId, ...data }),
    });
    await refreshData();
  };

  const updateDepartment = async (collegeId: string, deptId: string, updates: Partial<Department>) => {
    await fetch('/api/departments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deptId, collegeId, ...updates }),
    });
    await refreshData();
  };

  const deleteDepartment = async (collegeId: string, deptId: string) => {
    await fetch(`/api/departments?id=${deptId}`, { method: 'DELETE' });
    await refreshData();
  };

  // Section Operations
  const addSection = async (data: { name: string; collegeId: string; departmentId: string; stage: number }) => {
    await fetch('/api/sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await refreshData();
  };

  const updateSection = async (id: string, updates: Partial<Section>) => {
    await fetch('/api/sections', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    await refreshData();
  };

  const deleteSection = async (id: string) => {
    await fetch(`/api/sections?id=${id}`, { method: 'DELETE' });
    await refreshData();
  };

  // Subject Operations
  const addSubject = async (data: Omit<Subject, 'id'>) => {
    await fetch('/api/subjects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await refreshData();
  };

  const updateSubject = async (id: string, updates: Partial<Subject>) => {
    await fetch('/api/subjects', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    await refreshData();
  };

  const deleteSubject = async (id: string) => {
    await fetch(`/api/subjects?id=${id}`, { method: 'DELETE' });
    await refreshData();
  };

  // User Operations
  const addUser = async (data: Omit<User, 'id'>) => {
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await refreshData();
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    await fetch('/api/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    await refreshData();
  };

  const deleteUser = async (id: string) => {
    await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
    await refreshData();
  };

  // Lecture Operations
  const addLecture = async (data: Omit<Lecture, 'id' | 'uploadDate' | 'downloadsCount' | 'viewsCount'>) => {
    await fetch('/api/lectures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    await refreshData();
  };

  const updateLecture = async (id: string, updates: Partial<Lecture>) => {
    await fetch('/api/lectures', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });
    await refreshData();
  };

  const deleteLecture = async (id: string) => {
    await fetch(`/api/lectures?id=${id}`, { method: 'DELETE' });
    await refreshData();
  };

  const resetAll = async () => {
    // Re-seed DB to initial state
    await fetch('/api/auth/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: 'user-super-admin' }),
    });
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        switchUser,
        colleges,
        sections,
        subjects,
        lectures,
        addCollege,
        updateCollege,
        deleteCollege,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        addSection,
        updateSection,
        deleteSection,
        addSubject,
        updateSubject,
        deleteSubject,
        addUser,
        updateUser,
        deleteUser,
        addLecture,
        updateLecture,
        deleteLecture,
        activeTab,
        setActiveTab,
        isLoading,
        refreshData,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
