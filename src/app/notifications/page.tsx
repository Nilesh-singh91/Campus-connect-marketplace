"use client";

import React, { useState, useEffect } from "react";
import { timeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  MessageSquare,
  Repeat,
  Package,
  ShieldAlert,
  Info,
  ArrowRight,
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const json = await res.json();
        setNotifications(json.data.notifications || []);
        setUnreadCount(json.data.unreadCount || 0);
      }
    } catch (e) {
      console.error("Notifications fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error("Mark read error:", e);
    }
  };

  const iconMap: Record<string, React.ReactNode> = {
    MESSAGE: <MessageSquare className="w-5 h-5 text-indigo-600" />,
    EXCHANGE_REQUEST: <Repeat className="w-5 h-5 text-emerald-600" />,
    LISTING_UPDATE: <Package className="w-5 h-5 text-amber-600" />,
    REPORT_STATUS: <ShieldAlert className="w-5 h-5 text-rose-600" />,
    SYSTEM: <Info className="w-5 h-5 text-indigo-600" />,
  };

  if (isLoading) {
    return <div className="p-12 text-center text-sm text-zinc-500">Loading notifications...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">Campus Notifications</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Updates on trades, new student messages, and listing status
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5 text-xs font-semibold">
            <CheckCheck className="w-3.5 h-3.5" /> Mark All as Read
          </Button>
        )}
      </div>

      {notifications.length > 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200 divide-y divide-zinc-100 overflow-hidden shadow-xs">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                !item.isRead ? "bg-indigo-50/40" : "hover:bg-zinc-50"
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex items-center justify-center shrink-0">
                {iconMap[item.type] || <Bell className="w-5 h-5 text-indigo-600" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-semibold text-zinc-900 text-sm">{item.title}</h4>
                  <span className="text-[11px] text-zinc-400 shrink-0">{timeAgo(item.createdAt)}</span>
                </div>
                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{item.content}</p>

                {item.link && (
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 mt-2"
                  >
                    View Details <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-16 text-center bg-white rounded-3xl border border-zinc-200 space-y-3 max-w-md mx-auto">
          <Bell className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="font-semibold text-zinc-900 text-lg">No notifications yet</h3>
          <p className="text-sm text-zinc-500">
            You&apos;re all caught up! New messages, barter responses, and updates will be alerted here.
          </p>
        </div>
      )}
    </div>
  );
}
