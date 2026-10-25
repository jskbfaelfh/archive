// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file MobileBottomNav.tsx
 * @description شريط التنقل والتحكم السفلي المخصص لمود الموبايل
 */
import React from 'react';
import { useApp } from '@/context/AppContext';
import { MainTab } from '@/context/appContextTypes';
import {
  Layers,
  Users,
  FileText,
  Calendar,
  SlidersHorizontal,
  Settings
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenDrawer }) => {
  const { currentUser, activeTab, setActiveTab } = useApp();

  const isSuper = currentUser.role === 'super_admin';
  const isCollegeAdmin = currentUser.role === 'college_admin';
  const isDeptAdmin = currentUser.role === 'department_admin';
  const canSeeStructure = isSuper || isCollegeAdmin || isDeptAdmin;
  const canSeeUsersTab = isSuper || isCollegeAdmin || isDeptAdmin;

  const tabs: { tab: MainTab; label: string; icon: any; show: boolean }[] = [
    { tab: 'structure', label: 'الهيكلية', icon: Layers, show: canSeeStructure },
    { tab: 'users', label: 'المستخدمون', icon: Users, show: canSeeUsersTab },
    { tab: 'lectures', label: 'المحاضرات', icon: FileText, show: true },
    { tab: 'schedules', label: 'الجداول', icon: Calendar, show: true },
    { tab: 'settings', label: 'الإعدادات', icon: Settings, show: isSuper },
  ];

  const visibleTabs = tabs.filter(t => t.show).slice(0, 4);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#041633]/95 backdrop-blur-md border-t border-cyan-500/20 shadow-2xl py-1 px-2 flex items-center justify-around select-none">
      {visibleTabs.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.tab;
        return (
          <button
            key={item.tab}
            onClick={() => setActiveTab(item.tab)}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all cursor-pointer min-w-[58px] ${
              isActive
                ? 'text-cyan-300 font-black'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${
              isActive ? 'bg-cyan-500/20 text-cyan-300 shadow-sm shadow-cyan-500/30' : ''
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 leading-tight">{item.label}</span>
          </button>
        );
      })}

      {/* زر لوحة التحكم الشاملة */}
      <button
        onClick={onOpenDrawer}
        className="flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-slate-400 hover:text-cyan-300 transition-all cursor-pointer min-w-[58px]"
      >
        <div className="p-1 rounded-xl bg-white/5">
          <SlidersHorizontal className="w-5 h-5 text-cyan-300" />
        </div>
        <span className="text-[10px] mt-0.5 leading-tight font-bold">التحكم</span>
      </button>
    </nav>
  );
};
