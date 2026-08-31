"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  MoreVertical,
  Search,
  Send,
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
    bg: "bg-[#E8E7FF]",
    border: "border-l-[#7B6CF6]",
  },
  ANNOUNCEMENT: {
    bg: "bg-[#FFE4E4]",
    border: "border-l-[#E53E3E]",
  },
  TASK: {
    bg: "bg-[#E4FFEC]",
    border: "border-l-[#22C55E]",
  },
};

// Deterministic colors per sender
const SENDER_COLORS = [
  "text-[#16A34A]",
  "text-[#E53E3E]",
  "text-primary",
  "text-[#D97706]",
  "text-[#7C3AED]",
  "text-[#0891B2]",
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typeMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

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
      } catch {
        setError("Unable to load messages. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [channel.teamId, channel.id],
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

  // Close type menu on outside click
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        typeMenuRef.current &&
        !typeMenuRef.current.contains(event.target as Node)
      ) {
        setShowTypeMenu(false);
      }
    }

    if (showTypeMenu) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [showTypeMenu]);

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

  // Suppress unused variable warning — currentUser will be used for future features
  void currentUser;

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Header */}
      {showSearch ? (
        <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
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
        <header className="flex shrink-0 items-center gap-3 px-4 py-3 md:px-6">
          <Link
            href={`/teams/${channel.teamId}`}
            aria-label={`Back to ${channel.teamName}`}
            className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-5" strokeWidth={2} />
          </Link>

          <MessageCircle
            className="size-5 shrink-0 text-muted-foreground"
            strokeWidth={1.8}
          />

          <span className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />

          <h1 className="min-w-0 truncate text-lg font-bold text-foreground md:text-xl">
            {channel.name}
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

          <div className="ml-auto flex items-center gap-1">
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
              aria-label="Team info"
              onClick={() => router.push(`/teams/${channel.teamId}/info`)}
              className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
            >
              <MoreVertical className="size-5" strokeWidth={2} />
            </button>
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
          <div className="space-y-6">
            {messages.map((message) => {
              const styles = MESSAGE_STYLES[message.type];
              const senderColor = getSenderColor(message.sender.id, senderIds);
              const initial = (
                message.sender.username ??
                message.sender.name ??
                "?"
              )
                .charAt(0)
                .toUpperCase();

              return (
                <div key={message.id} className="flex gap-3">
                  {/* Avatar */}
                  {message.sender.image ? (
                    <img
                      src={message.sender.image}
                      alt=""
                      className="size-10 shrink-0 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-muted">
                      <span className="text-sm font-medium text-muted-foreground">
                        {initial}
                      </span>
                    </div>
                  )}

                  {/* Message content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-sm font-semibold ${senderColor}`}>
                        {message.sender.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(message.createdAt)}
                      </span>
                    </div>

                    <div
                      className={`mt-1 rounded-lg border-l-4 px-4 py-3 ${styles.bg} ${styles.border}`}
                    >
                      {message.type === "TASK" && message.deadline && (
                        <div className="mb-1 flex items-center gap-1.5 text-xs text-[#22C55E]">
                          <span className="inline-flex size-3.5 items-center justify-center rounded-full border border-[#22C55E]">
                            <span className="sr-only">Task</span>
                          </span>
                          Deadline: {formatDeadline(message.deadline)}
                        </div>
                      )}
                      <p className="text-sm text-foreground">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-border px-4 py-3 md:px-6">
        <form onSubmit={handleSend} className="flex items-end gap-2">
          {/* Type selector */}
          <div className="relative" ref={typeMenuRef}>
            <button
              type="button"
              onClick={() => setShowTypeMenu(!showTypeMenu)}
              className="flex h-11 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
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
              <div className="absolute bottom-full left-0 mb-2 w-40 overflow-hidden rounded-lg border border-border bg-background p-1 shadow-lg">
                {MESSAGE_TYPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setMessageType(option.value);
                      setShowTypeMenu(false);
                    }}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-muted ${
                      messageType === option.value
                        ? "font-medium text-foreground"
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
              className="h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              aria-label="Task deadline"
            />
          )}

          {/* Message input */}
          <Input
            ref={inputRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="write message...."
            disabled={isSending}
            maxLength={4000}
            className="h-11 min-w-0 flex-1 rounded-lg border-border bg-background px-4 text-sm placeholder:text-muted-foreground"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={isSending || !content.trim()}
            className="flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send
            <Send className="size-4" strokeWidth={2} />
          </button>
        </form>
      </div>
    </div>
  );
}
