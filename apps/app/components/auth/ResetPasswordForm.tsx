"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordValidityIndicator } from "@/components/ui/password-validity";
import { cn } from "@/lib/utils";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="rounded-2xl bg-destructive/10 p-4 text-sm text-destructive">
          Invalid or missing reset token. Please request a new password reset
          link.
        </div>
        <Link
          href="/forgot-password"
          className={cn(buttonVariants(), "w-full")}
        >
          Request new reset link
        </Link>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const result = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(result.error ?? "Failed to reset password. Please try again.");
        setIsSubmitting(false);
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error resetting password. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="space-y-6 text-center animate-in fade-in-50 duration-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10">
          <Check className="size-7 text-emerald-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold">Password Reset Complete</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Your password has been successfully updated. You can now log in with
            your new credentials.
          </p>
        </div>

        <Link href="/login" className={cn(buttonVariants(), "w-full")}>
          Proceed to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <label
          htmlFor="new-password"
          className="text-sm font-medium text-foreground"
        >
          New Password
        </label>
        <PasswordInput
          id="new-password"
          placeholder="Enter new password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirm-new-password"
          className="text-sm font-medium text-foreground"
        >
          Confirm New Password
        </label>
        <PasswordInput
          id="confirm-new-password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      {/* Real-time Password Validity Feedback */}
      {(password.length > 0 || confirmPassword.length > 0) && (
        <PasswordValidityIndicator
          password={password}
          confirmPassword={confirmPassword}
          minLength={8}
          showMatch={true}
        />
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 h-12 w-full rounded-lg text-base font-normal"
      >
        {isSubmitting ? "Resetting Password..." : "Reset Password"}
      </Button>

      <div className="text-center pt-2">
        <Link
          href="/login"
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to Login
        </Link>
      </div>
    </form>
  );
}
