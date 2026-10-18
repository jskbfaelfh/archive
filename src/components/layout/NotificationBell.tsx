'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, BookOpen, Clock } from 'lucide-react';
import { useApp } from '@/context/AppContext';

interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const { currentUser, setActiveTab } = useApp();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {
      // silently handle network errors
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotifications();
    }, 0);
    const interval = setInterval(fetchNotifications, 25000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [currentUser.id]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const markOneAsRead = async (id: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="التنبيهات"
        className="relative p-2 text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border-2 border-slate-300 rounded-xl transition-all cursor-pointer shadow-xs"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black rounded-full h-4.5 min-w-4.5 px-1 flex items-center justify-center border-2 border-white animate-pulse">
            {unreadCount > 9 ? '+9' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border-2 border-slate-300 p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-900">مركز الإشعارات والتنبيهات</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-black bg-rose-100 text-rose-700 px-1.5 py-0.5 rounded-full">
                  {unreadCount} جديد
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-sky-700 hover:text-sky-900 font-bold flex items-center gap-1 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>تحديد الكل كمقروء</span>
              </button>
            )}
          </div>

          <div className="space-y-1.5 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-bold text-slate-600">لا توجد تنبيهات حالياً</p>
                <p className="text-[10px] text-slate-400 mt-0.5">ستصلك إشعارات فورية عند رفع محاضرات جديدة</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (!n.isRead) markOneAsRead(n.id);
                    if (n.link) {
                      setActiveTab('lectures');
                      setIsOpen(false);
                    }
                  }}
                  className={`p-2.5 rounded-xl text-right cursor-pointer transition-colors border ${
                    n.isRead
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      : 'bg-sky-50/70 border-sky-200 text-slate-900 font-bold hover:bg-sky-100/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <div className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                        n.isRead ? 'bg-slate-200 text-slate-600' : 'bg-sky-600 text-white'
                      }`}>
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-black leading-snug">{n.title}</div>
                        <div className="text-[11px] font-normal text-slate-600 mt-0.5 leading-relaxed">
                          {n.message}
                        </div>
                      </div>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0 mt-1" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 mt-1.5 pr-8">
                    <Clock className="w-2.5 h-2.5" />
                    <span>{new Date(n.createdAt).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
