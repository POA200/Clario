"use client";

import Link from "next/link";
import {
  Camera,
  Check,
  Code,
  Copy,
  Hash,
  Megaphone,
  Palette,
  Pencil,
  Plus,
  Search,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { rememberTeam } from "@/services/team-navigation";
import type { Team, TeamChannel } from "@/types/team";

const CHANNEL_ICONS: Record<string, typeof Hash> = {
  messages: Hash,
  announcement: Megaphone,
  design: Palette,
  development: Code,
};

const CHANNEL_ICON_OPTIONS = [
  { value: "messages", label: "Messages" },
  { value: "announcement", label: "Announcement" },
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
];

const POPULAR_EMOJIS = [
  "🚀",
  "🔥",
  "💡",
  "🎯",
  "💬",
  "⚡",
  "🌟",
  "📢",
  "🛠️",
  "📊",
  "🎨",
  "🔒",
  "💻",
  "🎉",
  "📈",
  "❤️",
];

type TeamScreenProps = {
  team: Team;
};

export function TeamScreen({ team }: TeamScreenProps) {
  const { mobileNav } = useNavigation();
  const [teamState, setTeamState] = useState<Team>(team);
  const [query, setQuery] = useState("");
  const [channels, setChannels] = useState(team.channels);

  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [channelName, setChannelName] = useState("");
  const [channelIcon, setChannelIcon] = useState<string>("messages");
  const [customEmojiInput, setCustomEmojiInput] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [channelError, setChannelError] = useState("");

  const [showInvite, setShowInvite] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Team Edit States
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [editTeamName, setEditTeamName] = useState(team.name);
  const [editTeamAvatar, setEditTeamAvatar] = useState<string | null>(
    team.avatar ?? null,
  );
  const [teamAvatarError, setTeamAvatarError] = useState("");
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);
  const teamImageInputRef = useRef<HTMLInputElement>(null);

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

  function handleTeamAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setTeamAvatarError("");
    const MAX_SIZE = 100 * 1024; // 100KB

    if (file.size > MAX_SIZE) {
      setTeamAvatarError("Image size must be 100KB or smaller.");
      if (teamImageInputRef.current) teamImageInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setEditTeamAvatar(result);
    };
    reader.onerror = () => {
      setTeamAvatarError("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  }

  async function handleSaveTeamProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!editTeamName.trim()) {
      setTeamAvatarError("Team name cannot be empty.");
      return;
    }

    setIsUpdatingTeam(true);
    setTeamAvatarError("");

    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editTeamName.trim(),
          avatar: editTeamAvatar,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setTeamAvatarError(data?.error || "Failed to update team profile.");
        setIsUpdatingTeam(false);
        return;
      }

      if (data?.team) {
        setTeamState((prev) => ({
          ...prev,
          name: data.team.name,
          avatar: data.team.avatar,
        }));
      }

      setShowEditTeamModal(false);
    } catch {
      setTeamAvatarError("Network error updating team profile.");
    } finally {
      setIsUpdatingTeam(false);
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
          {/* Team header */}
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0">
              {teamState.avatar ? (
                <img
                  src={teamState.avatar}
                  alt={teamState.name}
                  className="size-11 shrink-0 rounded-xl object-cover border border-border md:size-12 shadow-sm"
                />
              ) : (
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary md:size-12 border border-primary/20">
                  {teamState.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="min-w-0">
                <h1 className="truncate text-[20px] font-semibold tracking-tight text-foreground md:text-[28px]">
                  {teamState.name}
                </h1>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setEditTeamName(teamState.name);
                setEditTeamAvatar(teamState.avatar ?? null);
                setTeamAvatarError("");
                setShowEditTeamModal(true);
              }}
              aria-label="Team settings"
              className="flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              <Camera className="size-4 text-muted-foreground" />
              <span className="hidden sm:inline">Edit Team</span>
            </button>
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
                const IconComponent = CHANNEL_ICONS[channel.icon];

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
                    {channel.image ? (
                      <img
                        src={channel.image}
                        alt=""
                        className="size-5 shrink-0 rounded-md object-cover md:size-6"
                      />
                    ) : IconComponent ? (
                      <IconComponent
                        className={`size-5 shrink-0 md:size-5 ${
                          channel.unread
                            ? "text-foreground"
                            : "text-foreground/80"
                        }`}
                        strokeWidth={channel.unread ? 2.2 : 1.8}
                        aria-hidden="true"
                      />
                    ) : (
                      <span className="text-lg shrink-0 leading-none md:text-xl">
                        {channel.icon || "💬"}
                      </span>
                    )}

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

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="block text-sm font-medium text-foreground">
                    Channel icon or emoji
                  </span>
                  {channelIcon && (
                    <span className="text-xs font-medium text-primary">
                      Selected:{" "}
                      {CHANNEL_ICONS[channelIcon] ? (
                        <span className="capitalize">{channelIcon}</span>
                      ) : (
                        <span className="text-sm">{channelIcon}</span>
                      )}
                    </span>
                  )}
                </div>

                {/* Default System Icons */}
                <div className="grid grid-cols-2 gap-2">
                  {CHANNEL_ICON_OPTIONS.map((option) => {
                    const Icon = CHANNEL_ICONS[option.value];
                    const selected = channelIcon === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        disabled={isCreating}
                        onClick={() => {
                          setChannelIcon(option.value);
                          setCustomEmojiInput("");
                        }}
                        className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-left text-sm transition-colors ${
                          selected
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        <Icon className="size-4 shrink-0" strokeWidth={1.8} />
                        <span className="text-xs">{option.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Emoji Pickers */}
                <div className="pt-1">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Or select an emoji
                  </span>
                  <div className="flex flex-wrap gap-1.5 rounded-xl border border-border/60 bg-background/50 p-2">
                    {POPULAR_EMOJIS.map((emoji) => {
                      const selected = channelIcon === emoji;
                      return (
                        <button
                          key={emoji}
                          type="button"
                          disabled={isCreating}
                          onClick={() => {
                            setChannelIcon(emoji);
                            setCustomEmojiInput(emoji);
                          }}
                          className={`flex size-9 items-center justify-center rounded-lg text-lg transition-transform hover:scale-110 ${
                            selected
                              ? "bg-primary/20 ring-2 ring-primary"
                              : "hover:bg-muted"
                          }`}
                        >
                          {emoji}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Emoji Input */}
                <div className="pt-1">
                  <Input
                    value={customEmojiInput}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCustomEmojiInput(val);
                      if (val.trim()) {
                        setChannelIcon(val.trim());
                      }
                    }}
                    placeholder="Type or paste any custom emoji..."
                    maxLength={10}
                    disabled={isCreating}
                    className="h-9 rounded-lg text-xs"
                  />
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

      {/* Edit Team Settings Modal */}
      {showEditTeamModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-200"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isUpdatingTeam) {
              setShowEditTeamModal(false);
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary">
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/10">
                  <Camera className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Team Settings
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Update team profile image and name
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isUpdatingTeam}
                onClick={() => setShowEditTeamModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTeamProfile} className="space-y-4">
              {/* Team Avatar Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Team Profile Photo (Max 100KB)
                </label>
                <div className="flex items-center gap-4">
                  {editTeamAvatar ? (
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-2xl border border-border shadow-sm">
                      <img
                        src={editTeamAvatar}
                        alt="Team profile preview"
                        className="size-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/50 text-muted-foreground">
                      <Camera className="size-6 opacity-60" />
                    </div>
                  )}

                  <div className="flex-1 space-y-1.5">
                    <input
                      ref={teamImageInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleTeamAvatarUpload}
                      className="hidden"
                      id="team-avatar-upload"
                      disabled={isUpdatingTeam}
                    />
                    <div className="flex gap-2">
                      <label
                        htmlFor="team-avatar-upload"
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors"
                      >
                        <Upload className="size-3.5" />
                        <span>Upload Photo</span>
                      </label>
                      {editTeamAvatar && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditTeamAvatar(null);
                            if (teamImageInputRef.current) {
                              teamImageInputRef.current.value = "";
                            }
                          }}
                          className="rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Select a photo from your device (PNG, JPG, WebP ≤100KB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Team Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="edit-team-name"
                  className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Team Name
                </label>
                <Input
                  id="edit-team-name"
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  placeholder="Team Name"
                  maxLength={50}
                  disabled={isUpdatingTeam}
                  className="h-10 rounded-xl"
                />
              </div>

              {teamAvatarError && (
                <div
                  role="alert"
                  className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive"
                >
                  {teamAvatarError}
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={isUpdatingTeam}
                  onClick={() => setShowEditTeamModal(false)}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingTeam || !editTeamName.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  <Check className="size-4" />
                  <span>{isUpdatingTeam ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
