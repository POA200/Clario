"use client";

import Link from "next/link";
import { Plus, Search, Users } from "lucide-react";
import { useState } from "react";

import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { Input } from "@/components/ui/input";
import { DASHBOARD_TEAMS } from "@/data/dashboard";

export function DashboardScreen() {
  const [query, setQuery] = useState("");
  const filteredTeams = DASHBOARD_TEAMS.filter((team) =>
    team.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="min-h-dvh bg-background">
      <DesktopSidebar />

      <main className="min-h-dvh ml-20 px-3 py-3 md:ml-[148px] md:px-0 md:py-[45px] md:pr-[30px]">
        <section className="min-h-[calc(100dvh-24px)] rounded-[20px] bg-dashboard-surface px-4 py-5 md:min-h-[calc(100dvh-90px)] md:rounded-[28px] md:px-[30px] md:py-[38px] lg:px-[30px]">
          <header className="flex items-center justify-between">
            <h1 className="text-[20px] font-semibold tracking-tight text-foreground md:text-[38px]">
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
                className="h-12 rounded-full border-2 border-foreground bg-background px-5 pr-11 text-sm text-foreground placeholder:text-muted-foreground md:h-[76px] md:px-7 md:pr-14 md:text-[24px]"
              />
              <Search
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-foreground md:right-7"
                size={16}
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
            {filteredTeams.map((team) => (
              <Link
                key={team.name}
                href={`/teams/${team.slug}`}
                className="flex items-center gap-3 rounded-2xl p-1 transition-colors hover:bg-background/50 focus-visible:outline-2 focus-visible:outline-primary md:gap-5"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${team.tone} text-primary md:h-[74px] md:w-[74px]`}
                >
                  <Users className="size-4 md:size-12" strokeWidth={1.8} />
                </span>
                <span className="text-md font-semibold tracking-tight text-foreground md:text-xl">
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
