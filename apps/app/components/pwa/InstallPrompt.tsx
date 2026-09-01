"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window !== "undefined") {
      return (
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
          true
      );
    }
    return false;
  });
  const [isIOS] = useState(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return (
        /iphone|ipad|ipod/.test(userAgent) &&
        !(window.navigator as unknown as { standalone?: boolean }).standalone
      );
    }
    return false;
  });
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check standalone mode
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true;

    if (isStandaloneMode) return;

    // Check if dismissed recently (within 7 days)
    const dismissedAt = localStorage.getItem("clario_pwa_dismissed_at");
    if (dismissedAt) {
      const daysSinceDismiss =
        (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismiss < 7) {
        return;
      }
    }

    if (isIOS) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 4000);
      return () => clearTimeout(timer);
    }

    // Capture beforeinstallprompt for Chrome / Edge / Android
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      setIsStandalone(true);
      localStorage.removeItem("clario_pwa_dismissed_at");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isIOS]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.error("[Clario PWA] Install prompt error:", err);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("clario_pwa_dismissed_at", Date.now().toString());
  };

  if (!showPrompt || isStandalone) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Install Clario App"
      className="fixed bottom-20 left-4 right-4 z-40 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 md:bottom-6 md:left-auto md:right-6"
    >
      <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-background/95 p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Image
                src="/Clario_logomark.svg"
                alt="Clario"
                width={28}
                height={28}
                className="h-7 w-7"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Install Clario
              </h3>
              <p className="text-xs text-muted-foreground">
                Quick access & native app experience on your device
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install prompt"
            className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {isIOS ? (
          <div className="flex items-center gap-2 rounded-xl bg-muted/60 p-2.5 text-xs text-foreground">
            <Share className="h-4 w-4 shrink-0 text-primary" />
            <span>
              Tap <strong className="font-semibold">Share</strong> then select{" "}
              <strong className="font-semibold">
                &quot;Add to Home Screen&quot;
              </strong>
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-1.5 text-xs font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-primary active:scale-95"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Install App</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
