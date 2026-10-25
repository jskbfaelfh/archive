// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file appContextTypes.ts
 * @description تعريف واجهات وأنواع سياق المنظومة المركزي
 * @created 2026-10-25
 */
import {
  User,
  College,
  Department,
  Section,
  Subject,
  Lecture,
  Schedule,
  Facility,
  IntegrationSettings,
  SyncHistoryItem,
} from '@/types';

export type MainTab = 'structure' | 'users' | 'lectures' | 'schedules' | 'analytics' | 'settings';

export interface AppContextType {
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
  facilities: Facility[];
  integrationSettings: IntegrationSettings;
  syncHistory: SyncHistoryItem[];
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
  addFacility: (data: Omit<Facility, 'id'>) => Promise<void>;
  updateFacility: (id: string, updates: Partial<Facility>) => Promise<void>;
  deleteFacility: (id: string) => Promise<void>;
  addLecture: (data: Omit<Lecture, 'id' | 'uploadDate' | 'downloadsCount' | 'viewsCount'>) => Promise<void>;
  updateLecture: (id: string, updates: Partial<Lecture>) => Promise<void>;
  deleteLecture: (id: string) => Promise<void>;
  addSchedule: (data: Omit<Schedule, 'id' | 'createdAt'>) => Promise<void>;
  updateSchedule: (id: string, updates: Partial<Schedule>) => Promise<void>;
  deleteSchedule: (id: string) => Promise<void>;
  updateIntegrationSettings: (updates: Partial<IntegrationSettings>) => Promise<void>;
  triggerCentralSync: () => Promise<{ success: boolean; message: string; counts?: any }>;
  activeTab: MainTab;
  setActiveTab: (tab: MainTab) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  resetAll: () => Promise<void>;
}
