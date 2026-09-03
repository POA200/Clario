"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  MoreHorizontal,
  Pencil,
  Reply,
  Send,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import type { DMConversation, DMMessage } from "@/services/dm-service";

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
          className="font-semibold underline underline-offset-2 hover:opacity-80"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </Link>
      );
    }
    return part;
  });
}

function formatTimestamp(isoString: string): string {
  try {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHour = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHour}:${displayMinutes}${ampm}`;
  } catch {
    return "";
  }
}

type DirectMessageScreenProps = {
  initialConversation: DMConversation;
  currentUserId: string;
};

export function DirectMessageScreen({
  initialConversation,
  currentUserId,
}: DirectMessageScreenProps) {
  const router = useRouter();
  const [conversation, setConversation] =
    useState<DMConversation>(initialConversation);
  const [messages, setMessages] = useState<DMMessage[]>(
    initialConversation.messages,
  );
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Reply & Mention states
  const [replyingTo, setReplyingTo] = useState<DMMessage | null>(null);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);

  // Edit message state
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete message state
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isDeletingMessage, setIsDeletingMessage] = useState(false);

  // Message menu state
  const [activeMenuMessageId, setActiveMenuMessageId] = useState<string | null>(
    null,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageMenuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const mentionableUsers = [
    {
      id: conversation.recipient.id,
      name: conversation.recipient.name,
      username: conversation.recipient.username,
      image: conversation.recipient.image,
    },
  ];

  const matchingMembers =
    mentionQuery !== null
      ? mentionableUsers.filter((m) => {
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

  function handleBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/chats");
    }
  }

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const response = await fetch(`/api/dm/${conversation.id}/messages`);
      if (!response.ok) return;
      const data = await response.json();
      if (Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch {
      // Background poll fail silently
    }
  }, [conversation.id]);

  // Initial scroll and auto-scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Polling every 4 seconds for real-time 1-on-1 sync
  useEffect(() => {
    const interval = window.setInterval(() => {
      fetchMessages();
    }, 4000);

    return () => window.clearInterval(interval);
  }, [fetchMessages]);

  // Close message menu on outside click
  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        messageMenuRef.current &&
        !messageMenuRef.current.contains(event.target as Node)
      ) {
        setActiveMenuMessageId(null);
      }
    }

    if (activeMenuMessageId) {
      document.addEventListener("mousedown", handleClick);
    }

    return () => document.removeEventListener("mousedown", handleClick);
  }, [activeMenuMessageId]);

  async function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/dm/${conversation.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: trimmed,
          replyToId: replyingTo?.id ?? undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error || "Failed to send message.");
        return;
      }

      if (data?.message) {
        setMessages((prev) => [...prev, data.message]);
        setContent("");
        setReplyingTo(null);
        setMentionQuery(null);
        inputRef.current?.focus();
      }
    } catch {
      setErrorMessage("Network error sending message.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleSaveEdit(messageId: string) {
    const trimmed = editingContent.trim();
    if (!trimmed || isSavingEdit) return;

    setIsSavingEdit(true);
    setEditError("");

    try {
      const response = await fetch(`/api/dm/${conversation.id}/messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, content: trimmed }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEditError(data?.error || "Failed to update message.");
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
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function handleDeleteMessage() {
    if (!messageToDelete || isDeletingMessage) return;

    setIsDeletingMessage(true);

    try {
      const response = await fetch(
        `/api/dm/${conversation.id}/messages?messageId=${encodeURIComponent(messageToDelete)}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const data = await response.json();
        setErrorMessage(data?.error || "Failed to delete message.");
      } else {
        setMessages((current) =>
          current.filter((m) => m.id !== messageToDelete),
        );
      }

      setMessageToDelete(null);
    } catch {
      setErrorMessage("Network error deleting message.");
    } finally {
      setIsDeletingMessage(false);
    }
  }

  async function handleToggleReaction(messageId: string, emoji: string) {
    // Optimistic UI update
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id !== messageId) return msg;
        const currentReactions = msg.reactions ?? [];
        const currentForEmoji = currentReactions.find((r) => r.emoji === emoji);
        const userReacted = currentForEmoji?.userIds.includes(currentUserId);

        let nextReactions;
        if (userReacted) {
          nextReactions = currentReactions
            .map((r) =>
              r.emoji === emoji
                ? {
                    ...r,
                    count: r.count - 1,
                    userIds: r.userIds.filter((id) => id !== currentUserId),
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
                    userIds: [...r.userIds, currentUserId],
                  }
                : r,
            );
          } else {
            nextReactions = [
              ...currentReactions,
              { emoji, count: 1, userIds: [currentUserId] },
            ];
          }
        }
        return { ...msg, reactions: nextReactions };
      }),
    );

    try {
      const response = await fetch(
        `/api/dm/${conversation.id}/messages/reactions`,
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

  const recipientInitial = (
    conversation.recipient.username ??
    conversation.recipient.name ??
    "?"
  )
    .charAt(0)
    .toUpperCase();

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-4 md:px-6">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            aria-label="Back"
            className="flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
          >
            <ArrowLeft className="size-5" strokeWidth={2.2} />
          </button>

          <Link
            href={`/profile/${conversation.recipient.id}`}
            className="flex items-center gap-2.5 min-w-0 group"
          >
            <div className="relative">
              {conversation.recipient.image ? (
                <img
                  src={conversation.recipient.image}
                  alt={conversation.recipient.name}
                  className="size-9 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary border border-border">
                  {recipientInitial}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-foreground group-hover:underline">
                {conversation.recipient.name}
              </h1>
              {conversation.recipient.username && (
                <p className="truncate text-[11px] text-muted-foreground">
                  @{conversation.recipient.username}
                </p>
              )}
            </div>
          </Link>
        </div>

        <Link
          href={`/profile/${conversation.recipient.id}`}
          className="rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
        >
          View Profile
        </Link>
      </header>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserRound className="size-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-bold text-foreground">
                Direct Message with {conversation.recipient.name}
              </h2>
              <p className="text-xs text-muted-foreground max-w-xs">
                Send a message to start this private conversation.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message) => {
            const isSelf = message.sender.id === currentUserId;
            const isRecent = isWithinOneHour(message.createdAt);
            const canEdit = isSelf && isRecent;
            const canDelete = isSelf && isRecent;
            const senderInitial = (
              message.sender.username ??
              message.sender.name ??
              "?"
            )
              .charAt(0)
              .toUpperCase();

            return (
              <div
                key={message.id}
                className={`group flex gap-2.5 ${isSelf ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <Link
                  href={`/profile/${message.sender.id}`}
                  className="shrink-0 transition-transform hover:scale-105"
                >
                  {message.sender.image ? (
                    <img
                      src={message.sender.image}
                      alt=""
                      className="size-8 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <div className="flex size-8 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground">
                      {senderInitial}
                    </div>
                  )}
                </Link>

                {/* Message Body */}
                <div
                  className={`max-w-[78%] space-y-1 ${isSelf ? "items-end text-right" : "items-start text-left"}`}
                >
                  <div
                    className={`flex items-baseline gap-2 ${isSelf ? "flex-row-reverse" : "flex-row"}`}
                  >
                    <span className="text-xs font-semibold text-foreground">
                      {isSelf ? "You" : message.sender.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTimestamp(message.createdAt)}
                    </span>
                    {message.updatedAt &&
                      message.updatedAt !== message.createdAt && (
                        <span className="text-[10px] text-muted-foreground italic">
                          (edited)
                        </span>
                      )}

                    {/* Three horizontal dots menu */}
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
                        className="flex size-6 items-center justify-center rounded text-muted-foreground opacity-80 transition-all hover:bg-muted hover:text-foreground hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      >
                        <MoreHorizontal className="size-3.5" />
                      </button>

                      {activeMenuMessageId === message.id && (
                        <div
                          ref={messageMenuRef}
                          className={`absolute top-full z-40 mt-1 w-52 rounded-2xl border border-border bg-background p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150 ${
                            isSelf ? "right-0" : "left-0"
                          }`}
                        >
                          {/* 6 Reaction Emojis */}
                          <div className="mb-2 flex items-center justify-between rounded-xl bg-muted/60 p-1">
                            {REACTION_EMOJIS.map((emoji) => {
                              const currentReaction = message.reactions?.find(
                                (r) => r.emoji === emoji,
                              );
                              const hasReacted =
                                currentReaction?.userIds.includes(
                                  currentUserId,
                                );
                              return (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => {
                                    handleToggleReaction(message.id, emoji);
                                    setActiveMenuMessageId(null);
                                  }}
                                  aria-label={`React ${emoji}`}
                                  className={`flex size-6 items-center justify-center rounded-lg text-sm transition-transform hover:scale-125 ${
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

                          <div className="space-y-0.5 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuMessageId(null);
                                setReplyingTo(message);
                                inputRef.current?.focus();
                              }}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                            >
                              <Reply className="size-3.5 text-muted-foreground" />
                              <span>Reply</span>
                            </button>

                            {canEdit && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuMessageId(null);
                                  setEditingMessageId(message.id);
                                  setEditingContent(message.content);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
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
                                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                              >
                                <Trash2 className="size-3.5" />
                                <span>Delete Message</span>
                              </button>
                            )}

                            {isSelf && !isRecent && (
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
                    <div className="space-y-2 rounded-xl border border-primary/40 bg-card p-3 shadow-md">
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="w-full resize-none rounded-lg border border-border bg-background p-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        rows={2}
                        autoFocus
                        disabled={isSavingEdit}
                      />
                      {editError && (
                        <p className="text-[11px] text-destructive">
                          {editError}
                        </p>
                      )}
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditingMessageId(null)}
                          disabled={isSavingEdit}
                          className="rounded-lg border border-border px-2.5 py-1 text-xs text-foreground hover:bg-muted"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(message.id)}
                          disabled={isSavingEdit || !editingContent.trim()}
                          className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90"
                        >
                          {isSavingEdit ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Quoted Reply Preview */}
                      {message.replyTo && (
                        <div
                          className={`mb-1 flex items-center gap-1.5 rounded-lg border-l-2 border-primary px-2.5 py-1 text-xs ${
                            isSelf
                              ? "bg-primary/20 text-white/90"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Reply className="size-3 shrink-0 text-primary" />
                          <span className="font-semibold text-primary text-[11px] shrink-0">
                            {message.replyTo.senderName}:
                          </span>
                          <span className="truncate text-[11px]">
                            {message.replyTo.content}
                          </span>
                        </div>
                      )}

                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-2xs ${
                          isSelf
                            ? "rounded-tr-xs bg-[#2F1AC4] text-white dark:bg-primary dark:text-primary-foreground text-left"
                            : "rounded-tl-xs border border-[#D5CAFE]/60 bg-[#EAE6FE] text-foreground dark:border-border dark:bg-dashboard-surface"
                        }`}
                      >
                        {renderFormattedContent(message.content)}
                      </div>

                      {/* Reactions Pills */}
                      {message.reactions && message.reactions.length > 0 && (
                        <div
                          className={`mt-1 flex flex-wrap gap-1 ${
                            isSelf ? "justify-end" : "justify-start"
                          }`}
                        >
                          {message.reactions.map((r) => {
                            const hasReacted =
                              r.userIds.includes(currentUserId);
                            return (
                              <button
                                key={r.emoji}
                                type="button"
                                onClick={() =>
                                  handleToggleReaction(message.id, r.emoji)
                                }
                                aria-label={`Reaction ${r.emoji} count ${r.count}`}
                                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all active:scale-95 ${
                                  hasReacted
                                    ? "border border-primary/50 bg-primary/15 font-semibold text-primary shadow-xs scale-105"
                                    : "border border-border/80 bg-background/80 text-foreground/80 hover:bg-muted"
                                }`}
                              >
                                <span className="text-xs leading-none">
                                  {r.emoji}
                                </span>
                                <span className="text-[10px] font-bold">
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
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div className="mx-4 mb-2 rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {errorMessage}
        </div>
      )}

      {/* Bottom Composer */}
      <footer className="relative shrink-0 border-t border-border bg-background px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] md:px-6">
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
              Mention User
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
          <Input
            ref={inputRef}
            value={content}
            onChange={handleInputChange}
            placeholder={`Message ${conversation.recipient.name}... (Type @ to mention)`}
            maxLength={4000}
            disabled={isSending}
            className="h-11 rounded-full border border-border bg-background px-4 text-sm"
          />

          <button
            type="submit"
            disabled={isSending || !content.trim()}
            aria-label="Send message"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send className="size-4.5" />
          </button>
        </form>
      </footer>

      {/* Delete message modal */}
      {messageToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-150"
          role="presentation"
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-2xl space-y-3">
            <h2 className="text-base font-bold text-foreground">
              Delete Message?
            </h2>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to delete this message? This action cannot
              be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={isDeletingMessage}
                onClick={() => setMessageToDelete(null)}
                className="rounded-xl border border-border px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingMessage}
                onClick={handleDeleteMessage}
                className="rounded-xl bg-destructive px-3.5 py-1.5 text-xs font-semibold text-destructive-foreground hover:opacity-90"
              >
                {isDeletingMessage ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
