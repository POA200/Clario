"use client";

import Link from "next/link";
import { Plus, Search, Users, X } from "lucide-react";
import { useState } from "react";

import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Team } from "@/types/team";

type DashboardScreenProps = {
  teams: Team[];
};

export function DashboardScreen({ teams: initialTeams }: DashboardScreenProps) {
  const { mobileNav } = useNavigation();
  const [teams, setTeams] = useState(initialTeams);
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(query.toLowerCase()),
  );

  function openCreateDialog() {
    setTeamName("");
    setError("");
    setIsCreateOpen(true);
  }

  function closeCreateDialog() {
    if (isCreating) return;

    setIsCreateOpen(false);
    setTeamName("");
    setError("");
  }

  async function createTeam(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = teamName.trim();

    if (!name) {
      setError("Enter a team name.");
      return;
    }

    if (name.length > 80) {
      setError("Team name must be 80 characters or less.");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unable to create team.");
        return;
      }

      const newTeam: Team = {
        id: data.team.id,
        name: data.team.name,
        memberCount: 1,
        members: [],
        channels: [],
      };

      setTeams((currentTeams) => [...currentTeams, newTeam]);
      setIsCreateOpen(false);
      setTeamName("");

      window.location.href = `/teams/${data.team.id}`;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <DesktopSidebar />

      <main
        className={cn(
          "min-h-dvh px-3 py-3 md:ml-[128px] md:px-0 md:py-[30px] md:pr-6",
          mobileNav === "sidebar" ? "ml-20" : "ml-0 pb-24 md:pb-[30px]",
        )}
      >
        <section className="min-h-[calc(100dvh-24px)] rounded-[20px] bg-dashboard-surface px-4 py-5 md:min-h-[calc(100dvh-60px)] md:rounded-[24px] md:px-6 md:py-7 lg:px-6">
          <header className="flex items-center justify-between">
            <h1 className="text-[20px] font-semibold tracking-tight text-foreground md:text-[30px]">
              Teams
            </h1>
          </header>

          <div className="mt-4 flex items-center gap-3 md:mt-4 md:max-w-[460px] md:gap-4">
            <div className="relative min-w-0 flex-1">
              <Input
                aria-label="Search teams"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Teams"
                className="h-12 rounded-full border-2 border-foreground bg-background px-5 pr-11 text-sm text-foreground placeholder:text-muted-foreground md:h-[58px] md:px-6 md:pr-12 md:text-lg"
              />

              <Search
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-foreground md:right-6"
                size={16}
              />
            </div>

            <button
              type="button"
              aria-label="Create team"
              onClick={openCreateDialog}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary md:h-[58px] md:w-[58px]"
            >
              <Plus className="size-6 md:size-7" strokeWidth={1.5} />
            </button>
          </div>

          <div className="mt-8 space-y-5 md:ml-1 md:mt-9 md:space-y-5">
            {filteredTeams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="flex items-center gap-3 rounded-2xl p-1 transition-colors hover:bg-background/50 focus-visible:outline-2 focus-visible:outline-primary md:gap-4"
              >
                {team.avatar ? (
                  <img
                    src={team.avatar}
                    alt={team.name}
                    className="size-12 rounded-full object-cover border border-border md:size-[58px] shadow-xs shrink-0"
                  />
                ) : (
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary md:h-[58px] md:w-[58px]">
                    <Users className="size-5 md:size-8" strokeWidth={1.8} />
                  </span>
                )}

                <span className="text-md font-semibold tracking-tight text-foreground md:text-lg truncate">
                  {team.name}
                </span>
              </Link>
            ))}
          </div>

          {teams.length === 0 && (
            <div className="mt-16 flex flex-col items-center text-center">
              <Users
                className="size-10 text-muted-foreground"
                strokeWidth={1.5}
              />

              <h2 className="mt-4 text-lg font-semibold text-foreground">
                No teams yet
              </h2>

              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Create your first team to start collaborating with your
                teammates.
              </p>
            </div>
          )}

          {teams.length > 0 && filteredTeams.length === 0 && (
            <p className="mt-12 text-center text-sm text-muted-foreground">
              No teams found.
            </p>
          )}
        </section>
      </main>

      {isCreateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 px-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCreateDialog();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-team-title"
            className="w-full max-w-md rounded-[24px] border border-border bg-background p-6 shadow-2xl md:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="create-team-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  Create Team
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Create a workspace for your team.
                </p>
              </div>

              <button
                type="button"
                onClick={closeCreateDialog}
                disabled={isCreating}
                aria-label="Close"
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={createTeam} className="mt-6">
              <label
                htmlFor="team-name"
                className="text-sm font-medium text-foreground"
              >
                Team name
              </label>

              <Input
                id="team-name"
                autoFocus
                value={teamName}
                onChange={(event) => {
                  setTeamName(event.target.value);
                  if (error) setError("");
                }}
                placeholder="e.g. Design Team"
                maxLength={80}
                disabled={isCreating}
                className="mt-2 h-12 rounded-xl border-2 border-foreground bg-background px-4 text-base"
              />

              {error && (
                <p role="alert" className="mt-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCreateDialog}
                  disabled={isCreating}
                  className="rounded-full px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating || !teamName.trim()}
                  className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Team"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
