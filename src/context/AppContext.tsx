'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, College, Department, Section, Subject, Lecture, UserRole } from '@/types';
import { StorageService } from '@/lib/storage';

export type MainTab = 'structure' | 'users' | 'lectures';

interface AppContextType {
  currentUser: User;
  users: User[];
  switchUser: (id: string) => void;

  colleges: College[];
  sections: Section[];
  subjects: Subject[];
  lectures: Lecture[];

  // College CRUD
  addCollege: (data: { name: string }) => College;
  updateCollege: (id: string, updates: Partial<College>) => void;
  deleteCollege: (id: string) => void;

  // Department CRUD
  addDepartment: (collegeId: string, data: { name: string; stagesCount: number }) => Department | null;
  updateDepartment: (collegeId: string, deptId: string, updates: Partial<Department>) => void;
  deleteDepartment: (collegeId: string, deptId: string) => void;

  // Section CRUD
  addSection: (data: { name: string; collegeId: string; departmentId: string; stage: number }) => Section;
  updateSection: (id: string, updates: Partial<Section>) => void;
  deleteSection: (id: string) => void;

  // Subject CRUD
  addSubject: (data: Omit<Subject, 'id'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // User CRUD
  addUser: (data: Omit<User, 'id'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Lecture CRUD
  addLecture: (data: Omit<Lecture, 'id' | 'uploadDate' | 'downloadsCount' | 'viewsCount'>) => Lecture;
  updateLecture: (id: string, updates: Partial<Lecture>) => void;
  deleteLecture: (id: string) => void;

  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  resetAll: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'user-super-admin',
    name: 'سوبر أدمن الجامعة',
    email: 'admin@alzahrawi.edu.iq',
    role: 'super_admin',
  });
  const [colleges, setColleges] = useState<College[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [activeTab, setActiveTab] = useState<MainTab>('structure');

  const refreshData = () => {
    const loadedUsers = StorageService.getUsers();
    setUsers(loadedUsers);

    const currentId = StorageService.getCurrentUserId();
    const active = loadedUsers.find((u) => u.id === currentId) || loadedUsers[0];
    if (active) setCurrentUser(active);

    setColleges(StorageService.getColleges());
    setSections(StorageService.getSections());
    setSubjects(StorageService.getSubjects());
    setLectures(StorageService.getLectures());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const switchUser = (id: string) => {
    StorageService.setCurrentUserId(id);
    const user = users.find((u) => u.id === id);
    if (user) setCurrentUser(user);
  };

  // College Operations
  const addCollege = (data: { name: string }) => {
    const res = StorageService.addCollege(data);
    refreshData();
    return res;
  };
  const updateCollege = (id: string, updates: Partial<College>) => {
    StorageService.updateCollege(id, updates);
    refreshData();
  };
  const deleteCollege = (id: string) => {
    StorageService.deleteCollege(id);
    refreshData();
  };

  // Department Operations
  const addDepartment = (collegeId: string, data: { name: string; stagesCount: number }) => {
    const res = StorageService.addDepartment(collegeId, data);
    refreshData();
    return res;
  };
  const updateDepartment = (collegeId: string, deptId: string, updates: Partial<Department>) => {
    StorageService.updateDepartment(collegeId, deptId, updates);
    refreshData();
  };
  const deleteDepartment = (collegeId: string, deptId: string) => {
    StorageService.deleteDepartment(collegeId, deptId);
    refreshData();
  };

  // Section Operations
  const addSection = (data: { name: string; collegeId: string; departmentId: string; stage: number }) => {
    const res = StorageService.addSection(data);
    refreshData();
    return res;
  };
  const updateSection = (id: string, updates: Partial<Section>) => {
    StorageService.updateSection(id, updates);
    refreshData();
  };
  const deleteSection = (id: string) => {
    StorageService.deleteSection(id);
    refreshData();
  };

  // Subject Operations
  const addSubject = (data: Omit<Subject, 'id'>) => {
    const res = StorageService.addSubject(data);
    refreshData();
    return res;
  };
  const updateSubject = (id: string, updates: Partial<Subject>) => {
    StorageService.updateSubject(id, updates);
    refreshData();
  };
  const deleteSubject = (id: string) => {
    StorageService.deleteSubject(id);
    refreshData();
  };

  // User Operations
  const addUser = (data: Omit<User, 'id'>) => {
    const res = StorageService.addUser(data);
    refreshData();
    return res;
  };
  const updateUser = (id: string, updates: Partial<User>) => {
    StorageService.updateUser(id, updates);
    refreshData();
  };
  const deleteUser = (id: string) => {
    StorageService.deleteUser(id);
    refreshData();
  };

  // Lecture Operations
  const addLecture = (data: Omit<Lecture, 'id' | 'uploadDate' | 'downloadsCount' | 'viewsCount'>) => {
    const res = StorageService.addLecture(data);
    refreshData();
    return res;
  };
  const updateLecture = (id: string, updates: Partial<Lecture>) => {
    StorageService.updateLecture(id, updates);
    refreshData();
  };
  const deleteLecture = (id: string) => {
    StorageService.deleteLecture(id);
    refreshData();
  };

  const resetAll = () => {
    StorageService.resetAll();
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
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
