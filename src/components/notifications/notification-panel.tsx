"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import type { Notification } from "@/lib/api/types";
import { useLocale } from "@/lib/i18n";

export function NotificationPanel() {
  const { api } = useAuth();
  const router = useRouter();
  const { tr } = useLocale();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await api.notifications.list();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch {
      // silently ignore — non-critical
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleClick(n: Notification) {
    setOpen(false);
    if (!n.read) {
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await api.notifications.markRead(n.id);
      } catch {
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: false } : x)));
        setUnreadCount((c) => c + 1);
      }
    }
    if (n.link) router.push(n.link);
  }

  async function handleMarkAllRead() {
    setNotifications((prev) => prev.map((x) => ({ ...x, read: true })));
    setUnreadCount(0);
    try {
      await api.notifications.markAllRead();
    } catch {
      load(); // revert by reloading
    }
  }

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    const prev = notifications;
    setNotifications((list) => list.filter((x) => x.id !== id));
    const deleted = prev.find((x) => x.id === id);
    if (deleted && !deleted.read) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.notifications.delete(id);
    } catch {
      setNotifications(prev);
      if (deleted && !deleted.read) setUnreadCount((c) => c + 1);
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        className="relative p-2 text-gray-400 hover:text-gray-600 transition border border-gray-100 rounded-full"
        aria-label={tr("notificationsLabel")}
        onClick={() => setOpen((v) => !v)}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-800">{tr("notificationsLabel")}</span>
            {unreadCount > 0 && (
              <button
                onClick={() => void handleMarkAllRead()}
                className="text-xs text-blue-500 hover:text-blue-700 transition"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-sm text-center text-gray-400">No notifications</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => void handleClick(n)}
                  className={`group flex items-start gap-2 px-4 py-3 cursor-pointer hover:bg-gray-50 transition ${n.read ? "bg-white" : "bg-blue-50"}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 leading-snug">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => void handleDelete(e, n.id)}
                    className="opacity-0 group-hover:opacity-100 mt-0.5 p-1 text-gray-300 hover:text-red-400 transition shrink-0"
                    aria-label="Delete notification"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
