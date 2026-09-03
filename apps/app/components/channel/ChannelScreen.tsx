"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Info,
  MessageCircle,
  MoreHorizontal,
  MoreVertical,
  Pencil,
  Reply,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import type {
  ChannelMessage,
  MessageReactionSummary,
  MessageType,
} from "@/types/team";
import type { ChannelDetail } from "@/services/team-service";

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"] as const;

function isWithinOneHour(isoDate: string): boolean {
  const ageMs = Date.now() - new Date(isoDate).getTime();
  return ageMs <= 60 * 60 * 1000;
}

function renderFormattedContent(text: string) {
  const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith("@")) {
      const username = part.substring(1);
      return (
        <Link
          key={index}
          href={`/profile/${username}`}
          className="font-semibold text-primary underline underline-offset-2 hover:opacity-80"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

const MESSAGE_TYPE_OPTIONS: { value: MessageType; label: string }[] = [
  { value: "NORMAL", label: "Normal" },
  { value: "ANNOUNCEMENT", label: "Announcement" },
  { value: "TASK", label: "Task" },
];

const MESSAGE_STYLES: Record<MessageType, { bg: string; border: string }> = {
  NORMAL: {
    bg: "bg-[#E8E7FF] dark:bg-card/90",
    border: "border-l-[#7B6CF6] dark:border-l-primary",
  },
  ANNOUNCEMENT: {
    bg: "bg-[#FFE4E4] dark:bg-destructive/15",
    border: "border-l-[#E53E3E] dark:border-l-destructive",
  },
  TASK: {
    bg: "bg-[#E4FFEC] dark:bg-emerald-950/40",
    border: "border-l-[#22C55E] dark:border-l-emerald-500",
  },
};

// Deterministic colors per sender
const SENDER_COLORS = [
  "text-[#16A34A] dark:text-emerald-400",
  "text-[#E53E3E] dark:text-rose-400",
  "text-primary dark:text-secondary",
  "text-[#D97706] dark:text-amber-400",
  "text-[#7C3AED] dark:text-purple-400",
  "text-[#0891B2] dark:text-cyan-400",
];

function getSenderColor(senderId: string, senderIds: string[]): string {
  const index = senderIds.indexOf(senderId);
  return SENDER_COLORS[index % SENDER_COLORS.length] ?? "text-primary";
}

function formatTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const displayHour = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHour}:${displayMinutes}${ampm}`;
}

function formatDeadline(isoString: string): string {
  const date = new Date(isoString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

type ChannelScreenProps = {
  channel: ChannelDetail;
  currentUser: {
    id: string;
    name?: string;
    image?: string;
  };
};

export function ChannelScreen({ channel, currentUser }: ChannelScreenProps) {
  const router = useRouter();
  const [channelState, setChannelState] = useState<ChannelDetail>(channel);
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [content, setContent] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("NORMAL");
  const [deadline, setDeadline] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showTypeMenu, setShowTypeMenu] = useState(false);

  // Reply & Mention States
  const [replyingTo, setReplyingTo] = useState<ChannelMessage | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showDeleteChannelModal, setShowDeleteChannelModal] = useState(false);
  const [isDeletingChannel, setIsDeletingChannel] = useState(false);
  const [deleteChannelError, setDeleteChannelError] = useState("");

  // Edit Message States
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete Message States
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);

  // Message Options & Reaction State
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(
    null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const matchingMembers =
    mentionQuery !== null
      ? channel.members.filter((m) => {
          const usernameMatch = m.username
            ?.toLowerCase()
            .includes(mentionQuery);
          const nameMatch = m.name?.toLowerCase().includes(mentionQuery);
          return usernameMatch || nameMatch;
        })
      : [];

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setContent(value);
    const cursor = e.target.selectionStart ?? value.length;
    const textBeforeCursor = value.slice(0, cursor);
    const match = textBeforeCursor.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      setMentionQuery(match[1].toLowerCase());
    } else {
      setMentionQuery(null);
    }
  }

  function handleSelectMention(usernameOrName: string) {
    const cursor = inputRef.current?.selectionStart ?? content.length;
    const textBefore = content.slice(0, cursor);
    const textAfter = content.slice(cursor);
    const newTextBefore = textBefore.replace(
      /@([a-zA-Z0-9_]*)$/,
      `@${usernameOrName} `,
    );
    setContent(newTextBefore + textAfter);
    setMentionQuery(null);
    inputRef.current?.focus();
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const markAsRead = useCallback(async () => {
    try {
      await fetch(`/api/teams/${channel.teamId}/channels/${channel.id}/read`, {
        method: "POST",
      });
    } catch {
      // Silently ignore
    }
  }, [channel.teamId, channel.id]);

  // Fetch messages
  const fetchMessages = useCallback(
    async (search?: string) => {
      try {
        const url = new URL(
          `/api/teams/${channel.teamId}/channels/${channel.id}/messages`,
          window.location.origin,
        );
        if (search) {
          url.searchParams.set("search", search);
        }

        const response = await fetch(url.toString());
        const data = await response.json();

        if (!response.ok) {
          setError(
            typeof data?.error === "string"
              ? data.error
              : "Unable to load messages.",
          );
          return;
        }

        setMessages(data.messages ?? []);
        setError("");
        markAsRead();
      } catch {
        setError("Unable to load messages. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [channel.teamId, channel.id, markAsRead],
  );

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Scroll to bottom when messages change (not in search mode)
  useEffect(() => {
    if (!showSearch) {
      scrollToBottom();
    }
  }, [messages, showSearch, scrollToBottom]);

  // Search with debounce
  useEffect(() => {
    if (!showSearch) return;

    const timer = window.setTimeout(() => {
      fetchMessages(searchQuery || undefined);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [searchQuery, showSearch, fetchMessages]);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        typeMenuRef.current &&
        !typeMenuRef.current.contains(event.target as Node)
      ) {
        setShowTypeMenu(false);
      }
      if (
        optionsMenuRef.current &&
        !optionsMenuRef.current.contains(event.target as Node)
      ) {
        setShowOptionsMenu(false);
      }
      if (
        messageMenuRef.current &&
        !messageMenuRef.current.contains(event.target as Node)
      ) {
        setActiveMenuMessageId(null);
      }
    }

    if (showTypeMenu || showOptionsMenu || activeMenuMessageId) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [showTypeMenu, showOptionsMenu, activeMenuMessageId]);

  // Poll for new messages every 5s
  useEffect(() => {
    if (showSearch) return;

    const interval = window.setInterval(() => {
      fetchMessages();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [showSearch, fetchMessages]);

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setError("");

    try {
      const body: Record<string, unknown> = {
        content: trimmed,
        type: messageType,
      };

      if (replyingTo) {
        body.replyToId = replyingTo.id;
      }

      if (messageType === "TASK" && deadline) {
        body.deadline = deadline;
      }

      const response = await fetch(
        `/api/teams/${channel.teamId}/channels/${channel.id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          typeof data?.error === "string"
            ? data.error
            : "Unable to send message.",
        );
        return;
      }

      if (data.message) {
        setMessages((current) => [...current, data.message]);
      }

      setContent("");
      setDeadline("");
      setMessageType("NORMAL");
      setReplyingTo(null);
      setMentionQuery(null);
      inputRef.current?.focus();
    } catch {
      setError("Unable to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleToggleTask(
    messageId: string,
    currentCompleted?: boolean,
  ) {
    const nextCompleted = !currentCompleted;

    // Optimistically update message state
    setMessages((current) =>
      current.map((m) =>
        m.id === messageId ? { ...m, completed: nextCompleted } : m,
      ),
    );

    try {
      const response = await fetch(
        `/api/teams/${channel.teamId}/tasks/${messageId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: nextCompleted }),
        },
      );

      if (!response.ok) {
        // Rollback on error
        setMessages((current) =>
          current.map((m) =>
            m.id === messageId ? { ...m, completed: currentCompleted } : m,
          ),
        );
      }
    } catch {
      setMessages((current) =>
        current.map((m) =>
          m.id === messageId ? { ...m, completed: currentCompleted } : m,
        ),
      );
    }
  }

  async function handleConfirmDeleteMessage() {
    if (!messageToDelete) return;
    const id = messageToDelete;
    setIsDeletingMessage(true);

    // Optimistic removal
    setMessages((current) => current.filter((m) => m.id !== id));
    setMessageToDelete(null);

    try {
      await fetch(
        `/api/teams/${channel.teamId}/channels/${channel.id}/messages?messageId=${id}`,
        {
          method: "DELETE",
        },
      );
    } catch {
      fetchMessages();
    } finally {
      setIsDeletingMessage(false);
    }
  }

  function handleStartEdit(message: ChannelMessage) {
    setEditingMessageId(message.id);
    setEditingContent(message.content);
    setEditError("");
  }

  function handleCancelEdit() {
    setEditingMessageId(null);
    setEditingContent("");
    setEditError("");
  }

  async function handleSaveEdit(messageId: string) {
    if (!editingContent.trim()) {
      setEditError("Message content cannot be empty.");
      return;
    }

    setIsSavingEdit(true);
    setEditError("");

    const updatedContent = editingContent.trim();
    // Optimistic update
    setMessages((current) =>
      current.map((m) =>
        m.id === messageId
          ? {
              ...m,
              content: updatedContent,
              updatedAt: new Date().toISOString(),
            }
          : m,
      ),
    );

    try {
      const response = await fetch(
        `/api/teams/${channel.teamId}/channels/${channel.id}/messages`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageId,
            content: updatedContent,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        setEditError(data?.error || "Failed to update message.");
        fetchMessages();
        return;
      }

      if (data?.message) {
        setMessages((current) =>
          current.map((m) => (m.id === messageId ? data.message : m)),
        );
      }

      setEditingMessageId(null);
      setEditingContent("");
    } catch {
      setEditError("Network error updating message.");
      fetchMessages();
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleToggleReaction(messageId: string, emoji: string) {
    // Optimistic UI update
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const currentReactions = msg.reactions ?? [];
        const currentForEmoji = currentReactions.find((r) => r.emoji === emoji);
        const userReacted = currentForEmoji?.userIds.includes(currentUser.id);

        let nextReactions: MessageReactionSummary[];
        if (userReacted) {
          nextReactions = currentReactions
            .map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.count - 1,
                    userIds: r.userIds.filter((id) => id !== currentUser.id),
                  }
                : r,
            )
            .filter((r) => r.count > 0);
        } else {
          if (currentForEmoji) {
            nextReactions = currentReactions.map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.count + 1,
                    userIds: [...r.userIds, currentUser.id],
                  }
                : r,
            );
          } else {
            nextReactions = [
              ...currentReactions,
              { emoji, count: 1, userIds: [currentUser.id] },
            ];
          }
        }
        return { ...msg, reactions: nextReactions };
      }),
    );

    try {
      const response = await fetch(
        `/api/teams/${channel.teamId}/channels/${channel.id}/messages/reactions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messageId, emoji }),
        },
      );

      const data = await response.json();
      if (data?.reactions) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId ? { ...msg, reactions: data.reactions } : msg,
          ),
        );
      }
    } catch (err) {
      console.error("Failed to toggle reaction:", err);
    }
  }

  async function handleDeleteChannel() {
    setIsDeletingChannel(true);
    setDeleteChannelError("");

    try {
      const response = await fetch(
        `/api/teams/${channel.teamId}/channels/${channel.id}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setDeleteChannelError(data?.error || "Failed to delete channel.");
        setIsDeletingChannel(false);
        return;
      }

      router.push(`/teams/${channel.teamId}`);
    } catch {
      setDeleteChannelError("Network error deleting channel.");
      setIsDeletingChannel(false);
    }
  }

  function openSearch() {
    setShowSearch(true);
    setSearchQuery("");
  }

  function closeSearch() {
    setShowSearch(false);
    setSearchQuery("");
    fetchMessages();
  }

  // Collect unique sender IDs for color assignment
  const senderIds = [...new Set(messages.map((m) => m.sender.id))];

  // Member avatars for header (max 3)
  const headerMembers = channel.members.slice(0, 3);

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-background">
      {/* Header */}
      {showSearch ? (
        <header className="flex shrink-0 items-center gap-3 border-b border-border bg-background px-4 py-3">
          <div className="relative min-w-0 flex-1">
            <Input
              aria-label="Search messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Messages"
              autoFocus
              className="h-11 rounded-full border-border bg-background px-5 pr-11 text-sm placeholder:text-muted-foreground"
            />
            <Search
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
          </div>

          <button
            type="button"
            aria-label="Close search"
            onClick={closeSearch}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </header>
      ) : (
        <header className="flex shrink-0 items-center gap-3 border-b border-border/40 bg-background px-4 py-3 md:px-6">
          <Link
            href={`/teams/${channel.teamId}`}
            aria-label={`Back to ${channel.teamName}`}
            className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-5" strokeWidth={2} />
          </Link>

          {channelState.image ? (
            <img
              src={channelState.image}
              alt=""
              className="size-7 shrink-0 rounded-lg object-cover border border-border"
            />
          ) : channelState.icon && channelState.icon.length <= 4 ? (
            <span className="text-xl shrink-0 leading-none">
              {channelState.icon}
            </span>
          ) : (
            <MessageCircle
              className="size-5 shrink-0 text-muted-foreground"
              strokeWidth={1.8}
            />
          )}

          <span className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />

          <h1 className="min-w-0 truncate text-lg font-bold text-foreground md:text-xl">
            {channelState.name}
          </h1>

          {/* Stacked member avatars */}
          <div className="ml-1 flex shrink-0 -space-x-2">
            {headerMembers.map((member) => (
              <Link
                key={member.id}
                href={`/profile/${member.id}`}
                aria-label={`View ${member.name}'s profile`}
                className="transition-transform hover:scale-110"
              >
                {member.image ? (
                  <img
                    src={member.image}
                    alt=""
                    className="size-7 rounded-full border-2 border-background object-cover"
                  />
                ) : (
                  <div className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            ))}
          </div>

          <div
            className="relative ml-auto flex items-center gap-1"
            ref={optionsMenuRef}
          >
            <button
              type="button"
              aria-label="Search messages"
              onClick={openSearch}
              className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <Search className="size-5" strokeWidth={2} />
            </button>

            <button
              type="button"
              aria-label="Channel options"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <MoreVertical className="size-5" strokeWidth={2} />
            </button>

            {showOptionsMenu && (
              <div className="absolute right-0 top-full z-40 mt-1 w-52 overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => {
                    setShowOptionsMenu(false);
                    router.push(`/teams/${channel.teamId}/info`);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
                >
                  <Info className="size-4 text-muted-foreground" />
                  <span>Team Info & Tasks</span>
                </button>
                {channel.isAdmin && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowOptionsMenu(false);
                      setShowDeleteChannelModal(true);
                    }}
                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <Trash2 className="size-4" />
                    <span>Delete Channel</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </header>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading messages...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!isLoading && !error && messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2">
            <MessageCircle
              className="size-10 text-muted-foreground"
              strokeWidth={1.2}
            />
            <p className="text-sm text-muted-foreground">
              {showSearch
                ? "No messages match your search."
                : "No messages yet. Start the conversation!"}
            </p>
          </div>
        )}

        {!isLoading && messages.length > 0 && (
          <div className="space-y-4">
            {messages.map((message) => {
              const styles = MESSAGE_STYLES[message.type];
              const senderColor = getSenderColor(message.sender.id, senderIds);
              const isAuthor = currentUser?.id === message.sender.id;
              const isRecent = isWithinOneHour(message.createdAt);
              const canEdit = isAuthor && isRecent;
              const canDelete = (isAuthor && isRecent) || channel.isAdmin;
              const initial = (
                message.sender.username ??
                message.sender.name ??
                "?"
              )
                .charAt(0)
                .toUpperCase();

              return (
                <div key={message.id} className="group flex gap-3">
                  {/* Avatar */}
                  <Link
                    href={`/profile/${message.sender.id}`}
                    aria-label={`View ${message.sender.name}'s profile`}
                    className="shrink-0 transition-transform hover:scale-105"
                  >
                    {message.sender.image ? (
                      <img
                        src={message.sender.image}
                        alt=""
                        className="size-9 rounded-full border border-border object-cover"
                      />
                    ) : (
                      <div className="flex size-9 items-center justify-center rounded-full border border-border bg-muted">
                        <span className="text-xs font-medium text-muted-foreground">
                          {initial}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Message content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <Link
                          href={`/profile/${message.sender.id}`}
                          className={`text-xs font-semibold hover:underline ${senderColor}`}
                        >
                          {message.sender.name}
                        </Link>
                        <span className="text-[11px] text-muted-foreground">
                          {formatTimestamp(message.createdAt)}
                        </span>
                        {message.updatedAt &&
                          message.updatedAt !== message.createdAt && (
                            <span className="text-[10px] text-muted-foreground italic">
                              (edited)
                            </span>
                          )}
                      </div>

                      {/* Three horizontal dots menu button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveMenuMessageId(
                              activeMenuMessageId === message.id
                                ? null
                                : message.id,
                            )
                          }
                          aria-label="Message options"
                          className="flex size-7 items-center justify-center rounded-lg text-muted-foreground opacity-80 transition-all hover:bg-muted hover:text-foreground hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                        >
                          <MoreHorizontal className="size-4" />
                        </button>

                        {activeMenuMessageId === message.id && (
                          <div
                            ref={messageMenuRef}
                            className="absolute right-0 top-full z-40 mt-1 w-56 rounded-2xl border border-border bg-background p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150"
                          >
                            {/* 6 Main Emojis Reaction Bar */}
                            <div className="mb-2 flex items-center justify-between rounded-xl bg-muted/60 p-1">
                              {REACTION_EMOJIS.map((emoji) => {
                                const currentReaction = message.reactions?.find(
                                  (r) => r.emoji === emoji,
                                );
                                const hasReacted =
                                  currentReaction?.userIds.includes(
                                    currentUser.id,
                                  );
                                return (
                                  <button
                                    key={emoji}
                                    type="button"
                                    onClick={() => {
                                      handleToggleReaction(message.id, emoji);
                                      setActiveMenuMessageId(null);
                                    }}
                                    aria-label={`React with ${emoji}`}
                                    className={`flex size-7 items-center justify-center rounded-lg text-base transition-transform hover:scale-125 active:scale-95 ${
                                      hasReacted
                                        ? "bg-primary/20 ring-1 ring-primary"
                                        : "hover:bg-background"
                                    }`}
                                  >
                                    {emoji}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="space-y-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuMessageId(null);
                                  setReplyingTo(message);
                                  inputRef.current?.focus();
                                }}
                                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted"
                              >
                                <Reply className="size-3.5 text-muted-foreground" />
                                <span>Reply</span>
                              </button>

                              {canEdit && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuMessageId(null);
                                    handleStartEdit(message);
                                  }}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground transition-colors hover:bg-muted"
                                >
                                  <Pencil className="size-3.5 text-muted-foreground" />
                                  <span>Edit Message</span>
                                </button>
                              )}

                              {canDelete && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuMessageId(null);
                                    setMessageToDelete(message.id);
                                  }}
                                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                                >
                                  <Trash2 className="size-3.5" />
                                  <span>Delete Message</span>
                                </button>
                              )}

                              {isAuthor && !isRecent && (
                                <div className="px-2.5 py-1 text-[11px] text-muted-foreground italic">
                                  Edit & delete expired (&gt;1 hr)
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {editingMessageId === message.id ? (
                      <div className="mt-2 space-y-2 rounded-xl border border-primary/40 bg-card p-3 shadow-md">
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          className="w-full resize-none rounded-lg border border-border bg-background p-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          rows={3}
                          autoFocus
                          disabled={isSavingEdit}
                        />
                        {editError && (
                          <p className="text-xs text-destructive">
                            {editError}
                          </p>
                        )}
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            disabled={isSavingEdit}
                            className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            <X className="size-3.5" />
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(message.id)}
                            disabled={isSavingEdit || !editingContent.trim()}
                            className="flex items-center gap-1 rounded-lg bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            <Check className="size-3.5" />
                            {isSavingEdit ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Quoted Reply Preview */}
                        {message.replyTo && (
                          <div className="mb-1.5 flex items-center gap-1.5 rounded-lg border-l-2 border-primary bg-primary/10 px-2.5 py-1 text-xs text-muted-foreground">
                            <Reply className="size-3 shrink-0 text-primary" />
                            <span className="font-semibold text-primary text-[11px] shrink-0">
                              {message.replyTo.senderName}:
                            </span>
                            <span className="truncate text-[11px] text-foreground/80">
                              {message.replyTo.content}
                            </span>
                          </div>
                        )}

                        <div
                          className={`mt-1 rounded-xl border-l-4 p-3.5 shadow-2xs transition-colors ${styles.bg} ${styles.border}`}
                        >
                          {message.type === "TASK" && (
                            <div className="mb-2 flex items-center justify-between border-b border-border/40 pb-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleTask(
                                    message.id,
                                    message.completed,
                                  )
                                }
                                className="flex items-center gap-2 text-xs font-semibold text-foreground hover:opacity-80"
                              >
                                {message.completed ? (
                                  <CheckCircle2 className="size-4 text-emerald-500" />
                                ) : (
                                  <Circle className="size-4 text-muted-foreground" />
                                )}
                                <span
                                  className={
                                    message.completed
                                      ? "line-through text-muted-foreground"
                                      : "text-foreground"
                                  }
                                >
                                  {message.completed
                                    ? "Task Completed"
                                    : "Mark as completed"}
                                </span>
                              </button>

                              {message.deadline && (
                                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                  Due: {formatDeadline(message.deadline)}
                                </span>
                              )}
                            </div>
                          )}

                          <p
                            className={`text-sm text-foreground whitespace-pre-wrap break-words ${message.type === "TASK" && message.completed ? "line-through text-muted-foreground" : ""}`}
                          >
                            {renderFormattedContent(message.content)}
                          </p>
                        </div>

                        {/* Reactions Pills */}
                        {message.reactions && message.reactions.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pt-0.5">
                            {message.reactions.map((r) => {
                              const hasReacted = r.userIds.includes(
                                currentUser.id,
                              );
                              return (
                                <button
                                  key={r.emoji}
                                  type="button"
                                  onClick={() =>
                                    handleToggleReaction(message.id, r.emoji)
                                  }
                                  aria-label={`Reaction ${r.emoji} count ${r.count}`}
                                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs transition-all active:scale-95 ${
                                    hasReacted
                                      ? "border border-primary/50 bg-primary/15 font-semibold text-primary shadow-xs scale-105"
                                      : "border border-border/80 bg-background/80 text-foreground/80 hover:bg-muted"
                                  }`}
                                >
                                  <span className="text-sm leading-none">
                                    {r.emoji}
                                  </span>
                                  <span className="text-[11px] font-bold">
                                    {r.count}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="relative shrink-0 border-t border-border bg-background px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:px-6">
        {/* Reply Bar */}
        {replyingTo && (
          <div className="mb-2 flex items-center justify-between rounded-2xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center gap-2 min-w-0">
              <Reply className="size-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="font-semibold text-primary">
                  Replying to {replyingTo.sender.name}
                </p>
                <p className="truncate text-muted-foreground text-[11px]">
                  {replyingTo.content}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              aria-label="Cancel reply"
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Mention Autocomplete Suggestions Dropdown */}
        {mentionQuery !== null && matchingMembers.length > 0 && (
          <div className="absolute bottom-full left-4 right-4 z-40 mb-2 max-h-48 overflow-y-auto rounded-2xl border border-border bg-background p-1.5 shadow-xl md:left-6 md:max-w-md animate-in fade-in zoom-in-95 duration-100">
            <p className="px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              Mention Teammate
            </p>
            {matchingMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() =>
                  handleSelectMention(member.username || member.name)
                }
                className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted"
              >
                {member.image ? (
                  <img
                    src={member.image}
                    alt={member.name}
                    className="size-6 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                    {(member.username || member.name).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-foreground truncate block">
                    {member.name}
                  </span>
                  {member.username && (
                    <span className="text-[11px] text-muted-foreground">
                      @{member.username}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSend} className="flex items-center gap-2">
          {/* Type selector */}
          <div className="relative shrink-0" ref={typeMenuRef}>
            <button
              type="button"
              onClick={() => setShowTypeMenu(!showTypeMenu)}
              className="flex h-11 items-center gap-1.5 rounded-full border border-border bg-background px-3.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              {MESSAGE_TYPE_OPTIONS.find((o) => o.value === messageType)
                ?.label ?? "Normal"}
              {showTypeMenu ? (
                <ChevronUp className="size-3.5" />
              ) : (
                <ChevronDown className="size-3.5" />
              )}
            </button>

            {showTypeMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-36 overflow-hidden rounded-xl border border-border bg-background p-1 shadow-lg">
                {MESSAGE_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setMessageType(option.value);
                      setShowTypeMenu(false);
                    }}
                    className={`w-full rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-muted ${
                      messageType === option.value
                        ? "font-semibold text-primary"
                        : "text-foreground"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Deadline (visible when Task type selected) */}
          {messageType === "TASK" && (
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="h-11 rounded-xl border border-border bg-background px-3 text-xs text-foreground"
              aria-label="Task deadline"
            />
          )}

          {/* Message input */}
          <Input
            ref={inputRef}
            value={content}
            onChange={handleInputChange}
            placeholder={
              messageType === "TASK"
                ? "Describe task to create..."
                : "Write a message... (Type @ to mention)"
            }
            disabled={isSending}
            maxLength={4000}
            className="h-11 min-w-0 flex-1 rounded-full border-border bg-background px-4 text-sm placeholder:text-muted-foreground"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={isSending || !content.trim()}
            className="flex h-11 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>Send</span>
            <Send className="size-3.5" strokeWidth={2.2} />
          </button>
        </form>
      </div>

      {/* Delete Channel Confirmation Modal */}
      {showDeleteChannelModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-200"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isDeletingChannel) {
              setShowDeleteChannelModal(false);
              setDeleteChannelError("");
            }
          }}
        >
          <div className="w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Delete Channel
                </h2>
                <p className="text-xs text-muted-foreground">
                  This will delete &quot;{channel.name}&quot; and all its
                  messages.
                </p>
              </div>
            </div>

            <p className="text-sm text-foreground/80">
              Are you sure you want to delete this channel? All chat messages
              inside will be permanently deleted.
            </p>

            {deleteChannelError && (
              <div
                role="alert"
                className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive"
              >
                {deleteChannelError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingChannel}
                onClick={() => setShowDeleteChannelModal(false)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingChannel}
                onClick={handleDeleteChannel}
                className="flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Trash2 className="size-4" />
                <span>
                  {isDeletingChannel ? "Deleting..." : "Delete Channel"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Message Confirmation Modal */}
      {messageToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-200"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isDeletingMessage) {
              setMessageToDelete(null);
            }
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center gap-2.5 text-destructive">
              <div className="flex size-9 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="size-4.5" />
              </div>
              <h2 className="text-base font-bold text-foreground">
                Delete Message?
              </h2>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isDeletingMessage}
                onClick={() => setMessageToDelete(null)}
                className="rounded-xl border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingMessage}
                onClick={handleConfirmDeleteMessage}
                className="flex items-center gap-1.5 rounded-xl bg-destructive px-3.5 py-1.5 text-xs font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                <span>{isDeletingMessage ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
