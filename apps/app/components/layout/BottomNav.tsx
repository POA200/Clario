"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { MOBILE_NAVIGATION } from "@/data/navigation";
import { getTeamNavigationId } from "@/services/team-client";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {MOBILE_NAVIGATION.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => {
                if (item.href === "/teams") {
                  const teamId = getTeamNavigationId();
                  if (teamId) {
                    event.preventDefault();
                    router.push(`/teams/${teamId}`);
                  }
                }
              }}
              className={`flex min-w-16 flex-col items-center justify-center gap-1 text-xs transition-colors ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
