"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  MessageSquarePlus,
  Plus,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { Input } from "@/components/ui/input";
import type { DMListItem, TeammateItem } from "@/services/dm-service";

function isOnline(lastSeenAt?: string | null): boolean {
  if (!lastSeenAt) return false;
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
  return new Date(lastSeenAt).getTime() > fiveMinutesAgo;
}

function formatRelativeTime(isoString?: string): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const ampm = hours >= 12 ? "PM" : "AM";
      const displayHour = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, "0");
      return `${displayHour}:${displayMinutes} ${ampm}`;
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) {
      return "Yesterday";
    }

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

type ChatsListScreenProps = {
  conversations: DMListItem[];
  teammates: TeammateItem[];
  currentUserId: string;
};

export function ChatsListScreen({
  conversations,
  teammates,
  currentUserId,
}: ChatsListScreenProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState("");

  const filteredConversations = conversations.filter((conv) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const nameMatch = conv.recipient.name.toLowerCase().includes(query);
    const usernameMatch = conv.recipient.username
      ? conv.recipient.username.toLowerCase().includes(query)
      : false;
    const messageMatch = conv.lastMessage?.content
      ? conv.lastMessage.content.toLowerCase().includes(query)
      : false;
    return nameMatch || usernameMatch || messageMatch;
  });

  const filteredTeammates = teammates.filter((t) => {
    const query = newChatSearch.toLowerCase().trim();
    if (!query) return true;
    const nameMatch = t.name.toLowerCase().includes(query);
    const usernameMatch = t.username
      ? t.username.toLowerCase().includes(query)
      : false;
    const teamMatch = t.teamName.toLowerCase().includes(query);
    return nameMatch || usernameMatch || teamMatch;
  });

  return (
    <div className="min-h-dvh bg-background">
      <DesktopSidebar />

      <main className="min-h-dvh ml-20 px-3 py-3 md:ml-[128px] md:px-0 md:py-[30px] md:pr-6">
        <section className="min-h-[calc(100dvh-24px)] rounded-[20px] bg-dashboard-surface px-4 py-5 md:min-h-[calc(100dvh-60px)] md:rounded-[24px] md:px-6 md:py-7 lg:px-6">
          {/* Header */}
          <header className="flex items-center justify-between">
            <h1 className="text-[20px] font-semibold tracking-tight text-foreground md:text-[30px]">
              Direct Messages
            </h1>
          </header>

          {/* Search + New Chat Button matching exact design */}
          <div className="mt-4 flex items-center gap-3 md:mt-4 md:max-w-[460px] md:gap-4">
            <div className="relative min-w-0 flex-1">
              <Input
                aria-label="Search Chats"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Chats"
                className="h-12 rounded-full border-2 border-foreground bg-background px-5 pr-11 text-sm text-foreground placeholder:text-muted-foreground md:h-[58px] md:px-6 md:pr-12 md:text-lg"
              />
              <Search
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-foreground md:right-6"
                size={18}
              />
            </div>

            <button
              type="button"
              aria-label="New chat"
              onClick={() => setShowNewChatModal(true)}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary md:h-[58px] md:w-[58px]"
            >
              <Plus className="size-6 md:size-7" strokeWidth={1.5} />
            </button>
          </div>

          {/* Two-column layout on large screens */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 md:mt-8">
            {/* Left Column: Active Chats */}
            <div className="space-y-3 lg:col-span-7">
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Conversations ({filteredConversations.length})
                </h2>
              </div>

              {filteredConversations.length > 0 ? (
                <div className="space-y-2.5">
                  {filteredConversations.map((conv) => {
                    const active = isOnline(conv.recipient.lastSeenAt);
                    const initial = (
                      conv.recipient.username ??
                      conv.recipient.name ??
                      "?"
                    )
                      .charAt(0)
                      .toUpperCase();
                    const isLastSenderSelf =
                      conv.lastMessage?.senderId === currentUserId;

                    return (
                      <Link
                        key={conv.conversationId}
                        href={`/dm/${conv.recipient.id}`}
                        className="group flex items-center gap-3.5 rounded-[22px] border border-[#D5CAFE]/60 bg-background/50 p-3.5 transition-all hover:scale-[1.01] hover:border-primary/40 hover:bg-background/80 dark:border-border dark:bg-background/40"
                      >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                          {conv.recipient.image ? (
                            <img
                              src={conv.recipient.image}
                              alt={conv.recipient.name}
                              className="size-12 rounded-full object-cover border border-border"
                            />
                          ) : (
                            <div className="flex size-12 items-center justify-center rounded-full bg-primary/15 text-base font-bold text-primary border border-border">
                              {initial}
                            </div>
                          )}
                          {active && (
                            <span
                              aria-label="Online"
                              className="absolute bottom-0 right-0 size-3.5 rounded-full border-2 border-background bg-emerald-500"
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <p className="truncate text-sm font-bold text-foreground">
                                {conv.recipient.name}
                              </p>
                              {conv.recipient.username && (
                                <span className="hidden truncate text-xs text-muted-foreground sm:inline">
                                  @{conv.recipient.username}
                                </span>
                              )}
                            </div>
                            {conv.lastMessage && (
                              <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                                {formatRelativeTime(conv.lastMessage.createdAt)}
                              </span>
                            )}
                          </div>

                          <p className="truncate text-xs text-muted-foreground mt-0.5">
                            {conv.lastMessage ? (
                              <>
                                {isLastSenderSelf && (
                                  <span className="font-semibold text-foreground/80">
                                    You:{" "}
                                  </span>
                                )}
                                {conv.lastMessage.content}
                              </>
                            ) : (
                              <span className="italic text-muted-foreground/70">
                                No messages yet. Click to chat.
                              </span>
                            )}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-[24px] border border-[#D5CAFE]/60 bg-background/30 p-8 text-center space-y-3 dark:border-border">
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <MessageSquarePlus className="size-7" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <h3 className="text-base font-bold text-foreground">
                      No direct messages yet
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Select a teammate from the right or click + to start a conversation.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No chats found matching &ldquo;{searchQuery}&rdquo;.
                </div>
              )}
            </div>

            {/* Right Column: Teammates to message */}
            <div className="space-y-3 lg:col-span-5">
              <div className="flex items-center justify-between pb-1">
                <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Teammates ({teammates.length})
                </h2>
              </div>

              {teammates.length > 0 ? (
                <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-background/40 p-4 space-y-1.5 dark:border-border">
                  {teammates.map((t) => {
                    const initial = (t.username ?? t.name ?? "?")
                      .charAt(0)
                      .toUpperCase();

                    return (
                      <Link
                        key={t.id}
                        href={`/dm/${t.id}`}
                        className="flex items-center justify-between rounded-xl p-2.5 transition-colors hover:bg-background/80"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {t.image ? (
                            <img
                              src={t.image}
                              alt={t.name}
                              className="size-9 rounded-full object-cover border border-border shrink-0"
                            />
                          ) : (
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary border border-primary/20">
                              {initial}
                            </div>
                          )}

                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-foreground">
                              {t.name}
                            </p>
                            <p className="truncate text-[10px] text-muted-foreground">
                              {t.teamName}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                          Chat
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-background/30 p-6 text-center space-y-1 dark:border-border">
                  <p className="text-xs font-semibold text-foreground">
                    No teammates found
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Join or create a team to connect with coworkers.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-150"
          role="presentation"
        >
          <div className="w-full max-w-md rounded-[28px] border border-border bg-background p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                New Direct Message
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatSearch("");
                }}
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                strokeWidth={2}
              />
              <Input
                value={newChatSearch}
                onChange={(e) => setNewChatSearch(e.target.value)}
                placeholder="Search teammates by name or workspace..."
                autoFocus
                className="h-10 rounded-xl pl-9 pr-3 text-xs"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1">
              {filteredTeammates.length > 0 ? (
                filteredTeammates.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setShowNewChatModal(false);
                      router.push(`/dm/${t.id}`);
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-left transition-colors hover:bg-muted"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {t.image ? (
                        <img
                          src={t.image}
                          alt={t.name}
                          className="size-9 rounded-full object-cover border border-border shrink-0"
                        />
                      ) : (
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold text-foreground">
                          {t.name}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {t.teamName}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                      Chat
                    </span>
                  </button>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No teammates found. Join a team or invite members to start chatting!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
