"use client";

import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { useEffect, useRef, useState } from "react";
import { DASHBOARD_NAVIGATION } from "@/data/navigation";
import { getTeamNavigationId } from "@/services/team-client";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { BottomNav } from "@/components/layout/BottomNav";

function LogoMark() {
  return (
    <span
      className="relative block h-8 w-8 overflow-hidden md:h-10 md:w-10"
      aria-label="Clario"
    >
      <Image
        src="/Clario_logomark.svg"
        alt="Clario"
        width={178}
        height={58}
        priority
        className="absolute left-0 top-0 h-8 w-auto max-w-none md:h-10"
      />
    </span>
  );
}

export function DesktopSidebar() {
  const { mobileNav } = useNavigation();
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const lastKnownUnreadCountRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    function fetchUnread() {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (!isMounted) return;
          if (typeof data?.unreadCount === "number") {
            // If new notification arrived and permissions granted, trigger web notification
            if (
              lastKnownUnreadCountRef.current !== null &&
              data.unreadCount > lastKnownUnreadCountRef.current &&
              typeof window !== "undefined" &&
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              const latest = data.notifications?.[0];
              if (latest) {
                try {
                  const n = new Notification(latest.title || "Clario", {
                    body: latest.message || "You have a new notification.",
                    icon: "/icons/icon-192x192.png",
                  });
                  n.onclick = () => {
                    window.focus();
                    if (latest.link) router.push(latest.link);
                  };
                } catch {
                  if (
                    "serviceWorker" in navigator &&
                    navigator.serviceWorker.ready
                  ) {
                    navigator.serviceWorker.ready.then((reg) => {
                      reg.showNotification(latest.title || "Clario", {
                        body: latest.message || "You have a new notification.",
                        icon: "/icons/icon-192x192.png",
                        data: { url: latest.link || "/notifications" },
                      });
                    });
                  }
                }
              }
            }

            lastKnownUnreadCountRef.current = data.unreadCount;
            setUnreadCount(data.unreadCount);
          }
        })
        .catch(() => {
          // Silently ignore
        });
    }

    fetchUnread();
    const interval = setInterval(fetchUnread, 10_000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [router]);

  function handleNavigation(
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) {
    if (href === "/teams") {
      const teamId = getTeamNavigationId();
      if (teamId) {
        event.preventDefault();
        router.push(`/teams/${teamId}`);
      }
    }
  }

  const isProfileActive =
    pathname.startsWith("/profile") || pathname.startsWith("/settings");

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex-col items-center py-5 md:flex md:w-[128px] md:py-8 lg:w-[128px] ${
          mobileNav === "sidebar" ? "flex w-20" : "hidden md:flex"
        }`}
      >
        <LogoMark />
        <nav
          className="mt-auto flex flex-col gap-4 md:gap-6"
          aria-label="Primary navigation"
        >
          {DASHBOARD_NAVIGATION.map(({ label, href, icon: Icon }) => {
            const active =
              href === "/teams"
                ? pathname.startsWith("/teams")
                : pathname === href ||
                  (href !== "/" && pathname.startsWith(`${href}/`));

            const isNotification = href === "/notifications";

            return (
              <Link
                key={label}
                href={href}
                aria-label={label}
                onClick={(event) => handleNavigation(event, href)}
                className={`relative flex h-14 w-14 items-center justify-center rounded-[16px] transition-colors focus-visible:outline-2 focus-visible:outline-primary md:h-[72px] md:w-[72px] md:rounded-[18px] ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
              >
                <Icon className="size-6 md:size-8" strokeWidth={2.5} />
                {isNotification && unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-bold text-destructive-foreground">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/profile"
          aria-label="My profile"
          className={`mt-auto flex h-14 w-14 items-center justify-center rounded-[16px] transition-colors focus-visible:outline-2 focus-visible:outline-primary md:h-[72px] md:w-[72px] md:rounded-[18px] ${
            isProfileActive
              ? "bg-primary text-primary-foreground"
              : "bg-primary text-primary-foreground hover:opacity-90"
          }`}
        >
          <UserRound className="size-6 md:size-8" strokeWidth={2.5} />
        </Link>
      </aside>

      {mobileNav === "bottom" && <BottomNav />}
    </>
  );
}
