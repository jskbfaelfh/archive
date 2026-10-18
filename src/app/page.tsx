'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import StructureManager from '@/components/hierarchy/StructureManager';
import UserManager from '@/components/users/UserManager';
import LectureManager from '@/components/lectures/LectureManager';
import { useApp } from '@/context/AppContext';

export default function Home() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {activeTab === 'structure' && <StructureManager />}
        {activeTab === 'users' && <UserManager />}
        {activeTab === 'lectures' && <LectureManager />}
      </main>

      <footer className="py-4 border-t border-slate-200 text-center text-xs text-slate-400">
        جامعة الزهراوي - منظومة أرشفة المحاضرات الأكاديمية © 2026
      </footer>
    </div>
  );
}
