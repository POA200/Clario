"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronRight,
  Flame,
  Heart,
  Layers,
  MessageSquare,
  Moon,
  PanelBottom,
  PanelLeft,
  Rocket,
  ShieldCheck,
  Sparkles,
  Sun,
  UserRound,
  Users,
  Zap,
} from "lucide-react";
import { ClarioLogo } from "@/components/common/ClarioLogo";
import { cn } from "@/lib/utils";

export function OnboardingScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Interactive state for Slide 1 (Chat reactions)
  const [reactions, setReactions] = useState<{ [key: string]: number }>({
    "🚀": 5,
    "✨": 3,
    "❤️": 4,
  });
  const [userReacted, setUserReacted] = useState<{ [key: string]: boolean }>({
    "🚀": true,
  });

  // Interactive state for Slide 2 (Task items)
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Finalize mobile navigation",
      done: true,
      priority: "High",
    },
    {
      id: 2,
      title: "Review team launch assets",
      done: true,
      priority: "Medium",
    },
    {
      id: 3,
      title: "Ship product v1.0 release",
      done: false,
      priority: "Urgent",
    },
  ]);

  // Interactive state for Slide 3 (Feature Preview)
  const [previewTheme, setPreviewTheme] = useState<"dark" | "light">("dark");
  const [previewNav, setPreviewNav] = useState<"bottom" | "sidebar">("bottom");

  // Touch swipe support
  const touchStartXRef = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartXRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartXRef.current === null) return;
    const diffX = touchStartXRef.current - e.changedTouches[0].clientX;
    const minSwipeDistance = 50;

    if (diffX > minSwipeDistance && currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else if (diffX < -minSwipeDistance && currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
    touchStartXRef.current = null;
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight" && currentSlide < TOTAL_SLIDES - 1) {
        setCurrentSlide((prev) => prev + 1);
      } else if (e.key === "ArrowLeft" && currentSlide > 0) {
        setCurrentSlide((prev) => prev - 1);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide]);

  const TOTAL_SLIDES = 4;

  function toggleReaction(emoji: string) {
    setUserReacted((prev) => {
      const isAlready = !!prev[emoji];
      setReactions((rPrev) => ({
        ...rPrev,
        [emoji]: (rPrev[emoji] || 0) + (isAlready ? -1 : 1),
      }));
      return { ...prev, [emoji]: !isAlready };
    });
  }

  function toggleTask(id: number) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)),
    );
  }

  function nextSlide() {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      router.push("/register");
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  }

  return (
    <main
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-dvh bg-background p-3 sm:p-5 md:p-8 flex items-center justify-center select-none"
    >
      <div className="relative flex min-h-[calc(100dvh-1.5rem)] sm:min-h-[calc(100dvh-2.5rem)] md:min-h-[640px] w-full max-w-4xl flex-col justify-between overflow-hidden rounded-[28px] sm:rounded-[36px] bg-gradient-to-br from-[#2511BF] via-[#2F1AC4] to-[#170B7E] p-6 sm:p-8 md:p-10 text-white shadow-2xl">
        {/* Background ambient lighting effects */}
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 sm:size-96 rounded-full bg-[#6C50FF]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 size-80 sm:size-96 rounded-full bg-[#100757]/60 blur-3xl" />
        <div className="pointer-events-none absolute left-1/2 top-1/3 size-64 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />

        {/* Top Header */}
        <header className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClarioLogo inverse />
          </div>

          <div className="flex items-center gap-2">
            {currentSlide < TOTAL_SLIDES - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentSlide(TOTAL_SLIDES - 1)}
                className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
              >
                Skip
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white/90 backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
              >
                Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Main Interactive Slide Content */}
        <div className="relative z-10 my-auto py-6 sm:py-8 flex flex-col items-center">
          {/* SLIDE 0: Welcome & Overview */}
          {currentSlide === 0 && (
            <div className="w-full max-w-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
              {/* Interactive workspace tags preview */}
              <div className="mx-auto flex flex-wrap items-center justify-center gap-2.5 max-w-sm">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs backdrop-blur-md transition-transform hover:scale-105 cursor-default">
                  <Users className="size-3.5 text-white/90" />
                  <span>Team Workspaces</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs backdrop-blur-md transition-transform hover:scale-105 cursor-default">
                  <MessageSquare className="size-3.5 text-white/90" />
                  <span>#general</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-3.5 py-1.5 text-xs font-medium shadow-xs backdrop-blur-md transition-transform hover:scale-105 cursor-default">
                  <Sparkles className="size-3.5" />
                  <span>Real-time Sync</span>
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs backdrop-blur-md transition-transform hover:scale-105 cursor-default">
                  <CheckCircle2 className="size-3.5 text-white/90" />
                  <span>Sprint Goals</span>
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Collaborate seamlessly, <br />
                  <span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                    build faster.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-white/80 max-w-md mx-auto leading-relaxed">
                  The modern all-in-one platform for team discussions, direct
                  messages, project tasks, and synchronized workflow.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 1: Channels & Direct Messages */}
          {currentSlide === 1 && (
            <div className="w-full max-w-lg space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              {/* Interactive simulated message card */}
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 sm:p-5 backdrop-blur-lg shadow-xl text-left space-y-3">
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-white/20 flex items-center justify-center font-bold text-sm">
                    JD
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm">
                        Jordan Doe
                      </span>
                      <span className="text-[10px] text-white/60">@jordan</span>
                      <span className="text-[10px] text-white/40">
                        10:42 AM
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-white/90 mt-0.5">
                      Check out the updated channel prototype! Ready for review{" "}
                      <span className="text-white font-semibold underline decoration-white/40">
                        @team
                      </span>{" "}
                      🎉
                    </p>
                  </div>
                </div>

                {/* Interactive reaction buttons */}
                <div className="flex items-center gap-2 pt-1">
                  {Object.entries(reactions).map(([emoji, count]) => {
                    const isSelected = userReacted[emoji];
                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => toggleReaction(emoji)}
                        className={cn(
                          "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer active:scale-90",
                          isSelected
                            ? "bg-white text-[#2F1AC4] shadow-sm font-bold scale-105"
                            : "bg-white/15 text-white/90 hover:bg-white/25",
                        )}
                        aria-label={`React with ${emoji}`}
                      >
                        <span>{emoji}</span>
                        <span>{count}</span>
                      </button>
                    );
                  })}
                  <span className="text-[11px] text-white/60 ml-auto hidden sm:inline italic">
                    Tap to react
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Rich Team Channels & DMs
                </h2>
                <p className="text-xs sm:text-sm text-white/80 max-w-sm mx-auto leading-relaxed">
                  Dedicated topic channels, one-on-one direct messaging, fast
                  @mentions, and instant emoji reactions.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 2: Task Tracking & Productivity */}
          {currentSlide === 2 && (
            <div className="w-full max-w-lg space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              {/* Interactive task checklist preview */}
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 sm:p-5 backdrop-blur-lg shadow-xl text-left space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-white/15 text-xs text-white/80">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">
                    Team Tasks (Interactive)
                  </span>
                  <span>
                    {tasks.filter((t) => t.done).length}/{tasks.length}{" "}
                    Completed
                  </span>
                </div>

                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={cn(
                      "flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all",
                      task.done
                        ? "bg-white/10 opacity-75"
                        : "bg-white/20 hover:bg-white/25",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={cn(
                          "size-5 rounded-md flex items-center justify-center border transition-colors",
                          task.done
                            ? "bg-emerald-400 border-emerald-400 text-black font-bold"
                            : "border-white/50 bg-white/10",
                        )}
                      >
                        {task.done && <Check className="size-3.5 stroke-[3]" />}
                      </div>
                      <span
                        className={cn(
                          "text-xs sm:text-sm font-medium truncate",
                          task.done
                            ? "line-through text-white/70"
                            : "text-white",
                        )}
                      >
                        {task.title}
                      </span>
                    </div>

                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ml-2",
                        task.priority === "Urgent"
                          ? "bg-rose-500/30 text-rose-200 border border-rose-400/30"
                          : "bg-white/15 text-white/80",
                      )}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Integrated Task Management
                </h2>
                <p className="text-xs sm:text-sm text-white/80 max-w-sm mx-auto leading-relaxed">
                  Turn conversations directly into actionable items. Track team
                  progress and deadlines in real-time.
                </p>
              </div>
            </div>
          )}

          {/* SLIDE 3: Customization & Offline Ready */}
          {currentSlide === 3 && (
            <div className="w-full max-w-lg space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
              {/* Interactive customization preview */}
              <div className="rounded-2xl border border-white/20 bg-white/10 p-4 sm:p-5 backdrop-blur-lg shadow-xl text-left space-y-3.5">
                <div className="text-xs font-semibold uppercase tracking-wider text-white/80 text-[10px]">
                  Personalize Your Workspace
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Theme selector preview */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-white/70 block">
                      Theme
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewTheme("dark")}
                        className={cn(
                          "flex items-center justify-center gap-1 rounded-xl p-2 text-xs font-semibold transition-all",
                          previewTheme === "dark"
                            ? "bg-white text-[#2F1AC4] shadow-md font-bold"
                            : "bg-white/10 text-white/80 hover:bg-white/20",
                        )}
                      >
                        <Moon className="size-3.5" />
                        <span>Dark</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewTheme("light")}
                        className={cn(
                          "flex items-center justify-center gap-1 rounded-xl p-2 text-xs font-semibold transition-all",
                          previewTheme === "light"
                            ? "bg-white text-[#2F1AC4] shadow-md font-bold"
                            : "bg-white/10 text-white/80 hover:bg-white/20",
                        )}
                      >
                        <Sun className="size-3.5" />
                        <span>Light</span>
                      </button>
                    </div>
                  </div>

                  {/* Navigation selector preview */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-medium text-white/70 block">
                      Mobile Nav
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPreviewNav("bottom")}
                        className={cn(
                          "flex items-center justify-center gap-1 rounded-xl p-2 text-xs font-semibold transition-all",
                          previewNav === "bottom"
                            ? "bg-white text-[#2F1AC4] shadow-md font-bold"
                            : "bg-white/10 text-white/80 hover:bg-white/20",
                        )}
                      >
                        <PanelBottom className="size-3.5" />
                        <span>Bottom</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewNav("sidebar")}
                        className={cn(
                          "flex items-center justify-center gap-1 rounded-xl p-2 text-xs font-semibold transition-all",
                          previewNav === "sidebar"
                            ? "bg-white text-[#2F1AC4] shadow-md font-bold"
                            : "bg-white/10 text-white/80 hover:bg-white/20",
                        )}
                      >
                        <PanelLeft className="size-3.5" />
                        <span>Sidebar</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-200 bg-emerald-500/20 rounded-xl px-3 py-2 border border-emerald-400/30">
                  <Zap className="size-4 shrink-0 text-emerald-300" />
                  <span>Offline-ready PWA with instant push notifications</span>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Ready When You Are
                </h2>
                <p className="text-xs sm:text-sm text-white/80 max-w-sm mx-auto leading-relaxed">
                  Get started in seconds. Create your team or join your
                  workspace with an invite link.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Controls & Action Bar */}
        <footer className="relative z-10 flex flex-col items-center gap-4 sm:gap-6 pt-4">
          {/* Step Indicator Dots */}
          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL_SLIDES }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  currentSlide === i
                    ? "w-8 bg-white shadow-xs"
                    : "w-2 bg-white/40 hover:bg-white/60",
                )}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="w-full max-w-sm space-y-2.5">
            {currentSlide < TOTAL_SLIDES - 1 ? (
              <div className="flex items-center gap-3 w-full">
                {currentSlide > 0 && (
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous step"
                    className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-all hover:bg-white/25 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <ArrowLeft className="size-5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={nextSlide}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white font-bold text-[#2F1AC4] shadow-lg transition-all hover:bg-white/90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  <span>Continue</span>
                  <ArrowRight className="size-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 w-full">
                <div className="flex items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous step"
                    className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/15 text-white transition-all hover:bg-white/25 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
                  >
                    <ArrowLeft className="size-5" />
                  </button>

                  <Link
                    href="/register"
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white font-bold text-[#2F1AC4] shadow-lg transition-all hover:bg-white/90 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white text-base"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="size-4.5" />
                  </Link>
                </div>

                <Link
                  href="/login"
                  className="flex h-11 w-full items-center justify-center rounded-full border border-white/25 bg-white/10 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 active:scale-95 focus-visible:outline-2 focus-visible:outline-white"
                >
                  <span>Already have an account? Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </footer>
      </div>
    </main>
  );
}
