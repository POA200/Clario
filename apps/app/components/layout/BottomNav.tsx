"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  CheckSquare,
  Home,
  MessageSquare,
  UserRound,
  Users,
} from "lucide-react";

import { getTeamNavigationId } from "@/services/team-client";

const BOTTOM_NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Teams", href: "/teams", icon: Users },
  { label: "Chats", href: "/chats", icon: MessageSquare },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Alerts", href: "/notifications", icon: Bell },
  { label: "Profile", href: "/profile", icon: UserRound },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    function fetchUnread() {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          if (typeof data?.unreadCount === "number") {
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => {});
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 10_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#D5CAFE]/60 bg-[#EAE6FE]/95 dark:border-border dark:bg-dashboard-surface/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)] md:hidden shadow-lg">
      <div className="mx-auto grid h-15 max-w-md grid-cols-6 items-center px-1">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isNotification = item.href === "/notifications";
          const isProfile = item.href === "/profile";
          const active =
            item.href === "/teams"
              ? pathname.startsWith("/teams")
              : item.href === "/chats"
                ? pathname.startsWith("/chats") || pathname.startsWith("/dm")
                : item.href === "/dashboard"
                  ? pathname === "/dashboard" || pathname === "/"
                  : isProfile
                    ? pathname.startsWith("/profile") ||
                      pathname.startsWith("/settings")
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              onClick={(event) => {
                if (item.href === "/teams") {
                  const teamId = getTeamNavigationId();
                  if (teamId) {
                    event.preventDefault();
                    router.push(`/teams/${teamId}`);
                  }
                }
              }}
              className={`relative flex min-w-0 flex-col items-center justify-center gap-0.5 py-1 rounded-xl transition-all ${
                active
                  ? "text-[#2F1AC4] dark:text-primary font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div
                className={`relative flex items-center justify-center rounded-full p-1 transition-colors ${
                  active
                    ? "bg-[#2F1AC4]/15 dark:bg-primary/20 text-[#2F1AC4] dark:text-primary"
                    : ""
                }`}
              >
                <Icon
                  className="size-5 shrink-0"
                  strokeWidth={active ? 2.5 : 2}
                />
                {isNotification && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-bold text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="truncate text-[10px] font-medium leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
