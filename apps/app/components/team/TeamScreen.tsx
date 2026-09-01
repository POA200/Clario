"use client";

import Link from "next/link";
import {
  Check,
  Copy,
  Hash,
  Megaphone,
  Palette,
  Plus,
  Search,
  Users,
  Code,
  X,
  UserPlus,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { Input } from "@/components/ui/input";
import { rememberTeam } from "@/services/team-navigation";
import type { Team, TeamChannel } from "@/types/team";

const CHANNEL_ICONS: Record<TeamChannel["icon"], typeof Hash> = {
  messages: Hash,
  announcement: Megaphone,
  design: Palette,
  development: Code,
};

const CHANNEL_ICON_OPTIONS: {
  value: TeamChannel["icon"];
  label: string;
}[] = [
  { value: "messages", label: "Messages" },
  { value: "announcement", label: "Announcement" },
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
];

type TeamScreenProps = {
  team: Team;
};

export function TeamScreen({ team }: TeamScreenProps) {
  const [query, setQuery] = useState("");
  const [channels, setChannels] = useState(team.channels);

  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelIcon, setChannelIcon] =
    useState<TeamChannel["icon"]>("messages");

  const [isCreating, setIsCreating] = useState(false);
  const [channelError, setChannelError] = useState("");

  const [showInvite, setShowInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredChannels = useMemo(
    () =>
      channels.filter((channel) =>
        channel.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [query, channels],
  );

  useEffect(() => {
    rememberTeam(team.id);
  }, [team.id]);

  useEffect(() => {
    setChannels(team.channels);
  }, [team.channels]);

  useEffect(() => {
    let isMounted = true;

    async function refreshChannels() {
      try {
        const response = await fetch(`/api/teams/${team.id}/channels`);
        if (!response.ok) return;
        const data = await response.json();
        if (isMounted && Array.isArray(data?.channels)) {
          setChannels(data.channels);
        }
      } catch {
        // Silently ignore
      }
    }

    refreshChannels();

    const interval = window.setInterval(refreshChannels, 5000);
    const handleFocus = () => {
      refreshChannels();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [team.id]);

  function openCreateChannel() {
    setChannelName("");
    setChannelIcon("messages");
    setChannelError("");
    setShowCreateChannel(true);
  }

  function closeCreateChannel() {
    if (isCreating) return;

    setShowCreateChannel(false);
    setChannelName("");
    setChannelIcon("messages");
    setChannelError("");
  }

  async function handleCreateChannel(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = channelName.trim();

    if (!name) {
      setChannelError("Enter a channel name.");
      return;
    }

    if (name.length > 50) {
      setChannelError("Channel name must be 50 characters or less.");
      return;
    }

    setIsCreating(true);
    setChannelError("");

    try {
      const response = await fetch(`/api/teams/${team.id}/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          icon: channelIcon,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setChannelError(
          typeof data.error === "string"
            ? data.error
            : "Unable to create channel.",
        );
        return;
      }

      if (!data.channel) {
        setChannelError(
          "Channel was created, but no channel data was returned.",
        );
        return;
      }

      const newChannel: TeamChannel = {
        id: data.channel.id,
        name: data.channel.name,
        icon: data.channel.icon,
        unread: false,
      };

      setChannels((currentChannels) => [...currentChannels, newChannel]);

      setShowCreateChannel(false);
      setChannelName("");
      setChannelIcon("messages");
      setChannelError("");
    } catch (error) {
      console.error("Create channel error:", error);
      setChannelError("Something went wrong. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  function openInvite() {
    setInviteLink("");
    setInviteError("");
    setInviteSuccess("");
    setShowInvite(true);
  }

  function closeInvite() {
    setShowInvite(false);
    setInviteLink("");
    setInviteError("");
    setInviteSuccess("");
  }

  async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setInviteError("");
    setInviteSuccess("");
    setInviteLink("");

    setIsInviting(true);

    try {
      const response = await fetch(`/api/teams/${team.id}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (!response.ok) {
        setInviteError(
          typeof data?.error === "string"
            ? data.error
            : "Unable to create invite.",
        );
        return;
      }

      if (!data.invite?.url) {
        setInviteError(
          "The invite was created, but no invite link was returned.",
        );
        return;
      }

      setInviteLink(data.invite.url);
      setInviteSuccess(
        "Invite created successfully. Share the link with them to join the team.",
      );
    } catch (error) {
      console.error("Create invite error:", error);
      setInviteError("Something went wrong. Please try again.");
    } finally {
      setIsInviting(false);
    }
  }

  async function copyInviteLink() {
    if (!inviteLink) return;

    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      setInviteError("Unable to copy the invite link.");
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      {" "}
      <DesktopSidebar />
      <main className="min-h-dvh ml-20 px-3 py-3 md:ml-[128px] md:px-0 md:py-[30px] md:pr-6">
        <section className="min-h-[calc(100dvh-24px)] rounded-[20px] bg-dashboard-surface px-4 py-5 md:min-h-[calc(100dvh-60px)] md:rounded-[24px] md:px-6 md:py-7 lg:px-6">
          {/* Team header */}
          <header className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-lg font-semibold text-primary md:h-10 md:w-10">
              {team.name.charAt(0)}
            </div>

            <h1 className="min-w-0 truncate text-[20px] font-semibold tracking-tight text-foreground md:text-[30px]">
              {team.name}
            </h1>
          </header>

          {/* Search + create button */}
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
              onClick={openCreateChannel}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary md:h-[58px] md:w-[58px]"
            >
              <Plus className="size-6 md:size-7" strokeWidth={1.5} />
            </button>
          </div>

          {/* Members + Invite */}
          <div className="mt-5 flex flex-wrap items-center gap-3 text-foreground md:gap-4">
            <Link
              href={`/teams/${team.id}/members`}
              className="flex items-center gap-3 rounded-full px-2 py-1 text-foreground transition-colors hover:bg-background/60 focus-visible:outline-2 focus-visible:outline-primary md:gap-4"
            >
              <Users className="size-5" strokeWidth={1.8} aria-hidden="true" />

              <span className="text-base md:text-lg">
                Members: {team.memberCount}
              </span>
            </Link>

            <button
              type="button"
              onClick={openInvite}
              className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
            >
              <UserPlus className="size-4" strokeWidth={1.8} />
              <span>Invite</span>
            </button>
          </div>

          {/* Channels */}
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
                    className={`flex min-w-0 items-center gap-4 rounded-lg py-1 transition-colors hover:bg-background/50 focus-visible:outline-2 focus-visible:outline-primary md:gap-5 ${
                      channel.unread
                        ? "text-foreground font-semibold"
                        : "text-foreground/50 font-normal"
                    }`}
                  >
                    <ChannelIcon
                      className={`size-5 shrink-0 md:size-5 ${
                        channel.unread
                          ? "text-foreground"
                          : "text-foreground/80"
                      }`}
                      strokeWidth={channel.unread ? 2.2 : 1.8}
                      aria-hidden="true"
                    />

                    <span
                      className={`h-7 w-px shrink-0 ${
                        channel.unread ? "bg-border" : "bg-border/40"
                      }`}
                      aria-hidden="true"
                    />

                    <span
                      className={`min-w-0 truncate text-lg md:text-xl ${
                        channel.unread
                          ? "text-foreground font-semibold"
                          : "text-foreground/50 font-normal"
                      }`}
                    >
                      {channel.name}
                    </span>

                    {channel.unread && (
                      <span
                        className="ml-auto size-2.5 shrink-0 rounded-full bg-foreground"
                        aria-label="Unread messages"
                      />
                    )}
                  </Link>
                );
              })}

              {filteredChannels.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  {query
                    ? "No channels match your search."
                    : "No channels yet."}
                </div>
              )}
            </div>

            {/* Add Channel */}
            <div className="mt-5 border-t border-border pt-5 md:mt-7 md:pt-6">
              <button
                type="button"
                onClick={openCreateChannel}
                className="flex items-center gap-3 text-lg text-foreground transition-colors hover:text-primary focus-visible:outline-2 focus-visible:outline-primary md:text-xl"
              >
                <Plus className="size-6" strokeWidth={1.5} aria-hidden="true" />

                <span>Add Channel</span>
              </button>
            </div>
          </section>
        </section>
      </main>
      {/* Create Channel Modal */}
      {showCreateChannel && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeCreateChannel();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-channel-title"
            className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="create-channel-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  Create Channel
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Add a new channel to {team.name}.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={closeCreateChannel}
                disabled={isCreating}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateChannel} className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="channel-name"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Channel name
                </label>

                <Input
                  id="channel-name"
                  value={channelName}
                  onChange={(event) => setChannelName(event.target.value)}
                  placeholder="e.g. general"
                  maxLength={50}
                  autoFocus
                  disabled={isCreating}
                  className="h-12 rounded-xl border-border bg-background px-4"
                />

                <div className="mt-1 flex justify-end">
                  <span className="text-xs text-muted-foreground">
                    {channelName.length}/50
                  </span>
                </div>
              </div>

              <div>
                <span className="mb-2 block text-sm font-medium text-foreground">
                  Channel icon
                </span>

                <div className="grid grid-cols-2 gap-2">
                  {CHANNEL_ICON_OPTIONS.map((option) => {
                    const Icon = CHANNEL_ICONS[option.value];
                    const selected = channelIcon === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={isCreating}
                        onClick={() => setChannelIcon(option.value)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-colors ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <Icon className="size-5 shrink-0" strokeWidth={1.8} />

                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {channelError && (
                <p
                  role="alert"
                  className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {channelError}
                </p>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeCreateChannel}
                  disabled={isCreating}
                  className="h-11 rounded-xl px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isCreating || !channelName.trim()}
                  className="flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Channel"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Invite Modal */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeInvite();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-title"
            className="w-full max-w-md rounded-2xl bg-background p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="invite-title"
                  className="text-xl font-semibold tracking-tight text-foreground"
                >
                  Invite to {team.name}
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Invite someone to join your team.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={closeInvite}
                disabled={isInviting}
                className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="mt-6 space-y-5">
              {inviteError && (
                <p
                  role="alert"
                  className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
                >
                  {inviteError}
                </p>
              )}

              {inviteSuccess && (
                <div className="rounded-xl bg-primary/10 px-4 py-3">
                  <div className="flex items-start gap-2">
                    <Check
                      className="mt-0.5 size-4 shrink-0 text-primary"
                      strokeWidth={2}
                    />

                    <p className="text-sm text-foreground">{inviteSuccess}</p>
                  </div>
                </div>
              )}

              {inviteLink && (
                <div>
                  <label
                    htmlFor="invite-link"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Invite link
                  </label>

                  <div className="flex gap-2">
                    <Input
                      id="invite-link"
                      value={inviteLink}
                      readOnly
                      className="h-11 min-w-0 rounded-xl border-border bg-muted px-3 text-sm"
                    />

                    <button
                      type="button"
                      onClick={copyInviteLink}
                      className="flex h-11 shrink-0 items-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      {copied ? (
                        <>
                          <Check className="size-4" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="size-4" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeInvite}
                  disabled={isInviting}
                  className="h-11 rounded-xl px-5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={isInviting}
                  className="flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isInviting ? "Creating..." : "Create Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
