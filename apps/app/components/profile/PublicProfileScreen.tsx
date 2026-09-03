"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  MessageSquare,
  Pencil,
  Send,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import type { PublicUserProfile } from "@/services/user-service";

type PublicProfileScreenProps = {
  profile: PublicUserProfile;
  currentUserId?: string;
};

function formatMemberSince(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

export function PublicProfileScreen({
  profile,
  currentUserId,
}: PublicProfileScreenProps) {
  const router = useRouter();
  const isSelf = currentUserId === profile.id;

  const initial = (profile.username ?? profile.name ?? "?")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-md px-5 py-6 md:py-10 space-y-5">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
            >
              <ArrowLeft className="size-6" strokeWidth={2.2} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              User Profile
            </h1>
          </div>

          {isSelf && (
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <Pencil className="size-3.5" />
              <span>Edit</span>
            </Link>
          )}
        </header>

        {/* Hero Card */}
        <div className="rounded-[28px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6 text-center space-y-4 shadow-xs">
          {/* Avatar */}
          <div className="relative mx-auto size-24">
            {profile.image ? (
              <img
                src={profile.image}
                alt={profile.name ?? profile.username ?? "User avatar"}
                className="size-24 rounded-full object-cover border-4 border-background shadow-md"
              />
            ) : (
              <div className="flex size-24 items-center justify-center rounded-full border-4 border-background bg-primary/15 text-3xl font-bold text-primary shadow-md">
                {initial}
              </div>
            )}
          </div>

          {/* Name & Username */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              {profile.name || "Teammate"}
            </h2>
            {profile.username && (
              <p className="inline-flex items-center rounded-full bg-[#2F1AC4]/10 dark:bg-primary/20 px-3 py-0.5 text-xs font-semibold text-[#2F1AC4] dark:text-primary">
                @{profile.username}
              </p>
            )}
          </div>

          {/* Bio / Tagline */}
          <p className="text-xs text-muted-foreground max-w-xs mx-auto">
            Active collaborator on Clario workspaces.
          </p>
        </div>

        {/* Stats & Actions Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-[22px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-4 text-center space-y-1">
            <div className="mx-auto flex size-8 items-center justify-center rounded-xl bg-[#2F1AC4]/15 text-[#2F1AC4] dark:bg-primary/20 dark:text-primary">
              <Users className="size-4" />
            </div>
            <p className="text-lg font-bold text-foreground">
              {profile.stats.teamsCount}
            </p>
            <p className="text-[11px] font-medium text-muted-foreground">
              Teams
            </p>
          </div>

          {!isSelf ? (
            <Link
              href={`/dm/${profile.id}`}
              className="group flex flex-col items-center justify-center rounded-[22px] border border-primary/40 bg-primary text-primary-foreground p-4 text-center space-y-1 transition-transform hover:scale-[1.02] shadow-sm"
            >
              <div className="flex size-8 items-center justify-center rounded-xl bg-white/20 text-white">
                <Send className="size-4" />
              </div>
              <p className="text-sm font-bold">Direct Message</p>
              <p className="text-[10px] font-medium opacity-90">1-on-1 Chat</p>
            </Link>
          ) : (
            <Link
              href="/profile"
              className="group flex flex-col items-center justify-center rounded-[22px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-4 text-center space-y-1 transition-transform hover:scale-[1.02]"
            >
              <div className="flex size-8 items-center justify-center rounded-xl bg-[#2F1AC4]/15 text-[#2F1AC4] dark:bg-primary/20 dark:text-primary">
                <Pencil className="size-4" />
              </div>
              <p className="text-sm font-bold text-foreground">Edit Profile</p>
              <p className="text-[10px] font-medium text-muted-foreground">
                Settings
              </p>
            </Link>
          )}
        </div>

        {/* Overview Details Card */}
        <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-5 space-y-3.5">
          <h3 className="text-sm font-bold text-foreground">Account Details</h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="size-4" />
                <span>Member Since</span>
              </div>
              <span className="font-semibold text-foreground">
                {formatMemberSince(profile.createdAt)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>Account Status</span>
              </div>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Verified Member
              </span>
            </div>
          </div>
        </div>

        {/* Teams List Card (Private: only visible to the user) */}
        {isSelf && (
          <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-foreground">
                Your Workspaces & Teams
              </h3>
              <span className="text-xs text-muted-foreground">
                {profile.teams.length} total
              </span>
            </div>

            <div className="divide-y divide-border/60">
              {profile.teams.map((t) => (
                <Link
                  key={t.id}
                  href={`/teams/${t.id}`}
                  className="flex items-center justify-between py-2.5 transition-opacity hover:opacity-80"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {t.avatar ? (
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="size-8 rounded-xl object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="truncate text-xs font-semibold text-foreground">
                      {t.name}
                    </span>
                  </div>

                  <span className="shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                    {t.role === "OWNER"
                      ? "Owner"
                      : t.role === "ADMIN"
                        ? "Admin"
                        : "Member"}
                  </span>
                </Link>
              ))}

              {profile.teams.length === 0 && (
                <p className="py-3 text-center text-xs text-muted-foreground">
                  Not a member of any teams yet.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
