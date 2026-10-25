// يجب قراءة ملف قواعد كتابة الكود قبل كتابة أي سطر في الملف
/**
 * @file MobileControlDrawer.tsx
 * @description لوحة وقائمة التحكم الشاملة لمود الموبايل
 */
import React from 'react';
import { useApp } from '@/context/AppContext';
import { MainTab } from '@/context/appContextTypes';
import {
  Layers,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Settings,
  Shield,
  LogOut,
  LogIn,
  RotateCcw,
  X,
  Monitor,
  Smartphone,
  ChevronLeft
} from 'lucide-react';

interface MobileControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isMobileMode: boolean;
  onToggleViewMode: () => void;
}

export const MobileControlDrawer: React.FC<MobileControlDrawerProps> = ({
  isOpen,
  onClose,
  isMobileMode,
  onToggleViewMode,
}) => {
  const {
    currentUser,
    colleges,
    activeTab,
    setActiveTab,
    logout,
    setIsLoginModalOpen,
    resetAll,
  } = useApp();

  if (!isOpen) return null;

  const isSuper = currentUser.role === 'super_admin';
  const isCollegeAdmin = currentUser.role === 'college_admin';
  const isDeptAdmin = currentUser.role === 'department_admin';
  const canSeeStructure = isSuper || isCollegeAdmin || isDeptAdmin;
  const canSeeUsersTab = isSuper || isCollegeAdmin || isDeptAdmin;

  const userCol = colleges.find((c) => c.id === currentUser.collegeId);

  const navItems: { tab: MainTab; label: string; icon: any; visible: boolean }[] = [
    { tab: 'structure', label: 'الهيكلية الأكاديمية', icon: Layers, visible: canSeeStructure },
    { tab: 'users', label: 'المستخدمون والكوادر', icon: Users, visible: canSeeUsersTab },
    { tab: 'lectures', label: 'المحاضرات والمناهج', icon: FileText, visible: true },
    { tab: 'schedules', label: 'الجداول الدراسية والقاعات', icon: Calendar, visible: true },
    { tab: 'analytics', label: 'الإحصائيات والتقارير', icon: TrendingUp, visible: canSeeUsersTab },
    { tab: 'settings', label: 'إعدادات المنظومة والربط المركزي', icon: Settings, visible: isSuper },
  ];

  const handleSelectTab = (tab: MainTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* خلفية معتمة */}
      <div
        className="fixed inset-0 bg-[#02091b]/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* لوحة السحب المنبثقة */}
      <div className="relative w-full max-w-xs sm:max-w-sm bg-[#041633] text-white h-full flex flex-col shadow-2xl z-10 border-l border-cyan-500/20">
        {/* رأس اللوحة */}
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-[#0a1e3b]/80">
          <div className="flex items-center gap-3">
            <img
              src="/images/university-logo.png"
              alt="شعار جامعة الزهراوي"
              className="h-10 w-10 object-contain drop-shadow"
            />
            <div>
              <h2 className="text-sm font-black text-white">جامعة الزهراوي</h2>
              <p className="text-[10px] text-cyan-300">لوحة التحكم • مود الموبايل</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* بطاقة المستخدم النشط */}
        <div className="p-4 border-b border-cyan-500/15 bg-gradient-to-br from-[#0a1e3b]/90 to-[#041633]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-600/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-inner shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate">{currentUser.name}</div>
              <div className="text-[11px] text-cyan-300/80 truncate">
                {isSuper && 'مسؤول النظام العام (سوبر أدمن)'}
                {isCollegeAdmin && `عميد • ${userCol?.name || 'الكلية'}`}
                {isDeptAdmin && 'رئيس قسم'}
                {currentUser.role === 'doctor' && 'عضو هيئة تدريسية'}
                {currentUser.role === 'student' && `طالب • مرحلة ${currentUser.stage || 1}`}
              </div>
            </div>
          </div>
        </div>

        {/* قائمة التبويبات والتنقل */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-[10px] font-bold text-cyan-400/70 px-3 py-1">أقسام المنظومة</div>
          {navItems.filter(i => i.visible).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => handleSelectTab(item.tab)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 text-white shadow-md shadow-sky-600/30 border border-cyan-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-cyan-300'}`} />
                  <span>{item.label}</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 opacity-50" />
              </button>
            );
          })}
        </div>

        {/* إعدادات المود وأزرار التحكم */}
        <div className="p-3 border-t border-cyan-500/20 bg-[#0a1e3b]/60 space-y-2">
          {/* تبديل مود العرض (حاسبة / موبايل) */}
          <button
            onClick={() => {
              onToggleViewMode();
              onClose();
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-200 text-xs font-bold transition-all border border-cyan-500/20 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {isMobileMode ? <Monitor className="w-4 h-4 text-cyan-300" /> : <Smartphone className="w-4 h-4 text-cyan-300" />}
              <span>{isMobileMode ? 'التحويل إلى مود الحاسبة' : 'التحويل إلى مود الموبايل'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-900/60 text-cyan-300 font-normal">
              {isMobileMode ? 'مود الحاسبة' : 'مود الموبايل'}
            </span>
          </button>

          <div className="flex items-center gap-2 pt-1">
            {currentUser.id ? (
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-rose-500/30 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>تسجيل الخروج</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsLoginModalOpen(true);
                  onClose();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>تسجيل الدخول</span>
              </button>
            )}

            <button
              onClick={() => {
                if (confirm('تصفير البيانات والعودة للبيانات الأولية؟')) {
                  resetAll();
                  onClose();
                }
              }}
              title="تصفير البيانات"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
