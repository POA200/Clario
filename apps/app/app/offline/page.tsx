"use client";

import Image from "next/image";
import { RefreshCw, WifiOff } from "lucide-react";

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center bg-background">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-6">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <Image
            src="/Clario_logomark.svg"
            alt="Clario Logo"
            width={48}
            height={48}
            priority
            className="h-12 w-12"
          />
          <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm">
            <WifiOff className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            You&apos;re currently offline
          </h1>
          <p className="text-sm text-muted-foreground">
            Clario requires an active internet connection to sync messages and
            team updates.
          </p>
        </div>

        <div className="w-full pt-2">
          <button
            type="button"
            onClick={handleRetry}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary active:scale-[0.99]"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry connection</span>
          </button>
        </div>
      </div>
    </div>
  );
}
