"use client";

import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { DASHBOARD_NAVIGATION } from "@/data/navigation";
import { getTeamNavigationId } from "@/services/team-client";

function LogoMark() {
  return (
    <span
      className="relative block h-8 w-8 overflow-hidden md:h-10 md:w-10"
      aria-label="Clario"
    >
      <Image
        src="/Clario_logomark.svg"
        alt=""
        width={178}
        height={58}
        priority
        className="absolute left-0 top-0 h-8 w-auto max-w-none md:h-10"
      />
    </span>
  );
}

export function DesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
      // If no teamId, let the link navigate to /teams (server-side fallback)
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-20 flex-col items-center py-5 md:w-[128px] md:py-8 lg:w-[128px]">
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

          return (
            <Link
              key={label}
              href={href}
              aria-label={label}
              onClick={(event) => handleNavigation(event, href)}
              className={`flex h-14 w-14 items-center justify-center rounded-[16px] transition-colors focus-visible:outline-2 focus-visible:outline-primary md:h-[72px] md:w-[72px] md:rounded-[18px] ${active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
            >
              <Icon className="size-6 md:size-8" strokeWidth={2.5} />
            </Link>
          );
        })}
      </nav>
      <Link
        href="/settings"
        aria-label="Profile settings"
        className="mt-auto flex h-14 w-14 items-center justify-center rounded-[16px] bg-primary text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary md:h-[72px] md:w-[72px] md:rounded-[18px]"
      >
        <UserRound className="size-6 md:size-8" strokeWidth={2.5} />
      </Link>
    </aside>
  );
}
