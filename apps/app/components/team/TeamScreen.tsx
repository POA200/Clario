"use client";

import Link from "next/link";
import {
  ChevronDown,
  Hash,
  Megaphone,
  Palette,
  Plus,
  Search,
  Users,
  Code,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { Input } from "@/components/ui/input";
import { rememberTeam } from "@/services/team-service";
import type { Team, TeamChannel } from "@/types/team";

const CHANNEL_ICONS: Record<TeamChannel["icon"], typeof Hash> = {
  messages: Hash,
  announcement: Megaphone,
  design: Palette,
  development: Code,
};

type TeamScreenProps = { team: Team };

export function TeamScreen({ team }: TeamScreenProps) {
  const [query, setQuery] = useState("");
  const filteredChannels = useMemo(
    () =>
      team.channels.filter((channel) =>
        channel.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, team.channels],
  );

  useEffect(() => {
    rememberTeam(team.id);
  }, [team.id]);

  return (
    <div className="min-h-dvh bg-background">
      <DesktopSidebar />
      <main className="min-h-dvh ml-20 px-3 py-3 md:ml-[128px] md:px-0 md:py-[30px] md:pr-6">
        <section className="min-h-[calc(100dvh-24px)] rounded-[20px] bg-dashboard-surface px-4 py-5 md:min-h-[calc(100dvh-60px)] md:rounded-[24px] md:px-6 md:py-7 lg:px-6">
          <header className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-lg font-semibold text-primary md:h-10 md:w-10">
              {team.name.charAt(0)}
            </div>
            <h1 className="min-w-0 truncate text-[20px] font-semibold tracking-tight text-foreground md:text-[30px]">
              {team.name}
            </h1>
            <ChevronDown
              className="shrink-0 text-muted-foreground md:size-6"
              aria-hidden="true"
            />
          </header>
          <div className="mt-4 flex items-center gap-3 md:mt-4 md:max-w-[460px] md:gap-4">
            <div className="relative min-w-0 flex-1">
              <Input
                aria-label="Search channels"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search"
                className="h-12 rounded-full border-2 border-foreground bg-background px-5 pr-11 text-sm text-foreground placeholder:text-muted-foreground md:h-[58px] md:px-6 md:pr-12 md:text-lg"
              />
              <Search
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-foreground md:right-6"
                size={16}
              />
            </div>
            <button
              type="button"
              aria-label="Create channel"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary md:h-[58px] md:w-[58px]"
            >
              <Plus className="size-6 md:size-7" strokeWidth={1.5} />
            </button>
          </div>
          <div className="mt-5 flex items-center gap-3 text-foreground md:gap-4">
            <Users
              className="size-5 md:size-5"
              strokeWidth={1.8}
              aria-hidden="true"
            />
            <span className="text-base md:text-lg">
              Members: {team.memberCount}
            </span>
          </div>
          <section
            className="mt-10 md:mt-12"
            aria-labelledby="channels-heading"
          >
            <h2
              id="channels-heading"
              className="text-[24px] font-semibold tracking-tight text-foreground md:text-[24px]"
            >
              Channels
            </h2>
            <div className="mt-6 space-y-4 md:mt-7 md:space-y-5">
              {filteredChannels.map((channel) => {
                const ChannelIcon = CHANNEL_ICONS[channel.icon];
                return (
                  <Link
                    key={channel.id}
                    href={`/teams/${team.id}/channels/${channel.id}`}
                    className="flex min-w-0 items-center gap-4 rounded-lg py-1 text-foreground transition-colors hover:bg-background/50 focus-visible:outline-2 focus-visible:outline-primary md:gap-5"
                  >
                    <ChannelIcon
                      className="size-5 shrink-0 text-muted-foreground md:size-5"
                      strokeWidth={1.8}
                      aria-hidden="true"
                    />
                    <span
                      className="h-7 w-px shrink-0 bg-border"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 truncate text-lg md:text-xl">
                      {channel.name}
                    </span>
                    {channel.unread && (
                      <span
                        className="ml-auto size-3 shrink-0 rounded-full bg-foreground"
                        aria-label="Unread messages"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
            <div className="mt-5 border-t border-border pt-5 md:mt-7 md:pt-6">
              <button
                type="button"
                className="flex items-center gap-3 text-lg text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary md:text-xl"
              >
                <Plus className="size-6" strokeWidth={1.5} aria-hidden="true" />
                <span>Add Channel</span>
              </button>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
}
