"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Compass,
  Info,
  Lock,
  LogOut,
  Moon,
  Palette,
  PanelBottom,
  PanelLeft,
  Sun,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordValidityIndicator } from "@/components/ui/password-validity";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useNavigation } from "@/components/navigation/NavigationProvider";
import { cn, formatDisplayName, formatDisplayUsername } from "@/lib/utils";
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
  const [pushNotifications, setPushNotifications] = useState(
    preferences.emailNotifications,
  );

  const { setTheme: globalSetTheme } = useTheme();
  const { mobileNav, setMobileNav } = useNavigation();

  // Appearance states
  const [theme, setTheme] = useState(preferences.theme);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "dark" || savedTheme === "light") {
        setTheme(savedTheme);
      }
    } catch {}
  }, []);

  // Security states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [toastMessage, setToastMessage] = useState("");
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const displayName = formatDisplayName(user.name, user.username, user.id);
  const displayUsername = formatDisplayUsername(user.username, user.id);

  async function handleDeleteAccount() {
    setIsDeletingAccount(true);
    setDeleteError("");

    try {
      const response = await fetch("/api/user/profile", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setDeleteError(data?.error || "Failed to delete account.");
        setIsDeletingAccount(false);
        return;
      }

      await signOut({ callbackUrl: "/login" });
    } catch {
      setDeleteError("An unexpected network error occurred. Please try again.");
      setIsDeletingAccount(false);
    }
  }

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

  async function handlePushNotificationsToggle(val: boolean) {
    if (val && typeof window !== "undefined" && "Notification" in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          showToast("Push notification permission denied in browser");
          setPushNotifications(false);
          return;
        }
      } catch {
        // Ignore
      }
    }

    setPushNotifications(val);
    updatePreference("emailNotifications", val);
    showToast(
      val ? "Push notifications enabled" : "Push notifications disabled",
    );
  }

  function handleThemeToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    globalSetTheme(nextTheme);
    updatePreference("theme", nextTheme);
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
            className="flex items-center justify-between rounded-[22px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-4 transition-opacity hover:opacity-95"
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
                  <div className="flex size-full items-center justify-center bg-muted text-muted-foreground">
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
          <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-5 space-y-4">
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
                Push notifications
              </span>
              <Switch
                checked={pushNotifications}
                onChange={handlePushNotificationsToggle}
                aria-label="Push notifications"
              />
            </div>
          </div>

          {/* Appearance Card */}
          <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-5 space-y-4">
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
          </div>

          {/* Navigation Card (Mobile only) */}
          <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-5 space-y-4 md:hidden">
            <div className="flex items-center gap-2 text-base font-bold text-foreground">
              <Compass className="size-5" />
              <span>Navigation</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-sm font-semibold text-foreground block">
                  Mobile Navigation Style
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Choose between the classic sidebar and bottom navigation bar
                  on mobile
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMobileNav("sidebar");
                    showToast("Switched to Classic Sidebar");
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-primary",
                    mobileNav === "sidebar"
                      ? "border-[#2F1AC4] bg-[#2F1AC4] text-white shadow-xs dark:border-primary dark:bg-primary"
                      : "border-border bg-background/80 text-foreground hover:bg-background",
                  )}
                >
                  <PanelLeft className="size-5" strokeWidth={2.2} />
                  <span>Classic Sidebar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileNav("bottom");
                    showToast("Switched to Bottom Nav Bar");
                  }}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-2xl border p-3.5 text-xs font-semibold transition-all focus-visible:outline-2 focus-visible:outline-primary",
                    mobileNav === "bottom"
                      ? "border-[#2F1AC4] bg-[#2F1AC4] text-white shadow-xs dark:border-primary dark:bg-primary"
                      : "border-border bg-background/80 text-foreground hover:bg-background",
                  )}
                >
                  <PanelBottom className="size-5" strokeWidth={2.2} />
                  <span>Bottom Nav Bar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Security Card */}
          <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-5 space-y-4">
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
          </div>

          {/* About Card */}
          <div className="rounded-[24px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-5 space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-foreground">
              <Info className="size-5" />
              <span>About</span>
            </div>

            <Link
              href="/about"
              className="flex w-full items-center justify-between text-left transition-opacity hover:opacity-80"
            >
              <div className="space-y-0.5">
                <span className="text-sm font-semibold text-foreground">
                  About Clario
                </span>
                <p className="text-xs text-muted-foreground">
                  Version 1.0.0 • Terms & Privacy
                </p>
              </div>
              <ChevronRight className="size-5 text-foreground shrink-0" />
            </Link>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-destructive py-3.5 text-base font-semibold text-destructive-foreground shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-destructive"
          >
            <LogOut className="size-5" />
            <span>Logout</span>
          </button>

          {/* Delete Account Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setShowDeleteAccount(true);
                setDeleteConfirmText("");
                setDeleteError("");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-destructive/10 py-3.5 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20 focus-visible:outline-2 focus-visible:outline-destructive"
            >
              <Trash2 className="size-4" />
              <span>Delete Account</span>
            </button>
          </div>
        </div>

        {/* Delete Account Confirmation Modal */}
        {showDeleteAccount && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm animate-in fade-in duration-200"
            role="presentation"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget && !isDeletingAccount) {
                setShowDeleteAccount(false);
                setDeleteConfirmText("");
                setDeleteError("");
              }
            }}
          >
            <div className="w-full max-w-md rounded-[28px] border border-border bg-background p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-destructive">
                <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    Delete Account
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              <p className="text-sm text-foreground/80">
                Are you sure you want to delete your Clario account? All your
                personal profile information, messages, team memberships, and
                tasks will be permanently removed.
              </p>

              <div className="rounded-xl bg-destructive/10 p-3.5 space-y-2">
                <p className="text-xs font-medium text-foreground">
                  To confirm, type{" "}
                  <span className="font-bold text-destructive select-all">
                    delete my account
                  </span>{" "}
                  below:
                </p>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="delete my account"
                  disabled={isDeletingAccount}
                  autoFocus
                  className="h-10 rounded-lg border-destructive/30 bg-background text-xs text-foreground placeholder:text-muted-foreground focus-visible:ring-destructive"
                />
              </div>

              {deleteError && (
                <div
                  role="alert"
                  className="rounded-xl bg-destructive/10 p-3 text-xs text-destructive"
                >
                  {deleteError}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={() => {
                    setShowDeleteAccount(false);
                    setDeleteConfirmText("");
                  }}
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={
                    isDeletingAccount ||
                    deleteConfirmText.trim().toLowerCase() !==
                      "delete my account"
                  }
                  onClick={handleDeleteAccount}
                  className="flex items-center gap-2 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Trash2 className="size-4" />
                  <span>
                    {isDeletingAccount
                      ? "Deleting..."
                      : "I understand, delete my account"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

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
                <PasswordInput
                  id="curr-pwd"
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
                <PasswordInput
                  id="new-pwd"
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
                <PasswordInput
                  id="confirm-pwd"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="************"
                  className="h-12 rounded-xl border border-input bg-background px-4 text-base"
                />
              </div>

              {/* Real-time Password Validity Feedback */}
              {(newPassword.length > 0 || confirmPassword.length > 0) && (
                <PasswordValidityIndicator
                  password={newPassword}
                  confirmPassword={confirmPassword}
                  minLength={6}
                  showMatch={true}
                />
              )}

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
