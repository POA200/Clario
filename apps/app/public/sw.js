/**
 * Clario Service Worker
 * Designed for real-time team messaging PWA.
 * Safe caching: NEVER caches dynamic API, auth, or private database payloads.
 */

const CACHE_VERSION = "clario-v1.0.0";
const STATIC_CACHE_NAME = `clario-static-${CACHE_VERSION}`;
const PAGES_CACHE_NAME = `clario-pages-${CACHE_VERSION}`;

// Core static assets to precache on install
const PRECACHE_ASSETS = [
  "/offline",
  "/clario-app-logo.svg",
  "/Clario_logomark.svg",
  "/clario_logo.svg",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/icons/icon-512x512-maskable.png",
  "/apple-touch-icon.png",
  "/favicon.ico",
  "/manifest.webmanifest",
];

// Install Event - Precache offline page and essential branding assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate Event - Clean up stale caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith("clario-") && name !== STATIC_CACHE_NAME && name !== PAGES_CACHE_NAME)
            .map((name) => caches.delete(name)),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch Event - Safe routing & caching strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Never intercept non-GET requests (e.g. POST, PUT, DELETE)
  if (request.method !== "GET") {
    return;
  }

  // 2. Never cache or intercept API routes, NextAuth routes, or third-party auth
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/") ||
    url.hostname.includes("google") ||
    url.hostname.includes("neon")
  ) {
    // Network-only
    return;
  }

  // 3. Static Assets (_next/static, icons, images, fonts, svgs) -> Stale-While-Revalidate / Cache-First
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".ico") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached and update in background if appropriate
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
                const responseToCache = networkResponse.clone();
                caches.open(STATIC_CACHE_NAME).then((cache) => {
                  cache.put(request, responseToCache);
                });
              }
            })
            .catch(() => {
              // Ignore background fetch failures
            });
          return cachedResponse;
        }

        // Not in cache: fetch from network and store in static cache
        return fetch(request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(STATIC_CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return networkResponse;
        });
      }),
    );
    return;
  }

  // 4. HTML Page Navigations -> Network-First with Offline Fallback
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If successful, return the live page
          return networkResponse;
        })
        .catch(async () => {
          // When offline, try cache first, then fallback to precached /offline page
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            return cachedPage;
          }
          const offlineFallback = await caches.match("/offline");
          if (offlineFallback) {
            return offlineFallback;
          }
          return new Response("Offline. Please check your internet connection.", {
            headers: { "Content-Type": "text/plain" },
            status: 503,
          });
        }),
    );
    return;
  }
});

// Push Notifications Event
self.addEventListener("push", (event) => {
  let payload = {
    title: "Clario",
    body: "You have a new update",
    url: "/notifications",
  };

  if (event.data) {
    try {
      payload = event.data.json();
    } catch {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body || "New activity in your Clario workspace",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/icon-192x192.png",
    vibrate: [100, 50, 100],
    data: {
      url: payload.url || "/notifications",
    },
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || "Clario", options),
  );
});

// Notification Click Event - Opens or focuses Clario
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/notifications";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          if (client.url.includes(targetUrl)) {
            return client.focus();
          }
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    }),
  );
});

