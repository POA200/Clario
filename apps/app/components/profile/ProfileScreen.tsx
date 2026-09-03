"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  Check,
  Loader2,
  Pencil,
  Settings,
  SquarePen,
  UserRound,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordValidityIndicator } from "@/components/ui/password-validity";
import { formatDisplayName, formatDisplayUsername } from "@/lib/utils";
import type { UserProfile } from "@/services/user-service";

type ProfileScreenProps = {
  initialProfile: UserProfile;
};

export function ProfileScreen({ initialProfile }: ProfileScreenProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [isEditing, setIsEditing] = useState(false);

  // Form states
  const [name, setName] = useState(initialProfile.name || "");
  const [username, setUsername] = useState(
    initialProfile.username ? `@${initialProfile.username}` : "",
  );
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(initialProfile.image || "");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const displayName = formatDisplayName(
    profile.name,
    profile.username,
    profile.id,
  );
  const displayUsername = formatDisplayUsername(profile.username, profile.id);

  const handleImageFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPEG, WebP, GIF).");
      return;
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      setError(
        "Image size exceeds the 2MB limit. Please choose a smaller photo.",
      );
      return;
    }

    setError("");
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) {
        setIsUploading(false);
        return;
      }

      setAvatarUrl(dataUrl);
      setProfile((prev) => ({ ...prev, image: dataUrl }));

      try {
        const response = await fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data?.error || "Failed to update profile picture.");
          return;
        }

        if (data.user) {
          setProfile(data.user);
          setSuccessMessage("Profile picture updated successfully!");
        }
      } catch {
        setError("Network error uploading profile picture.");
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      setError("Failed to read image file.");
      setIsUploading(false);
    };

    reader.readAsDataURL(file);
  };

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Full Name is required.");
      return;
    }

    let cleanUsername = username.trim();
    if (cleanUsername.startsWith("@")) {
      cleanUsername = cleanUsername.substring(1).trim();
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: trimmedName,
          username: cleanUsername || undefined,
          password: password.trim() ? password.trim() : undefined,
          image: avatarUrl.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || "Failed to update profile.");
        return;
      }

      if (data.user) {
        setProfile(data.user);
        setName(data.user.name || "");
        setUsername(data.user.username ? `@${data.user.username}` : "");
        setAvatarUrl(data.user.image || "");
        setPassword("");
        setSuccessMessage("Profile saved successfully!");
        setIsEditing(false);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      <main className="mx-auto max-w-md px-5 py-6 md:py-10">
        {/* Top Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Go back to Dashboard"
              onClick={() => {
                if (isEditing) {
                  setIsEditing(false);
                  setError("");
                } else {
                  router.push("/dashboard");
                }
              }}
              className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
            >
              <ArrowLeft className="size-6" strokeWidth={2.2} />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              My Profile
            </h1>
          </div>

          <Link
            href="/settings"
            aria-label="Settings"
            className="flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary"
          >
            <Settings className="size-5" strokeWidth={1.8} />
          </Link>
        </header>

        {/* Avatar Section */}
        <div className="mt-8 flex flex-col items-center text-center">
          <div className="relative">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageFileSelect}
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              aria-label="Upload profile picture"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex size-32 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted transition-opacity hover:opacity-90 md:size-36"
            >
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={displayName}
                  className="size-full object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-muted text-4xl font-bold text-muted-foreground">
                  <UserRound className="size-16 text-muted-foreground" />
                </div>
              )}

              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white backdrop-blur-xs">
                  <Loader2 className="size-8 animate-spin" />
                </div>
              )}
            </div>

            {/* Edit Avatar Badge */}
            <button
              type="button"
              aria-label="Upload profile picture"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="absolute bottom-1 right-1 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Camera className="size-4" strokeWidth={2.2} />
            </button>
          </div>

          <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground md:text-[26px]">
            {displayName}
          </h2>
          <p className="mt-0.5 text-sm font-medium text-muted-foreground">
            {displayUsername}
          </p>
        </div>

        {/* Success / Error Messages */}
        {successMessage && (
          <div
            role="status"
            className="mt-6 flex items-center gap-2 rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-600"
          >
            <Check className="size-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mt-6 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        )}

        {/* View Mode or Edit Mode */}
        {!isEditing ? (
          /* View Mode Card (media_1788279592998.png) */
          <div className="mt-8 rounded-[28px] border border-[#D5CAFE]/60 bg-[#EAE6FE] dark:border-border dark:bg-dashboard-surface p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-foreground">Name:</span>
                <span className="font-normal text-foreground">
                  {displayName}
                </span>
              </div>

              <div className="flex items-center justify-between text-base">
                <span className="font-semibold text-foreground">Email:</span>
                <span className="font-normal text-foreground">
                  {profile.email}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setError("");
                setSuccessMessage("");
              }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2F1AC4] py-4 text-base font-semibold text-white transition-opacity hover:opacity-95 focus-visible:outline-2 focus-visible:outline-primary"
            >
              <span>Edit profile</span>
              <SquarePen className="size-4" strokeWidth={2} />
            </button>
          </div>
        ) : (
          /* Edit Mode Card (media_1788279603007.png) */
          <form
            onSubmit={handleSave}
            className="mt-8 rounded-[28px] border-2 border-[#2F1AC4] bg-background p-6 shadow-sm"
          >
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="full-name"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Full Name:
                </label>
                <Input
                  id="full-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  maxLength={80}
                  className="h-12 rounded-xl border border-input bg-background px-4 text-base text-foreground"
                />
              </div>

              <div>
                <label
                  htmlFor="email-address"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Email Address:
                </label>
                <Input
                  id="email-address"
                  value={profile.email}
                  disabled
                  readOnly
                  className="h-12 cursor-not-allowed rounded-xl border border-input bg-muted/40 px-4 text-base text-muted-foreground"
                />
              </div>

              <div>
                <label
                  htmlFor="username-input"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Username
                </label>
                <Input
                  id="username-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@username"
                  maxLength={30}
                  className="h-12 rounded-xl border border-input bg-background px-4 text-base text-foreground"
                />
              </div>

              <div>
                <label
                  htmlFor="password-input"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <PasswordInput
                  id="password-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="************"
                  className="h-12 rounded-xl border border-input bg-background px-4 text-base text-foreground"
                />
              </div>

              {/* Real-time Password Validity Feedback when typing a new password */}
              {password.length > 0 && (
                <PasswordValidityIndicator password={password} minLength={6} />
              )}
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="mt-6 flex w-full items-center justify-center rounded-2xl bg-[#2F1AC4] py-4 text-base font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-primary"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
