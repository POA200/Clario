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
  MoreVertical,
  Pencil,
  Search,
  Send,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import type { ChannelMessage, MessageType } from "@/types/team";
import type { ChannelDetail } from "@/services/team-service";

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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
    }

    if (showTypeMenu || showOptionsMenu) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [showTypeMenu, showOptionsMenu]);

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
            {headerMembers.map((member) =>
              member.image ? (
                <img
                  key={member.id}
                  src={member.image}
                  alt=""
                  className="size-7 rounded-full border-2 border-background object-cover"
                />
              ) : (
                <div
                  key={member.id}
                  className="flex size-7 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground"
                >
                  {member.name.charAt(0).toUpperCase()}
                </div>
              ),
            )}
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
              const canEdit = isAuthor;
              const canDelete = isAuthor || channel.isAdmin;
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
                  {message.sender.image ? (
                    <img
                      src={message.sender.image}
                      alt=""
                      className="size-9 shrink-0 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                      <span className="text-xs font-medium text-muted-foreground">
                        {initial}
                      </span>
                    </div>
                  )}

                  {/* Message content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span
                          className={`text-xs font-semibold ${senderColor}`}
                        >
                          {message.sender.name}
                        </span>
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

                      {(canEdit || canDelete) && (
                        <div className="flex items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleStartEdit(message)}
                              aria-label="Edit message"
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => setMessageToDelete(message.id)}
                              aria-label="Delete message"
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      )}
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
                      <div
                        className={`mt-1 rounded-xl border-l-4 p-3.5 shadow-2xs transition-colors ${styles.bg} ${styles.border}`}
                      >
                        {message.type === "TASK" && (
                          <div className="mb-2 flex items-center justify-between border-b border-border/40 pb-2">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleTask(message.id, message.completed)
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
                          {message.content}
                        </p>
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
      <div className="shrink-0 border-t border-border bg-background px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:px-6">
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
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              messageType === "TASK"
                ? "Describe task to create..."
                : "Write a message..."
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
