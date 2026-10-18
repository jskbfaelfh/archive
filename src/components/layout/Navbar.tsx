'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  BookOpen,
  Layers,
  Users,
  FileText,
  RotateCcw,
  Shield,
  TrendingUp,
  LogOut,
  LogIn,
  Lock,
  Mail,
  X,
} from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const {
    currentUser,
    colleges,
    activeTab,
    setActiveTab,
    resetAll,
    login,
    logout,
    isLoginModalOpen,
    setIsLoginModalOpen,
  } = useApp();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSuper = currentUser.role === 'super_admin';
  const isCollegeAdmin = currentUser.role === 'college_admin';
  const isDeptAdmin = currentUser.role === 'department_admin';
  const canSeeUsersTab = isSuper || isCollegeAdmin || isDeptAdmin;

  const userCol = colleges.find((c) => c.id === currentUser.collegeId);
  const userDept = userCol?.departments.find((d) => d.id === currentUser.departmentId);

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

  const handleQuickFill = (email: string) => {
    setLoginEmail(email);
    setLoginPassword('123456');
    setLoginError(null);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 min-h-16 py-2 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight">جامعة الزهراوي</h1>
            <p className="text-[10px] sm:text-[11px] text-slate-500 hidden sm:block">منظومة أرشفة المحاضرات الأكاديمية</p>
          </div>
        </div>

        {/* 3 Main Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('structure')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'structure'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>الهيكلية والشُعب</span>
          </button>

          {canSeeUsersTab && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>المستخدمين والصلاحيات</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('lectures')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              activeTab === 'lectures'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>المحاضرات</span>
          </button>

          {canSeeUsersTab && (
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>الإحصائيات والرقابة</span>
            </button>
          )}
        </nav>

        {/* User Info & Actions */}
        <div className="flex items-center gap-2">
          {currentUser.id && <NotificationBell />}

          {currentUser.id ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-xs font-black text-slate-900 shadow-2xs">
                <Shield className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <div className="text-right">
                  <div className="leading-tight text-slate-900">{currentUser.name}</div>
                  <div className="text-[10px] text-slate-500 font-normal">
                    {isSuper && 'سوبر أدمن (كافة الصلاحيات)'}
                    {isCollegeAdmin && `عميد (${userCol?.name || 'كلية'})`}
                    {isDeptAdmin && `رئيس قسم (${userDept?.name || 'قسم'})`}
                    {currentUser.role === 'doctor' && `تدريسي (${userDept?.name || 'قسم'})`}
                    {currentUser.role === 'student' && `طالب (مرحلة ${currentUser.stage || 1}${currentUser.sectionName ? ` • ${currentUser.sectionName}` : ''})`}
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                title="تسجيل الخروج"
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer font-bold shadow-2xs"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">خروج</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5 text-sky-400" />
              <span>تسجيل الدخول</span>
            </button>
          )}

          <button
            onClick={() => {
              if (confirm('تصفير كافة البيانات والعودة للبيانات الأولية المعتمدة؟')) {
                resetAll();
              }
            }}
            title="إعادة ضبط وتصفير"
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* LOGIN MODAL */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-slate-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-900 text-white rounded-xl">
                  <Lock className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900">تسجيل الدخول للنظام الأكاديمي</h3>
                  <p className="text-xs text-slate-500">أدخل البريد الإلكتروني وكلمة المرور المشفرة</p>
                </div>
              </div>
              <button
                onClick={() => setIsLoginModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
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
                  <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="user@alzahrawi.edu.iq"
                    className="w-full text-sm font-bold text-slate-900 pr-9 p-2.5 rounded-xl bg-white border-2 border-slate-300 focus:border-sky-600 focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-900 mb-1">كلمة المرور</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm font-bold text-slate-900 pr-9 p-2.5 rounded-xl bg-white border-2 border-slate-300 focus:border-sky-600 focus:outline-none shadow-xs"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">كلمة المرور الافتراضية لكافة الحسابات هي: 123456</span>
              </div>

              {/* Quick Fill Pills for Demo */}
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] text-slate-600 font-bold block mb-1.5">تعبئة سريعة للحسابات النموذجية:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: 'سوبر أدمن', email: 'admin@alzahrawi.edu.iq' },
                    { label: 'عميد الطب', email: 'dean.med@alzahrawi.edu.iq' },
                    { label: 'رئيس قسم الجراحة', email: 'head.surgery@alzahrawi.edu.iq' },
                    { label: 'تدريسي (د. كمال)', email: 'kamal.surgery@alzahrawi.edu.iq' },
                    { label: 'طالب (كرار)', email: 'karrar.student@alzahrawi.edu.iq' },
                  ].map((acc) => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleQuickFill(acc.email)}
                      className="px-2 py-1 bg-white hover:bg-sky-50 text-slate-800 hover:text-sky-900 border border-slate-300 rounded-lg text-[10px] font-bold cursor-pointer transition-all"
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
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
                >
                  <LogIn className="w-3.5 h-3.5 text-sky-400" />
                  <span>{isSubmitting ? 'جاري التحقق...' : 'دخول إلى المنظومة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
