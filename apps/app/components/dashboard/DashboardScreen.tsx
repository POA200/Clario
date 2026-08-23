"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  Check,
  Home,
  Plus,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";

const teams = [
  { name: "Alpha Team", tone: "bg-primary/15" },
  { name: "Project Team", tone: "bg-secondary/30" },
];

const navigation = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Teams", href: "/teams", icon: Users },
  { label: "Tasks", href: "/tasks", icon: Check },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

function LogoMark() {
  return (
    <span
      className="relative block h-8 w-8 overflow-hidden md:h-12 md:w-12"
      aria-label="Clario"
    >
      <Image
        src="/clario_logo.svg"
        alt=""
        width={178}
        height={58}
        priority
        className="absolute left-0 top-0 h-8 w-auto max-w-none md:h-12"
      />
    </span>
  );
}

export function DashboardScreen() {
  const [query, setQuery] = useState("");
  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-20 flex-col items-center py-5 md:w-[150px] md:py-9 lg:w-[148px]">
        <LogoMark />
        <nav
          className="mt-auto flex flex-col gap-4 md:gap-9"
          aria-label="Primary navigation"
        >
          {navigation.map(({ label, href, icon: Icon }, index) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className={`flex h-14 w-14 items-center justify-center rounded-[16px] transition-colors focus-visible:outline-2 focus-visible:outline-primary md:h-[90px] md:w-[90px] md:rounded-[22px] ${index === 0 ? "bg-primary text-primary-foreground" : label === "Notifications" ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"}`}
            >
              <Icon className="size-6 md:size-[38px]" strokeWidth={2.5} />
            </Link>
          ))}
        </nav>
        <Link
          href="/settings"
          aria-label="Profile settings"
          className="mt-auto flex h-14 w-14 items-center justify-center rounded-[16px] bg-primary text-primary-foreground focus-visible:outline-2 focus-visible:outline-primary md:h-[90px] md:w-[90px] md:rounded-[22px]"
        >
          <UserRound className="size-6 md:size-[38px]" strokeWidth={2.5} />
        </Link>
      </aside>

      <main className="min-h-dvh ml-20 px-3 py-3 md:ml-[148px] md:px-0 md:py-[45px] md:pr-[30px]">
        <section className="min-h-[calc(100dvh-24px)] rounded-[20px] bg-dashboard-surface px-4 py-5 md:min-h-[calc(100dvh-90px)] md:rounded-[28px] md:px-[30px] md:py-[38px] lg:px-[30px]">
          <header className="flex items-center justify-between">
            <h1 className="text-[28px] font-semibold tracking-tight text-foreground md:text-[38px]">
              Teams
            </h1>
          </header>

          <div className="mt-4 flex items-center gap-3 md:mt-4 md:max-w-[530px] md:gap-5">
            <div className="relative min-w-0 flex-1">
              <Input
                aria-label="Search teams"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Teams"
                className="h-12 rounded-full border-2 border-foreground bg-background px-5 pr-11 text-lg text-foreground placeholder:text-muted-foreground md:h-[76px] md:px-7 md:pr-14 md:text-[29px]"
              />
              <Search
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-foreground md:right-7"
                size={22}
              />
            </div>
            <button
              type="button"
              aria-label="Create team"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary md:h-[76px] md:w-[76px]"
            >
              <Plus className="size-6 md:size-[34px]" strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-8 space-y-5 md:ml-2 md:mt-12 md:space-y-7">
            {filteredTeams.map((team, index) => (
              <Link
                key={team.name}
                href={`/teams/${index === 0 ? "alpha" : "project"}`}
                className="flex items-center gap-3 rounded-2xl p-1 transition-colors hover:bg-background/50 focus-visible:outline-2 focus-visible:outline-primary md:gap-5"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${team.tone} text-primary md:h-[74px] md:w-[74px]`}
                >
                  <Users className="size-6 md:size-[35px]" strokeWidth={1.8} />
                </span>
                <span className="text-xl font-semibold tracking-tight text-foreground md:text-[31px]">
                  {team.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
