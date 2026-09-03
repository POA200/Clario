"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Heart,
  MessageSquare,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";

import { ClarioLogo } from "@/components/common/ClarioLogo";

export function AboutScreen() {
  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-md px-5 py-6 md:py-10 space-y-6">
        {/* Header */}
        <header className="flex items-center gap-3">
          <Link
            href="/settings"
            aria-label="Back to Settings"
            className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ArrowLeft className="size-6" strokeWidth={2.2} />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            About Clario
          </h1>
        </header>

        {/* Hero Card */}
        <div className="rounded-[28px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6 text-center space-y-4">
          <div className="flex justify-center py-2">
            <ClarioLogo />
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#2F1AC4]/10 dark:bg-primary/20 px-3.5 py-1 text-xs font-semibold text-[#2F1AC4] dark:text-primary-foreground">
            <Sparkles className="size-3.5" />
            <span>Version 1.0.0 (Build 2026.09)</span>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Clario is a modern team collaboration platform designed for clarity,
            focus, and high-velocity workflows. Real-time channels, direct
            messaging, and task coordination in one seamless workspace.
          </p>
        </div>

        {/* Core Pillars */}
        <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-5 space-y-4">
          <h2 className="text-base font-bold text-foreground">Why Clario?</h2>

          <div className="space-y-3.5">
            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#2F1AC4]/15 text-[#2F1AC4] dark:bg-primary/20 dark:text-primary">
                <MessageSquare className="size-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-foreground">
                  Focused Communication
                </h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Organized channels and fast direct messages to keep
                  discussions clear and contextual.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#2F1AC4]/15 text-[#2F1AC4] dark:bg-primary/20 dark:text-primary">
                <Zap className="size-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-foreground">
                  Integrated Task Execution
                </h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  Turn conversations into trackable tasks without switching
                  between disconnected apps.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#2F1AC4]/15 text-[#2F1AC4] dark:bg-primary/20 dark:text-primary">
                <Shield className="size-4" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-semibold text-foreground">
                  Security & Privacy First
                </h3>
                <p className="text-xs text-muted-foreground leading-normal">
                  End-to-end encrypted transport, secure session management, and
                  strict data isolation.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Legal & Agreements Card */}
        <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-5 space-y-3">
          <h2 className="text-base font-bold text-foreground">
            Legal & Policies
          </h2>

          <div className="divide-y divide-border/60">
            <Link
              href="/privacy-policy"
              className="flex items-center justify-between py-3 text-left transition-opacity hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <Shield className="size-4 text-foreground/80" />
                <span className="text-sm font-semibold text-foreground">
                  Privacy Policy
                </span>
              </div>
              <ChevronRight className="size-5 text-foreground/70" />
            </Link>

            <Link
              href="/terms-of-service"
              className="flex items-center justify-between py-3 pt-3.5 text-left transition-opacity hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <FileText className="size-4 text-foreground/80" />
                <span className="text-sm font-semibold text-foreground">
                  Terms of Service
                </span>
              </div>
              <ChevronRight className="size-5 text-foreground/70" />
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center pt-2 pb-6 space-y-1">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <span>Crafted for high-performing teams</span>
            <Heart className="size-3 text-rose-500 fill-rose-500 inline" />
          </p>
          <p className="text-[11px] text-muted-foreground/80">
            © {new Date().getFullYear()} Clario Inc. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  );
}
