"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  CheckCircle2,
  Clock,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { useState } from "react";

import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import type { NotificationItem } from "@/services/notification-service";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) {
    return "Yesterday";
  }
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function getNotificationIcon(type: string) {
  switch (type) {
    case "TASK_CREATED":
      return (
        <CheckCircle2 className="size-5 text-emerald-500" strokeWidth={2} />
      );
    case "MEMBER_JOINED":
    case "TEAM_INVITE":
      return <Users className="size-5 text-primary" strokeWidth={2} />;
    case "MESSAGE":
      return <MessageSquare className="size-5 text-blue-500" strokeWidth={2} />;
    default:
      return <Bell className="size-5 text-primary" strokeWidth={2} />;
  }
}

type NotificationsScreenProps = {
  initialNotifications: NotificationItem[];
  initialUnreadCount: number;
};

export function NotificationsScreen({
  initialNotifications,
  initialUnreadCount,
}: NotificationsScreenProps) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const router = useRouter();

  async function handleMarkAsRead(notification: NotificationItem) {
    if (!notification.read) {
      // Optimistic update
      setNotifications((current) =>
        current.map((n) =>
          n.id === notification.id ? { ...n, read: true } : n,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      fetch(`/api/notifications/${notification.id}`, {
        method: "PATCH",
      }).catch((err) => {
        console.error("Failed to mark notification read:", err);
      });
    }

    if (notification.link) {
      router.push(notification.link);
    }
  }

  async function handleMarkAllAsRead() {
    if (unreadCount === 0 || isMarkingAll) return;

    setIsMarkingAll(true);
    // Optimistic update
    setNotifications((current) => current.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark-all-read" }),
      });
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setIsMarkingAll(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <DesktopSidebar />

      <main className="min-h-dvh ml-20 px-3 py-3 md:ml-[128px] md:px-0 md:py-[30px] md:pr-6">
        <section className="min-h-[calc(100dvh-24px)] rounded-[20px] bg-dashboard-surface px-4 py-5 md:min-h-[calc(100dvh-60px)] md:rounded-[24px] md:px-6 md:py-7 lg:px-6">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-[20px] font-semibold tracking-tight text-foreground md:text-[30px]">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-2 text-xs font-semibold text-primary-foreground">
                  {unreadCount}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                disabled={isMarkingAll}
                className="flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary disabled:opacity-50 md:text-sm"
              >
                <Check className="size-4" strokeWidth={2} />
                <span>Mark all as read</span>
              </button>
            )}
          </header>

          {/* Notifications list */}
          <div className="mt-6 space-y-3 md:mt-8">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                role="button"
                tabIndex={0}
                onClick={() => handleMarkAsRead(notification)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMarkAsRead(notification);
                  }
                }}
                className={`group relative flex cursor-pointer items-start gap-4 rounded-2xl p-4 transition-all hover:scale-[1.005] ${
                  notification.read
                    ? "border border-border/70 bg-background/60"
                    : "border-2 border-primary/30 bg-background shadow-sm"
                }`}
              >
                {/* Icon wrapper */}
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="min-w-0 truncate text-sm font-semibold text-foreground md:text-base">
                      {notification.title}
                    </h2>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeTime(notification.createdAt)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                    {notification.message}
                  </p>
                </div>

                {/* Unread indicator dot */}
                {!notification.read && (
                  <span
                    className="mt-1.5 size-2.5 shrink-0 rounded-full bg-primary"
                    aria-label="Unread"
                  />
                )}
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="mt-16 flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                  <Bell
                    className="size-8 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  No notifications
                </h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  You're all caught up! You'll receive notifications when
                  there's activity in your teams.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
