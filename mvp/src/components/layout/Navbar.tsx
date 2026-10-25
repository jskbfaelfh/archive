'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Layers,
  Users,
  FileText,
  Calendar,
  RotateCcw,
  Shield,
  TrendingUp,
  LogOut,
  LogIn,
  Lock,
  Mail,
  X,
  Settings,
  Smartphone,
  Monitor,
  Menu,
} from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useViewMode } from '@/hooks/useViewMode';
import { MobileControlDrawer } from './MobileControlDrawer';
import { MobileBottomNav } from './MobileBottomNav';

export default function Navbar() {
  const {
    currentUser,
    colleges,
    activeTab,
    setActiveTab,
    resetAll,
    login,
    logout,
    changePassword,
    isLoginModalOpen,
    setIsLoginModalOpen,
  } = useApp();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isMobileMode, toggleViewMode } = useViewMode();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Forced Password Change State
  const [curPass, setCurPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passChangeError, setPassChangeError] = useState<string | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const isSuper = currentUser.role === 'super_admin';
  const isCollegeAdmin = currentUser.role === 'college_admin';
  const isDeptAdmin = currentUser.role === 'department_admin';
  const isDoctor = currentUser.role === 'doctor';
  const isStudent = currentUser.role === 'student';
  const canSeeStructure = isSuper || isCollegeAdmin || isDeptAdmin;
  const canSeeUsersTab = isSuper || isCollegeAdmin || isDeptAdmin;

  const userCol = colleges.find((c) => c.id === currentUser.collegeId);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);
    const res = await login(loginEmail, loginPassword);
    setIsSubmitting(false);
    if (!res.success) {
      setLoginError(res.error || 'فشل تسجيل الدخول');
    } else {
      setLoginEmail('');
      setLoginPassword('');
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassChangeError(null);
    if (newPass.length < 8) {
      setPassChangeError('يجب أن لا تقل كلمة المرور الجديدة عن 8 خانات');
      return;
    }
    if (newPass === '123456' || newPass === '12345678') {
      setPassChangeError('لا يمكن استخدام كلمة مرور سهلة التخمين');
      return;
    }
    if (newPass !== confirmPass) {
      setPassChangeError('كلمتا المرور غير متطابقتين');
      return;
    }
    setIsChangingPass(true);
    const res = await changePassword(curPass, newPass);
    setIsChangingPass(false);
    if (!res.success) {
      setPassChangeError(res.error || 'فشل تغيير كلمة المرور');
    } else {
      setCurPass('');
      setNewPass('');
      setConfirmPass('');
    }
  };

  const handleQuickFill = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('123456');
    setLoginError(null);
  };

  return (
    <>
      <header className="bg-[#041633] text-white border-b border-cyan-500/20 sticky top-0 z-40 shadow-lg shadow-black/15">
        {/* Top subtle cyan brand glow strip */}
        <div className="h-0.5 w-full bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-600" />

        {/* 1. تفعيل مود الموبايل المخصص عند الحاجة */}
        {isMobileMode ? (
          <div className="w-full px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src="/images/university-logo.png"
                alt="شعار جامعة الزهراوي"
                className="h-9 w-9 object-contain drop-shadow shrink-0"
              />
              <div className="truncate">
                <h1 className="text-sm font-black text-white leading-tight">المحاضرات</h1>
                <p className="text-[10px] text-cyan-300/80 truncate">جامعة الزهراوي • مود الموبايل</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={toggleViewMode}
                title="التحويل لمود الحاسبة"
                className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/20 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Monitor className="w-3.5 h-3.5 text-cyan-400" />
                <span>الحاسبة</span>
              </button>

              {currentUser.id && <NotificationBell />}

              {currentUser.id ? (
                <div
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 bg-[#0a1e3b] border border-cyan-500/30 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:border-cyan-400/50"
                  title="عرض بيانات الحساب"
                >
                  <Shield className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="text-[11px] max-w-[75px] truncate">{currentUser.name}</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-[11px] font-bold cursor-pointer"
                >
                  دخول
                </button>
              )}
            </div>
          </div>
        ) : (
          /* 2. مود الحاسبة الأصلي (كما هو تماماً بدون أي تغيير) */
          <div className="w-full px-4 sm:px-6 lg:px-8 min-h-18 py-2.5 flex items-center justify-between gap-4">
          {/* Brand with Official University Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              src="/images/university-logo.png"
              alt="شعار جامعة الزهراوي"
              className="h-10 sm:h-11 w-auto object-contain drop-shadow"
            />
            <h1 className="text-base sm:text-lg font-black text-white tracking-wide whitespace-nowrap">
              المحاضرات
            </h1>
          </div>

          {/* Main Tabs with University Theme */}
          <nav className="flex items-center gap-1 bg-[#0a1e3b]/90 p-1.5 rounded-2xl border border-cyan-500/20 text-xs font-bold backdrop-blur-sm shrink-0">
            {canSeeStructure && (
              <button
                onClick={() => setActiveTab('structure')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'structure'
                    ? 'bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 text-white shadow-md shadow-sky-600/30 font-black border border-cyan-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Layers className="w-4 h-4 text-cyan-300" />
                <span>الهيكلية</span>
              </button>
            )}

            {canSeeUsersTab && (
              <button
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'users'
                    ? 'bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 text-white shadow-md shadow-sky-600/30 font-black border border-cyan-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-4 h-4 text-cyan-300" />
                <span>المستخدمون</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('lectures')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'lectures'
                  ? 'bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 text-white shadow-md shadow-sky-600/30 font-black border border-cyan-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-4 h-4 text-cyan-300" />
              <span>المحاضرات</span>
            </button>

            <button
              onClick={() => setActiveTab('schedules')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'schedules'
                  ? 'bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 text-white shadow-md shadow-sky-600/30 font-black border border-cyan-400/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Calendar className="w-4 h-4 text-cyan-300" />
              <span>الجداول</span>
            </button>

            {canSeeUsersTab && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 text-white shadow-md shadow-sky-600/30 font-black border border-cyan-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <TrendingUp className="w-4 h-4 text-cyan-300" />
                <span>الإحصائيات</span>
              </button>
            )}

            {isSuper && (
              <button
                onClick={() => setActiveTab('settings')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 text-white shadow-md shadow-sky-600/30 font-black border border-cyan-400/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Settings className="w-4 h-4 text-cyan-300" />
                <span>الإعدادات</span>
              </button>
            )}
          </nav>

          {/* User Info & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser.id && <NotificationBell />}

            {currentUser.id ? (
              <div className="flex items-center gap-2">
                {!isStudent && !isDoctor && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0a1e3b] border border-cyan-500/30 rounded-xl text-xs font-black text-white shadow-xs">
                    <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <div className="text-right">
                      <div className="leading-tight text-white">{currentUser.name}</div>
                      <div className="text-[10px] text-cyan-200/80 font-normal">
                        {isSuper && 'سوبر أدمن'}
                        {isCollegeAdmin && `عميد • ${userCol?.name || 'كلية'}`}
                        {isDeptAdmin && `رئيس قسم`}
                        {currentUser.role === 'doctor' && `تدريسي`}
                        {currentUser.role === 'student' && `طالب • م${currentUser.stage || 1}`}
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={logout}
                  title="تسجيل الخروج"
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-all cursor-pointer font-bold"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>خروج</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md shadow-sky-600/30 border border-cyan-400/30"
              >
                <LogIn className="w-3.5 h-3.5 text-cyan-200" />
                <span>دخول</span>
              </button>
            )}

            <button
              onClick={() => {
                if (confirm('تصفير البيانات والعودة للبيانات الأولية؟')) {
                  resetAll();
                }
              }}
              title="تصفير البيانات"
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/5 rounded-xl transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* زر التحويل إلى مود الموبايل من داخل الحاسبة */}
            <button
              onClick={toggleViewMode}
              title="التحويل لمود الموبايل"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-cyan-300 bg-white/5 hover:bg-white/10 border border-cyan-500/25 rounded-xl transition-all cursor-pointer font-bold shrink-0"
            >
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>مود الموبايل</span>
            </button>
          </div>
        </div>
      )}
      </header>

      {/* عناصر مود الموبايل (الشريط السفلي ولوحة التحكم الشاملة) */}
      {isMobileMode && (
        <>
          <MobileBottomNav onOpenDrawer={() => setDrawerOpen(true)} />
          <MobileControlDrawer
            isOpen={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            isMobileMode={isMobileMode}
            onToggleViewMode={toggleViewMode}
          />
        </>
      )}

      {/* LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#02091b]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200 text-slate-900 my-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src="/images/university-logo.png"
                  alt="شعار جامعة الزهراوي"
                  className="h-10 w-auto object-contain"
                />
                <div>
                  <h3 className="font-black text-base text-[#041633]">تسجيل الدخول المركزي</h3>
                  <p className="text-[11px] text-slate-500 font-medium">جامعة الزهراوي • منظومة المحاضرات</p>
                </div>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold">
                ⚠️ {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">البريد الإلكتروني الجامعي</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@alzahrawi.edu.iq"
                    className="w-full text-sm font-bold text-slate-900 pr-9 p-2.5 rounded-xl bg-white border-2 border-slate-300 focus:border-sky-600 focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">كلمة المرور</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm font-bold text-slate-900 pr-9 p-2.5 rounded-xl bg-white border-2 border-slate-300 focus:border-sky-600 focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              {/* Quick Fill Pills for Demo */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-600 font-bold block mb-1.5">حسابات تجريبية سريعة:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'سوبر أدمن', email: 'admin@alzahrawi.edu.iq' },
                    { label: 'عميد الطب', email: 'dean.med@alzahrawi.edu.iq' },
                    { label: 'رئيس قسم الجراحة', email: 'head.surgery@alzahrawi.edu.iq' },
                    { label: 'تدريسي (د. حيدر)', email: 'haider.k@alzahrawi.edu.iq' },
                    { label: 'طالب (أحمد)', email: 'ahmed.badri@student.alzahrawi.edu.iq' },
                  ].map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleQuickFill(acc.email)}
                      className="px-2.5 py-1 bg-white hover:bg-cyan-50 text-slate-800 hover:text-cyan-900 border border-slate-300 hover:border-cyan-400 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl text-xs font-black transition-all cursor-pointer shadow-md shadow-sky-600/30 disabled:opacity-50"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-200" />
                  <span>{isSubmitting ? 'جاري التحقق...' : 'دخول المنظومة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Password Change Modal */}
      {currentUser.id && currentUser.mustChangePassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#02091b]/80 backdrop-blur-md">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border-2 border-amber-500 space-y-4 text-slate-900">
            <div className="flex items-center gap-3 pb-3 border-b border-amber-100 text-amber-800">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">تغيير كلمة المرور</h3>
                <p className="text-xs text-slate-500 font-medium">مطلوب تعيين كلمة مرور جديدة للمتابعة.</p>
              </div>
            </div>

            {passChangeError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl">
                {passChangeError}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">كلمة المرور الحالية</label>
                <input
                  type="password"
                  required
                  value={curPass}
                  onChange={(e) => setCurPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm font-bold text-slate-900 p-2.5 rounded-xl bg-white border-2 border-slate-300 focus:border-amber-600 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm font-bold text-slate-900 p-2.5 rounded-xl bg-white border-2 border-slate-300 focus:border-amber-600 focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">تأكيد كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm font-bold text-slate-900 p-2.5 rounded-xl bg-white border-2 border-slate-300 focus:border-amber-600 focus:outline-none shadow-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                >
                  خروج
                </button>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isChangingPass ? 'جاري الحفظ...' : 'حفظ ومتابعة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
