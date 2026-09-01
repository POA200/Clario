"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Lock,
  LogOut,
  Moon,
  Palette,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";

import { Input } from "@/components/ui/input";
import type { UserSettings } from "@/services/settings-service";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
};

function Switch({
  checked,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-[#2F1AC4]" : "bg-[#9CA3AF]/50"
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

type SettingsScreenProps = {
  initialSettings: UserSettings;
};

export function SettingsScreen({ initialSettings }: SettingsScreenProps) {
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings>(initialSettings);
  const { user, preferences } = settings;

  // Notification states
  const [receiveTaskUpdates, setReceiveTaskUpdates] = useState(
    preferences.receiveTaskUpdates,
  );
  const [receiveAnnouncements, setReceiveAnnouncements] = useState(
    preferences.receiveAnnouncements,
  );
  const [emailNotifications, setEmailNotifications] = useState(
    preferences.emailNotifications,
  );

  // Appearance states
  const [theme, setTheme] = useState(preferences.theme);
  const [accentColor, setAccentColor] = useState(preferences.accentColor);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Security states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    preferences.twoFactorEnabled,
  );
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  const displayName = user.name || "Peter";
  const displayUsername = user.username ? `@${user.username}` : "@iPeter_crx";

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  }

  async function updatePreference(
    key: keyof UserSettings["preferences"],
    value: any,
  ) {
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [key]: value }),
      });

      if (!response.ok) {
        showToast("Failed to save setting");
      }
    } catch {
      showToast("Network error saving setting");
    }
  }

  function handleTaskUpdatesToggle(val: boolean) {
    setReceiveTaskUpdates(val);
    updatePreference("receiveTaskUpdates", val);
  }

  function handleAnnouncementsToggle(val: boolean) {
    setReceiveAnnouncements(val);
    updatePreference("receiveAnnouncements", val);
  }

  function handleEmailNotificationsToggle(val: boolean) {
    setEmailNotifications(val);
    updatePreference("emailNotifications", val);
  }

  function handleTwoFactorToggle(val: boolean) {
    setTwoFactorEnabled(val);
    updatePreference("twoFactorEnabled", val);
    showToast(
      val
        ? "Two-Factor Authentication enabled"
        : "Two-Factor Authentication disabled",
    );
  }

  function handleThemeToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    updatePreference("theme", nextTheme);
  }

  function handleAccentColorChange(color: string) {
    setAccentColor(color);
    setShowColorPicker(false);
    updatePreference("accentColor", color);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Please fill out all fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/settings/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPasswordError(data?.error || "Failed to change password.");
        return;
      }

      setPasswordSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setShowChangePassword(false);
        setPasswordSuccess("");
      }, 1500);
    } catch {
      setPasswordError("An unexpected error occurred.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-md px-5 py-6 md:py-10">
        {/* Header */}
        <header className="flex items-center gap-3">
          <Link
            href="/profile"
            aria-label="Go back to Profile"
            className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
          >
            <ArrowLeft className="size-6" strokeWidth={2.2} />
          </Link>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Settings
          </h1>
        </header>

        {toastMessage && (
          <div
            role="status"
            className="mt-4 rounded-xl bg-primary/10 px-4 py-2.5 text-xs font-semibold text-primary"
          >
            {toastMessage}
          </div>
        )}

        <div className="mt-6 space-y-4">
          {/* User Profile Preview Card (media_1788280260819.png) */}
          <Link
            href="/profile"
            className="flex items-center justify-between rounded-[22px] border border-[#D5CAFE]/60 bg-[#EAE6FE] p-4 transition-opacity hover:opacity-95"
          >
            <div className="flex items-center gap-3.5">
              <div className="flex size-12 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={displayName}
                    className="size-full object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-[#E5E7EB] text-primary">
                    <UserRound className="size-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-base font-bold text-foreground">
                  {displayName}
                </h2>
                <p className="text-xs font-medium text-muted-foreground">
                  {displayUsername}
                </p>
              </div>
            </div>

            <ChevronRight className="size-5 text-foreground" />
          </Link>

          {/* Notifications Card */}
          <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] p-5 space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-foreground">
              <Bell className="size-5" />
              <span>Notifications</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">
                Receive task updates
              </span>
              <Switch
                checked={receiveTaskUpdates}
                onChange={handleTaskUpdatesToggle}
                aria-label="Receive task updates"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">
                Receive announcements
              </span>
              <Switch
                checked={receiveAnnouncements}
                onChange={handleAnnouncementsToggle}
                aria-label="Receive announcements"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">
                Email notifications
              </span>
              <Switch
                checked={emailNotifications}
                onChange={handleEmailNotificationsToggle}
                aria-label="Email notifications"
              />
            </div>
          </div>

          {/* Appearance Card */}
          <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] p-5 space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-foreground">
              <Palette className="size-5" />
              <span>Appearance</span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">Theme</span>
              <button
                type="button"
                onClick={handleThemeToggle}
                aria-label="Toggle theme"
                className="flex size-9 items-center justify-center rounded-full text-foreground transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-primary"
              >
                {theme === "dark" ? (
                  <Moon className="size-5 text-foreground" />
                ) : (
                  <Sun className="size-5 text-foreground" />
                )}
              </button>
            </div>

            <div className="relative flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">
                Ascent color
              </span>
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                aria-label="Change accent color"
                className="flex size-6 items-center justify-center rounded-md border border-white/60 shadow-sm transition-transform hover:scale-110"
                style={{ backgroundColor: accentColor }}
              />

              {showColorPicker && (
                <div className="absolute right-0 top-8 z-30 flex gap-2 rounded-xl border border-border bg-background p-2 shadow-lg">
                  {[
                    "#2F1AC4",
                    "#2563EB",
                    "#059669",
                    "#D97706",
                    "#DC2626",
                    "#7C3AED",
                  ].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => handleAccentColorChange(c)}
                      className="size-6 rounded-md border border-white"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Security Card */}
          <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] p-5 space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-foreground">
              <Lock className="size-5" />
              <span>Security</span>
            </div>

            <button
              type="button"
              onClick={() => setShowChangePassword(true)}
              className="flex w-full items-center justify-between text-left transition-opacity hover:opacity-80"
            >
              <span className="text-sm font-semibold text-foreground">
                Change Password
              </span>
              <ChevronRight className="size-5 text-foreground" />
            </button>

            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">
                Two-Factor Authentication
              </span>
              <Switch
                checked={twoFactorEnabled}
                onChange={handleTwoFactorToggle}
                aria-label="Two-Factor Authentication"
              />
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#DC2626] py-4 text-base font-semibold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-destructive"
          >
            <LogOut className="size-5" />
            <span>Logout</span>
          </button>
        </div>

        {/* Change Password Modal / Sheet (media_1788280268257.png) */}
        {showChangePassword && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                setShowChangePassword(false);
                setPasswordError("");
                setPasswordSuccess("");
              }
            }}
          >
            <form
              onSubmit={handleChangePassword}
              className="w-full max-w-md rounded-[28px] border-2 border-[#2F1AC4] bg-background p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-foreground">
                  Change Password
                </h2>
                <button
                  type="button"
                  onClick={() => setShowChangePassword(false)}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="size-5" />
                </button>
              </div>

              {passwordSuccess && (
                <div
                  role="status"
                  className="flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3.5 py-2 text-xs font-semibold text-emerald-600"
                >
                  <Check className="size-4" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              {passwordError && (
                <div
                  role="alert"
                  className="rounded-xl bg-destructive/10 px-3.5 py-2 text-xs font-semibold text-destructive"
                >
                  {passwordError}
                </div>
              )}

              <div>
                <label
                  htmlFor="curr-pwd"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Current Password
                </label>
                <Input
                  id="curr-pwd"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="************"
                  className="h-12 rounded-xl border border-input bg-background px-4 text-base"
                />
              </div>

              <div>
                <label
                  htmlFor="new-pwd"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  New Password
                </label>
                <Input
                  id="new-pwd"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="************"
                  className="h-12 rounded-xl border border-input bg-background px-4 text-base"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-pwd"
                  className="mb-1 block text-sm font-medium text-foreground"
                >
                  Confirm New Password
                </label>
                <Input
                  id="confirm-pwd"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="************"
                  className="h-12 rounded-xl border border-input bg-background px-4 text-base"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPassword}
                className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#2F1AC4] py-4 text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isChangingPassword ? "Updating..." : "Change Password"}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
