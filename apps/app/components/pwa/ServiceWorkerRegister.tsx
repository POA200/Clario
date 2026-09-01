"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            // Check for updates on page load
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (
                    installingWorker.state === "installed" &&
                    navigator.serviceWorker.controller
                  ) {
                    // New content is available; will be used on next refresh
                    console.info("[Clario PWA] New update available.");
                  }
                };
              }
            };
          })
          .catch((error) => {
            console.error(
              "[Clario PWA] Service Worker registration failed:",
              error,
            );
          });
      });
    }
  }, []);

  return null;
}
