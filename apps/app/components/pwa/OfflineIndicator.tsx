"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, WifiOff, X } from "lucide-react";

export function OfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check status after client mount
    if (!navigator.onLine) {
      setIsOffline(true);
    } else {
      setIsOffline(false);
    }

    const handleOnline = () => {
      setIsOffline(false);
      setIsDismissed(false);
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setIsDismissed(false);
      setShowReconnected(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isDismissed || (!isOffline && !showReconnected)) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed top-4 inset-x-0 z-50 flex justify-center px-4 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      {isOffline ? (
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-destructive/95 px-4 py-1.5 text-xs font-medium text-destructive-foreground shadow-lg backdrop-blur">
          <WifiOff className="h-3.5 w-3.5 shrink-0" />
          <span>You are currently offline. Changes will sync when reconnected.</span>
          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss offline warning"
            className="ml-1 rounded-full p-0.5 hover:bg-black/20 text-destructive-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="pointer-events-auto flex items-center gap-2.5 rounded-full bg-emerald-600/95 px-4 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>Back online. Connection restored.</span>
        </div>
      )}
    </div>
  );
}
