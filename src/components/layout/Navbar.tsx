'use client';

import React, { useState } from 'react';
import { useApp, MainTab } from '@/context/AppContext';
import {
  BookOpen,
  Layers,
  Users,
  FileText,
  RotateCcw,
  ChevronDown,
  Shield,
  User,
  TrendingUp,
} from 'lucide-react';

export default function Navbar() {
  const { currentUser, users, colleges, switchUser, activeTab, setActiveTab, resetAll } = useApp();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'doctor' | 'student'>('all');

  const isSuper = currentUser.role === 'super_admin';
  const isCollegeAdmin = currentUser.role === 'college_admin';
  const isDeptAdmin = currentUser.role === 'department_admin';
  const canSeeUsersTab = isSuper || isCollegeAdmin || isDeptAdmin;

  const userCol = colleges.find((c) => c.id === currentUser.collegeId);
  const userDept = userCol?.departments.find((d) => d.id === currentUser.departmentId);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-slate-900 leading-tight">جامعة الزهراوي</h1>
            <p className="text-[11px] text-slate-500">منظومة أرشفة المحاضرات الأكاديمية</p>
          </div>
        </div>

        {/* 3 Main Tabs */}
        <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
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

        {/* User Switcher & Reset */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-black text-slate-900 cursor-pointer shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-sky-700" />
              <div className="text-right">
                <div className="leading-tight">{currentUser.name}</div>
                <div className="text-[10px] text-slate-500 font-normal">
                  {isSuper && 'سوبر أدمن'}
                  {isCollegeAdmin && `عميد (${userCol?.name || 'كلية'})`}
                  {isDeptAdmin && `رئيس قسم (${userDept?.name || 'قسم'})`}
                  {currentUser.role === 'doctor' && `تدريسي (${userDept?.name || 'قسم'})`}
                  {currentUser.role === 'student' && `طالب (مرحلة ${currentUser.stage || 1}${currentUser.sectionName ? ` • ${currentUser.sectionName}` : ''})`}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
            </button>

            {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border-2 border-slate-300 p-2.5 z-50">
                <div className="flex items-center justify-between pb-1 px-1">
                  <span className="text-[11px] text-slate-900 font-black">تبديل الحساب لمعاينة الصلاحيات:</span>
                  <span className="text-[10px] text-slate-500 font-bold">{users.length} حساب مسجل</span>
                </div>

                {/* Filter pills */}
                <div className="flex gap-1 p-1 bg-slate-100 rounded-xl my-1.5 text-[10px] font-bold">
                  {(
                    [
                      { id: 'all', label: `الكل (${users.length})` },
                      { id: 'admin', label: 'الإدارة' },
                      { id: 'doctor', label: 'التدريسيين (8)' },
                      { id: 'student', label: 'الطلاب (10)' },
                    ] as const
                  ).map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setRoleFilter(f.id)}
                      className={`flex-1 py-1 rounded-lg transition-all cursor-pointer ${
                        roleFilter === f.id ? 'bg-white text-slate-900 shadow-2xs font-black' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {users
                    .filter((u) => {
                      if (roleFilter === 'all') return true;
                      if (roleFilter === 'admin')
                        return u.role === 'super_admin' || u.role === 'college_admin' || u.role === 'department_admin';
                      if (roleFilter === 'doctor') return u.role === 'doctor';
                      if (roleFilter === 'student') return u.role === 'student';
                      return true;
                    })
                    .map((u) => {
                      const uCol = colleges.find((c) => c.id === u.collegeId);
                      const uDept = uCol?.departments.find((d) => d.id === u.departmentId);

                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            if ((u.role === 'doctor' || u.role === 'student') && activeTab === 'users') {
                              setActiveTab('lectures');
                            }
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer ${
                            u.id === currentUser.id
                              ? 'bg-sky-100 text-sky-950 font-black border border-sky-300'
                              : 'hover:bg-slate-100 text-slate-900'
                          }`}
                        >
                          <div className="truncate">
                            <span className="block truncate">{u.name}</span>
                            <span className="text-[10px] text-slate-500 block font-normal">
                              {uCol?.name ? `${uCol.name}${uDept ? ` • ${uDept.name}` : ''}` : 'إدارة عامة'}
                              {u.stage ? ` (م${u.stage}${u.sectionName ? ` - ${u.sectionName}` : ''})` : ''}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded font-bold shrink-0 mr-2 border border-slate-200">
                            {u.role === 'super_admin'
                              ? 'سوبر أدمن'
                              : u.role === 'college_admin'
                              ? 'عميد'
                              : u.role === 'department_admin'
                              ? 'رئيس قسم'
                              : u.role === 'doctor'
                              ? 'تدريسي'
                              : 'طالب'}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (confirm('تصفير كافة البيانات والعودة للبداية؟')) {
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
    </header>
  );
}
