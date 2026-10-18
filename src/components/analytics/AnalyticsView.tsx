'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Users,
  Building2,
  TrendingUp,
  Download,
  Eye,
  ShieldAlert,
  Clock,
  Sparkles,
  GraduationCap,
} from 'lucide-react';

interface StatsData {
  collegesCount: number;
  departmentsCount: number;
  usersCount: number;
  doctorsCount: number;
  studentsCount: number;
  lecturesCount: number;
  topDownloadedLectures: Array<{
    id: string;
    title: string;
    subjectName: string;
    doctorName: string;
    downloadsCount: number;
    viewsCount: number;
  }>;
  recentAuditLogs: Array<{
    id: string;
    userName: string;
    userRole: string;
    action: string;
    target: string;
    details: string;
    createdAt: string;
  }>;
}

export default function AnalyticsView() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-bold text-slate-500">جاري تحميل بيانات وإحصائيات المنظومة...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
        <p className="text-sm font-bold text-slate-700">لا توجد صلاحية لعرض لوحة الإحصائيات.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">المحاضرات المودعة</span>
            <FileText className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.lecturesCount}</div>
          <span className="text-[10px] text-slate-400 font-medium">ملفات أكاديمية مسجلة</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">الهيئة التدريسية</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.doctorsCount}</div>
          <span className="text-[10px] text-slate-400 font-medium">أساتذة ومدرسون</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">الطلبة النشطون</span>
            <GraduationCap className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.studentsCount}</div>
          <span className="text-[10px] text-slate-400 font-medium">موزعون على الشُعب</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold text-slate-600">الكليات والأقسام</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats.collegesCount} / {stats.departmentsCount}
          </div>
          <span className="text-[10px] text-slate-400 font-medium">بنية هرمية موحدة</span>
        </div>
      </div>

      {/* 2-Columns: Top Downloads & Recent Audit Logs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Most Downloaded Lectures */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-600" />
              <h3 className="font-bold text-sm text-slate-900">المحاضرات الأكثر تحميلاً وإقبالاً</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">إحصائيات فورية</span>
          </div>

          <div className="space-y-2">
            {stats.topDownloadedLectures.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">لا توجد عمليات تحميل بعد.</p>
            ) : (
              stats.topDownloadedLectures.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl flex items-center justify-between text-xs transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-[11px]">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900 block">{item.title}</span>
                      <span className="text-[10px] text-slate-500">
                        {item.subjectName} • {item.doctorName}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 font-mono text-[11px]">
                    <span className="flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                      <Download className="w-3 h-3" />
                      {item.downloadsCount}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Eye className="w-3 h-3" />
                      {item.viewsCount}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Audit Log */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <h3 className="font-bold text-sm text-slate-900">سجل الرقابة والعمليات المباشر (Audit Log)</h3>
            </div>
            <span className="text-[11px] font-bold text-slate-400">تتبع الخادم</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {stats.recentAuditLogs.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">لا توجد سجلات مسجلة.</p>
            ) : (
              stats.recentAuditLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{log.userName || 'مستخدم النظام'}</span>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleTimeString('ar-IQ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span className="font-semibold text-sky-800">{log.action}: {log.target}</span>
                    <span className="text-[10px] bg-slate-200/80 px-1.5 py-0.2 rounded font-bold text-slate-700">
                      {log.userRole || 'دور'}
                    </span>
                  </div>
                  {log.details && (
                    <p className="text-[10px] text-slate-500 font-normal leading-relaxed">{log.details}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
