"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { PasswordValidityIndicator } from "@/components/ui/password-validity";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Unable to create your account.");
        setIsSubmitting(false);
        return;
      }

      router.push("/login?registered=1");
    } catch {
      setError("Network error creating account. Please try again.");
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          aria-label="Full Name"
          id="name"
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          required
        />
      </div>

      <div>
        <Input
          aria-label="Username"
          id="username"
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
        />
      </div>

      <div>
        <Input
          aria-label="Email"
          id="register-email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div className="space-y-2">
        <PasswordInput
          aria-label="Password"
          id="register-password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="new-password"
          minLength={8}
          required
        />
      </div>

      <div className="space-y-2">
        <PasswordInput
          aria-label="Confirm Password"
          id="confirm-password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
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

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-lg text-base font-normal"
      >
        {isSubmitting ? "Creating account..." : "Sign Up"}
      </Button>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <GoogleButton />
    </form>
  );
}
