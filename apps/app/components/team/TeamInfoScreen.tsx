"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import type {
  TeamInfo,
  TeamInfoMember,
  TeamInfoTask,
} from "@/services/team-service";

// ---------------------------------------------------------------------------
// Presence helpers
// ---------------------------------------------------------------------------

const ONLINE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes

function getPresenceStatus(lastSeenAt: string | null): {
  label: string;
  online: boolean;
} {
  if (!lastSeenAt) {
    return { label: "Offline", online: false };
  }

  const lastSeen = new Date(lastSeenAt).getTime();
  const now = Date.now();
  const diffMs = now - lastSeen;

  if (diffMs < ONLINE_THRESHOLD_MS) {
    return { label: "Online", online: true };
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  let label: string;
  if (diffMinutes < 1) {
    label = "Just now";
  } else if (diffMinutes < 60) {
    label = `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    label = `${diffHours}h ago`;
  } else if (diffDays === 1) {
    label = "Yesterday";
  } else {
    label = `${diffDays}d ago`;
  }

  return { label, online: false };
}

function formatCreatedDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "tasks" | "members";

type TeamInfoScreenProps = {
  teamInfo: TeamInfo;
  currentUserId: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function TeamInfoScreen({
  teamInfo,
  currentUserId,
}: TeamInfoScreenProps) {
  const [activeTab, setActiveTab] = useState<Tab>("tasks");
  const [searchQuery, setSearchQuery] = useState("");

  // Tasks state
  const [tasks, setTasks] = useState<TeamInfoTask[]>(teamInfo.tasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [taskError, setTaskError] = useState("");
  const newTaskInputRef = useRef<HTMLInputElement>(null);

  // Presence heartbeat
  useEffect(() => {
    function sendHeartbeat() {
      fetch("/api/presence", { method: "POST" }).catch(() => {
        // Silently ignore presence errors
      });
    }

    sendHeartbeat();
    const interval = window.setInterval(sendHeartbeat, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  // Suppress unused variable warning — currentUserId available for future features
  void currentUserId;

  // -------------------------------------------------------------------------
  // Tasks
  // -------------------------------------------------------------------------

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleTask = useCallback(
    async (taskId: string, currentCompleted: boolean) => {
      const newCompleted = !currentCompleted;

      // Optimistic update
      setTasks((current) =>
        current.map((t) =>
          t.id === taskId ? { ...t, completed: newCompleted } : t,
        ),
      );

      try {
        const response = await fetch(
          `/api/teams/${teamInfo.id}/tasks/${taskId}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: newCompleted }),
          },
        );

        if (!response.ok) {
          // Rollback on failure
          setTasks((current) =>
            current.map((t) =>
              t.id === taskId ? { ...t, completed: currentCompleted } : t,
            ),
          );
        }
      } catch {
        // Rollback on network error
        setTasks((current) =>
          current.map((t) =>
            t.id === taskId ? { ...t, completed: currentCompleted } : t,
          ),
        );
      }
    },
    [teamInfo.id],
  );

  async function handleCreateTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newTaskTitle.trim();
    if (!title || isCreatingTask) return;

    setIsCreatingTask(true);
    setTaskError("");

    try {
      const response = await fetch(`/api/teams/${teamInfo.id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();

      if (!response.ok) {
        setTaskError(
          typeof data?.error === "string"
            ? data.error
            : "Unable to create task.",
        );
        return;
      }

      if (data.task) {
        setTasks((current) => [data.task, ...current]);
      }

      setNewTaskTitle("");
      newTaskInputRef.current?.focus();
    } catch {
      setTaskError("Something went wrong. Please try again.");
    } finally {
      setIsCreatingTask(false);
    }
  }

  // -------------------------------------------------------------------------
  // Members
  // -------------------------------------------------------------------------

  const filteredMembers = teamInfo.members.filter((member) => {
    const q = searchQuery.toLowerCase();
    return (
      member.name.toLowerCase().includes(q) ||
      (member.username?.toLowerCase().includes(q) ?? false)
    );
  });

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-2xl px-4 py-5 md:px-6 md:py-8">
        {/* Back button */}
        <Link
          href={`/teams/${teamInfo.id}`}
          aria-label={`Back to ${teamInfo.name}`}
          className="mb-5 inline-flex size-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted"
        >
          <ArrowLeft className="size-5" strokeWidth={2} />
        </Link>

        {/* Tab bar */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab("tasks");
              setSearchQuery("");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full border-2 px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === "tasks"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-foreground bg-background text-foreground hover:bg-muted"
            }`}
          >
            <CheckCircle2 className="size-4" strokeWidth={2} />
            Tasks
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("members");
              setSearchQuery("");
            }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-full border-2 px-6 py-3 text-sm font-semibold transition-colors ${
              activeTab === "members"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-foreground bg-background text-foreground hover:bg-muted"
            }`}
          >
            <Users className="size-4" strokeWidth={2} />
            Members
          </button>
        </div>

        {/* Search bar */}
        <div className="mt-5 flex items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Input
              aria-label={
                activeTab === "tasks" ? "Search Tasks" : "Search Members"
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === "tasks" ? "Search Tasks" : "Search Members"
              }
              className="h-12 rounded-full border-2 border-foreground bg-background px-5 pr-11 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <Search
              className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-foreground"
              size={16}
            />
          </div>

          {activeTab === "tasks" && (
            <button
              type="button"
              aria-label="Filter tasks"
              className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-foreground bg-background text-foreground transition-colors hover:bg-muted"
            >
              <SlidersHorizontal className="size-5" strokeWidth={1.8} />
            </button>
          )}
        </div>

        {/* Team metadata */}
        <div className="mt-3 flex items-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Users className="size-4" strokeWidth={1.8} />
            Members: {teamInfo.memberCount}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" strokeWidth={1.8} />
            Created: {formatCreatedDate(teamInfo.createdAt)}
          </span>
        </div>

        {/* Tab content */}
        <div className="mt-6">
          {activeTab === "tasks" && (
            <TasksTab
              tasks={filteredTasks}
              onToggle={toggleTask}
              searchQuery={searchQuery}
              newTaskTitle={newTaskTitle}
              setNewTaskTitle={setNewTaskTitle}
              isCreatingTask={isCreatingTask}
              taskError={taskError}
              onCreateTask={handleCreateTask}
              newTaskInputRef={newTaskInputRef}
            />
          )}

          {activeTab === "members" && (
            <MembersTab members={filteredMembers} searchQuery={searchQuery} />
          )}
        </div>
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tasks Tab
// ---------------------------------------------------------------------------

type TasksTabProps = {
  tasks: TeamInfoTask[];
  onToggle: (taskId: string, currentCompleted: boolean) => void;
  searchQuery: string;
  newTaskTitle: string;
  setNewTaskTitle: (value: string) => void;
  isCreatingTask: boolean;
  taskError: string;
  onCreateTask: (event: React.FormEvent<HTMLFormElement>) => void;
  newTaskInputRef: React.RefObject<HTMLInputElement | null>;
};

function TasksTab({
  tasks,
  onToggle,
  searchQuery,
  newTaskTitle,
  setNewTaskTitle,
  isCreatingTask,
  taskError,
  onCreateTask,
  newTaskInputRef,
}: TasksTabProps) {
  return (
    <div>
      {/* Add task form */}
      <form onSubmit={onCreateTask} className="mb-6 flex items-center gap-2">
        <Input
          ref={newTaskInputRef}
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          maxLength={200}
          disabled={isCreatingTask}
          className="h-11 min-w-0 flex-1 rounded-xl border-border bg-background px-4 text-sm placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={isCreatingTask || !newTaskTitle.trim()}
          aria-label="Add task"
          className="flex h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="size-4" strokeWidth={2} />
          {isCreatingTask ? "Adding..." : "Add"}
        </button>
      </form>

      {taskError && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {taskError}
        </p>
      )}

      {/* Task list */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <button
            key={task.id}
            type="button"
            onClick={() => onToggle(task.id, task.completed)}
            className={`flex w-full items-center gap-4 rounded-2xl px-5 py-4 text-left transition-colors ${
              task.completed ? "bg-[#E4FFEC]/60" : "bg-[#E4FFEC]"
            }`}
          >
            {task.completed ? (
              <CheckCircle2
                className="size-7 shrink-0 text-[#22C55E]"
                strokeWidth={2}
                aria-hidden="true"
              />
            ) : (
              <Circle
                className="size-7 shrink-0 text-[#22C55E]"
                strokeWidth={2}
                aria-hidden="true"
              />
            )}
            <span
              className={`min-w-0 flex-1 text-base font-medium ${
                task.completed
                  ? "text-[#22C55E]/60 line-through"
                  : "text-[#22C55E]"
              }`}
            >
              {task.title}
            </span>
            <span className="sr-only">
              {task.completed ? "Completed" : "Not completed"}
            </span>
          </button>
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          {searchQuery
            ? "No tasks match your search."
            : "No tasks yet. Add one above!"}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Members Tab
// ---------------------------------------------------------------------------

type MembersTabProps = {
  members: TeamInfoMember[];
  searchQuery: string;
};

function MembersTab({ members, searchQuery }: MembersTabProps) {
  return (
    <div className="space-y-4">
      {members.map((member) => {
        const presence = getPresenceStatus(member.lastSeenAt);
        const initial = (member.username ?? member.name ?? "?")
          .charAt(0)
          .toUpperCase();

        return (
          <div key={member.id} className="flex items-center gap-4">
            {/* Avatar */}
            {member.image ? (
              <img
                src={member.image}
                alt=""
                className="size-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                {initial}
              </div>
            )}

            {/* Name */}
            <span className="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
              {member.name}
            </span>

            {/* Presence */}
            <div className="flex shrink-0 items-center gap-1.5">
              <span
                className={`size-2.5 rounded-full ${
                  presence.online ? "bg-[#22C55E]" : "bg-muted-foreground/40"
                }`}
                aria-hidden="true"
              />
              <span
                className={`text-sm font-medium ${
                  presence.online ? "text-[#22C55E]" : "text-muted-foreground"
                }`}
              >
                {presence.label}
              </span>
            </div>
          </div>
        );
      })}

      {members.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          {searchQuery ? "No members match your search." : "No members found."}
        </div>
      )}
    </div>
  );
}
