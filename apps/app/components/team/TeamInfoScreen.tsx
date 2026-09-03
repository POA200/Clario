"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Circle,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("tasks");
  const [searchQuery, setSearchQuery] = useState("");

  const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false);
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);
  const [deleteTeamError, setDeleteTeamError] = useState("");

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

  const [taskToDelete, setTaskToDelete] = useState<{
    taskId: string;
    title: string;
  } | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  const confirmDeleteTask = useCallback(async () => {
    if (!taskToDelete) return;
    const { taskId } = taskToDelete;
    setIsDeletingTask(true);

    // Optimistic update
    setTasks((current) => current.filter((t) => t.id !== taskId));
    setTaskToDelete(null);

    try {
      await fetch(`/api/teams/${teamInfo.id}/tasks/${taskId}`, {
        method: "DELETE",
      });
    } catch {
      // Silently ignore or reload on failure
    } finally {
      setIsDeletingTask(false);
    }
  }, [taskToDelete, teamInfo.id]);

  const deleteTask = useCallback(
    (task: { id: string; title: string }, event: React.MouseEvent) => {
      event.stopPropagation();
      setTaskToDelete({ taskId: task.id, title: task.title });
    },
    [],
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

  async function handleDeleteTeam() {
    setIsDeletingTeam(true);
    setDeleteTeamError("");

    try {
      const response = await fetch(`/api/teams/${teamInfo.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteTeamError(data?.error || "Failed to delete team.");
        setIsDeletingTeam(false);
        return;
      }

      router.push("/dashboard");
    } catch {
      setDeleteTeamError("Network error deleting team.");
      setIsDeletingTeam(false);
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

        {/* Team Header */}
        <div className="mb-6 flex items-center gap-3.5">
          {teamInfo.avatar ? (
            <img
              src={teamInfo.avatar}
              alt={teamInfo.name}
              className="size-12 shrink-0 rounded-2xl object-cover border border-border shadow-sm"
            />
          ) : (
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-xl font-bold text-primary border border-primary/20">
              {teamInfo.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-foreground">
              {teamInfo.name}
            </h1>
            <p className="text-xs text-muted-foreground">
              {teamInfo.memberCount}{" "}
              {teamInfo.memberCount === 1 ? "member" : "members"} • Created{" "}
              {formatCreatedDate(teamInfo.createdAt)}
            </p>
          </div>
        </div>

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
              onDelete={deleteTask}
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

          {/* Danger Zone: Delete Team (Admins Only) */}
          {teamInfo.isAdmin && (
            <div className="mt-12 rounded-2xl border border-destructive/30 bg-destructive/5 p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-destructive">
                    Delete Team
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Permanently remove this team, its channels, tasks, and
                    messages.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteTeamModal(true);
                    setDeleteTeamError("");
                  }}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-2 text-xs font-semibold text-destructive-foreground transition-opacity hover:opacity-90"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete Team</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Delete Team Confirmation Modal */}
      {showDeleteTeamModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-200"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isDeletingTeam) {
              setShowDeleteTeamModal(false);
              setDeleteTeamError("");
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
                  Delete Team
                </h2>
                <p className="text-xs text-muted-foreground">
                  This will delete &quot;{teamInfo.name}&quot; and all
                  associated data.
                </p>
              </div>
            </div>

            <p className="text-sm text-foreground/80">
              Are you sure you want to delete this team? All channels, tasks,
              invites, and chat messages will be permanently deleted for all
              members.
            </p>

            {deleteTeamError && (
              <div
                role="alert"
                className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive"
              >
                {deleteTeamError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeletingTeam}
                onClick={() => setShowDeleteTeamModal(false)}
                className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingTeam}
                onClick={handleDeleteTeam}
                className="flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Trash2 className="size-4" />
                <span>{isDeletingTeam ? "Deleting..." : "Delete Team"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      {taskToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-200"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !isDeletingTask) {
              setTaskToDelete(null);
            }
          }}
        >
          <div className="w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center gap-2.5 text-destructive">
              <div className="flex size-9 items-center justify-center rounded-full bg-destructive/10">
                <Trash2 className="size-4.5" />
              </div>
              <h2 className="text-base font-bold text-foreground">
                Delete Task?
              </h2>
            </div>

            <p className="text-xs text-foreground/80 line-clamp-2">
              Are you sure you want to delete &quot;{taskToDelete.title}&quot;?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                disabled={isDeletingTask}
                onClick={() => setTaskToDelete(null)}
                className="rounded-xl border border-border bg-background px-3.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingTask}
                onClick={confirmDeleteTask}
                className="flex items-center gap-1.5 rounded-xl bg-destructive px-3.5 py-1.5 text-xs font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                <Trash2 className="size-3.5" />
                <span>{isDeletingTask ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tasks Tab
// ---------------------------------------------------------------------------

type TasksTabProps = {
  tasks: TeamInfoTask[];
  onToggle: (taskId: string, currentCompleted: boolean) => void;
  onDelete: (
    task: { id: string; title: string },
    event: React.MouseEvent,
  ) => void;
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
  onDelete,
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
          <div
            key={task.id}
            className={`group/task flex w-full items-center justify-between gap-4 rounded-2xl border border-emerald-500/20 px-5 py-4 transition-colors ${
              task.completed
                ? "bg-[#E4FFEC]/60 dark:bg-emerald-950/20 opacity-75"
                : "bg-[#E4FFEC] dark:bg-emerald-950/40"
            }`}
          >
            <button
              type="button"
              onClick={() => onToggle(task.id, task.completed)}
              className="flex min-w-0 flex-1 items-center gap-4 text-left"
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
                    ? "text-[#16A34A]/70 dark:text-emerald-400/70 line-through"
                    : "text-[#16A34A] dark:text-emerald-300"
                }`}
              >
                {task.title}
              </span>
              <span className="sr-only">
                {task.completed ? "Completed" : "Not completed"}
              </span>
            </button>

            <button
              type="button"
              aria-label="Delete task"
              onClick={(e) => onDelete(task, e)}
              className="flex size-8 shrink-0 items-center justify-center rounded-lg text-emerald-800/60 opacity-75 transition-all hover:bg-destructive/10 hover:text-destructive hover:opacity-100 md:opacity-0 md:group-hover/task:opacity-100 dark:text-emerald-300/60"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
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
            <Link
              href={`/profile/${member.userId}`}
              aria-label={`View ${member.name}'s profile`}
              className="shrink-0 transition-transform hover:scale-105"
            >
              {member.image ? (
                <img
                  src={member.image}
                  alt=""
                  className="size-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {initial}
                </div>
              )}
            </Link>

            {/* Name */}
            <Link
              href={`/profile/${member.userId}`}
              className="min-w-0 flex-1 truncate text-base font-semibold text-foreground hover:underline"
            >
              {member.name}
            </Link>

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
