"use client";

import Link from "next/link";
import {
  CheckCircle2,
  ChevronRight,
  Circle,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { Input } from "@/components/ui/input";
import type { TeamTaskGroup, TaskItem } from "@/services/task-service";

type TasksScreenProps = {
  initialGroups: TeamTaskGroup[];
};

export function TasksScreen({ initialGroups }: TasksScreenProps) {
  const [groups, setGroups] = useState<TeamTaskGroup[]>(initialGroups);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingTeamId, setAddingTeamId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Search filter
  const filteredGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return groups;

    return groups
      .map((group) => {
        const matchesTeam =
          group.teamName.toLowerCase().includes(q) ||
          group.channelName.toLowerCase().includes(q);

        if (matchesTeam) {
          return group;
        }

        const matchingTasks = group.tasks.filter((t) =>
          t.title.toLowerCase().includes(q),
        );

        if (matchingTasks.length > 0) {
          return {
            ...group,
            tasks: matchingTasks,
          };
        }

        return null;
      })
      .filter((g): g is TeamTaskGroup => g !== null);
  }, [groups, searchQuery]);

  async function handleToggleTask(
    teamId: string,
    taskId: string,
    currentCompleted: boolean,
  ) {
    const nextCompleted = !currentCompleted;

    // Optimistic UI update
    setGroups((current) =>
      current.map((g) =>
        g.teamId === teamId
          ? {
              ...g,
              tasks: g.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: nextCompleted } : t,
              ),
            }
          : g,
      ),
    );

    try {
      const response = await fetch(`/api/teams/${teamId}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextCompleted }),
      });

      if (!response.ok) {
        // Rollback on failure
        setGroups((current) =>
          current.map((g) =>
            g.teamId === teamId
              ? {
                  ...g,
                  tasks: g.tasks.map((t) =>
                    t.id === taskId ? { ...t, completed: currentCompleted } : t,
                  ),
                }
              : g,
          ),
        );
        setErrorMessage("Failed to update task. Please try again.");
      }
    } catch {
      // Rollback on error
      setGroups((current) =>
        current.map((g) =>
          g.teamId === teamId
            ? {
                ...g,
                tasks: g.tasks.map((t) =>
                  t.id === taskId ? { ...t, completed: currentCompleted } : t,
                ),
              }
            : g,
        ),
      );
      setErrorMessage("Network error updating task.");
    }
  }

  const [taskToDelete, setTaskToDelete] = useState<{
    teamId: string;
    taskId: string;
    title: string;
  } | null>(null);
  const [isDeletingTask, setIsDeletingTask] = useState(false);

  async function handleConfirmDeleteTask() {
    if (!taskToDelete) return;
    const { teamId, taskId } = taskToDelete;
    setIsDeletingTask(true);

    // Optimistic UI update
    setGroups((current) =>
      current.map((g) =>
        g.teamId === teamId
          ? {
              ...g,
              tasks: g.tasks.filter((t) => t.id !== taskId),
            }
          : g,
      ),
    );
    setTaskToDelete(null);

    try {
      const response = await fetch(`/api/teams/${teamId}/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setErrorMessage("Failed to delete task. Please try again.");
      }
    } catch {
      setErrorMessage("Network error deleting task.");
    } finally {
      setIsDeletingTask(false);
    }
  }

  async function handleAddTask(teamId: string, event: React.FormEvent) {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!title || isSubmitting) return;

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const response = await fetch(`/api/teams/${teamId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data?.error || "Unable to create task.");
        return;
      }

      if (data.task) {
        const created: TaskItem = {
          id: data.task.id,
          title: data.task.title,
          completed: data.task.completed,
          teamId,
          createdAt: data.task.createdAt,
        };

        setGroups((current) =>
          current.map((g) =>
            g.teamId === teamId
              ? {
                  ...g,
                  tasks: [created, ...g.tasks],
                }
              : g,
          ),
        );
        setNewTaskTitle("");
        setAddingTeamId(null);
      }
    } catch {
      setErrorMessage("Something went wrong creating task.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <DesktopSidebar />

      <main className="min-h-dvh ml-20 px-3 py-3 md:ml-[128px] md:px-0 md:py-[30px] md:pr-6">
        <section className="min-h-[calc(100dvh-24px)] rounded-[20px] bg-dashboard-surface px-4 py-5 md:min-h-[calc(100dvh-60px)] md:rounded-[24px] md:px-6 md:py-7 lg:px-6">
          {/* Header */}
          <header className="flex items-center justify-between">
            <h1 className="text-[20px] font-semibold tracking-tight text-foreground md:text-[30px]">
              Tasks
            </h1>
          </header>

          {/* Search bar */}
          <div className="mt-4 flex items-center gap-3 md:mt-5 md:max-w-[460px] md:gap-4">
            <div className="relative min-w-0 flex-1">
              <Input
                aria-label="Search Tasks"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Tasks"
                className="h-12 rounded-full border-2 border-foreground bg-background px-5 pr-11 text-sm text-foreground placeholder:text-muted-foreground md:h-[58px] md:px-6 md:pr-12 md:text-lg"
              />
              <Search
                className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-foreground md:right-6"
                size={18}
              />
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="mt-4 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {errorMessage}
            </div>
          )}

          {/* Task Groups */}
          <div className="mt-6 space-y-6 md:mt-8 md:space-y-8">
            {filteredGroups.map((group) => (
              <div
                key={group.teamId}
                className="rounded-[22px] border-2 border-[#22C55E] bg-background/40 p-4 md:p-5"
              >
                {/* Group Header */}
                <div className="flex items-center justify-between pb-3">
                  <Link
                    href={`/teams/${group.teamId}`}
                    className="group flex items-center gap-2.5 text-foreground transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <Users
                      className="size-5 shrink-0 text-foreground"
                      strokeWidth={1.8}
                    />
                    <span className="text-sm font-semibold tracking-tight text-foreground md:text-base">
                      {group.teamName} - {group.channelName}
                    </span>
                  </Link>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Add task to ${group.teamName}`}
                      onClick={() => {
                        setAddingTeamId(
                          addingTeamId === group.teamId ? null : group.teamId,
                        );
                        setNewTaskTitle("");
                      }}
                      className="flex size-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Plus className="size-4" strokeWidth={2} />
                    </button>
                    <Link
                      href={`/teams/${group.teamId}`}
                      aria-label={`Open ${group.teamName}`}
                      className="text-foreground transition-transform hover:translate-x-0.5"
                    >
                      <ChevronRight className="size-5" strokeWidth={2} />
                    </Link>
                  </div>
                </div>

                {/* Inline Add Task Form */}
                {addingTeamId === group.teamId && (
                  <form
                    onSubmit={(e) => handleAddTask(group.teamId, e)}
                    className="mb-3 flex items-center gap-2 pt-1"
                  >
                    <Input
                      autoFocus
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Add task title..."
                      maxLength={200}
                      disabled={isSubmitting}
                      className="h-10 rounded-xl border-border bg-background px-3 text-sm"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !newTaskTitle.trim()}
                      className="flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                      {isSubmitting ? "Adding..." : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddingTeamId(null)}
                      className="flex size-10 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted"
                    >
                      <X className="size-4" />
                    </button>
                  </form>
                )}

                {/* Task items */}
                <div className="space-y-2.5">
                  {group.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`group/task flex w-full items-center justify-between gap-3.5 rounded-2xl border border-emerald-500/20 bg-[#E4FFEC] px-4 py-3.5 transition-colors hover:bg-[#D5F5E0] dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 md:px-5 md:py-4 ${
                        task.completed ? "opacity-75" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleTask(
                            group.teamId,
                            task.id,
                            task.completed,
                          )
                        }
                        className="flex min-w-0 flex-1 items-center gap-3.5 text-left focus-visible:outline-2 focus-visible:outline-primary"
                      >
                        {task.completed ? (
                          <CheckCircle2
                            className="size-6 shrink-0 text-[#22C55E]"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        ) : (
                          <Circle
                            className="size-6 shrink-0 text-[#22C55E]"
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        )}

                        <span
                          className={`min-w-0 flex-1 text-sm font-semibold text-[#16A34A] dark:text-emerald-300 md:text-base ${
                            task.completed ? "line-through opacity-80" : ""
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
                        onClick={(e) => {
                          e.stopPropagation();
                          setTaskToDelete({
                            teamId: group.teamId,
                            taskId: task.id,
                            title: task.title,
                          });
                        }}
                        className="flex size-8 shrink-0 items-center justify-center rounded-lg text-emerald-800/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover/task:opacity-100 dark:text-emerald-300/40"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}

                  {group.tasks.length === 0 && (
                    <div className="rounded-xl bg-muted/40 py-6 text-center text-xs text-muted-foreground md:text-sm">
                      No tasks yet. Click + to add one.
                    </div>
                  )}
                </div>
              </div>
            ))}

            {filteredGroups.length === 0 && (
              <div className="mt-16 flex flex-col items-center text-center">
                <div className="flex size-16 items-center justify-center rounded-2xl bg-muted">
                  <CheckCircle2
                    className="size-8 text-muted-foreground"
                    strokeWidth={1.5}
                  />
                </div>
                <h2 className="mt-4 text-lg font-semibold text-foreground">
                  {searchQuery ? "No matching tasks" : "No tasks yet"}
                </h2>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  {searchQuery
                    ? "Try searching for a different keyword."
                    : "Create a team and add tasks to start tracking your progress."}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

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
                onClick={handleConfirmDeleteTask}
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
