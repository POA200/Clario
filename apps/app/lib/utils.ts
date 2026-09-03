import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a fallback username in the format "user(number(s))" (e.g. user10482)
 * when a user hasn't set a username.
 */
export function getDefaultUsername(id?: string | null): string {
  if (!id) return "user1001";
  const digits = id.replace(/\D/g, "");
  if (digits.length >= 4) {
    return `user${digits.slice(0, 6)}`;
  }
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  const positiveHash = (Math.abs(hash) % 90000) + 10000;
  return `user${positiveHash}`;
}

/**
 * Formats a display username with leading '@' symbol.
 * Falls back to "@user(number(s))" if no username is set.
 */
export function formatDisplayUsername(
  username?: string | null,
  id?: string | null,
): string {
  if (username && username.trim()) {
    const clean = username.trim().replace(/^@+/, "");
    return `@${clean}`;
  }
  return `@${getDefaultUsername(id)}`;
}

/**
 * Formats a display name.
 * Falls back to username or "user(number(s))" if name is not set.
 */
export function formatDisplayName(
  name?: string | null,
  username?: string | null,
  id?: string | null,
): string {
  if (name && name.trim()) {
    return name.trim();
  }
  if (username && username.trim()) {
    return username.trim().replace(/^@+/, "");
  }
  return getDefaultUsername(id);
}
