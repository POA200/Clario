"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

import { GoogleButton } from "@/components/auth/GoogleButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (!result) {
        setError(
          "Unable to connect to authentication server. Please try again.",
        );
        setIsSubmitting(false);
        return;
      }

      if (result.error) {
        setError("Invalid email or password.");
        setIsSubmitting(false);
        return;
      }

      if (result.ok) {
        window.location.href = result.url || "/dashboard";
      } else {
        setError("Invalid email or password.");
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      console.error("Login submission error:", err);
      const isSyntaxOrDocType =
        err instanceof Error &&
        (err.message.includes("is not valid JSON") ||
          err.message.includes("DOCTYPE") ||
          err.message.includes("Unexpected token") ||
          err.message.includes("fetch"));

      const message = isSyntaxOrDocType
        ? "Unable to reach the authentication server. Please check your connection and try again."
        : err instanceof Error && err.message
          ? err.message
          : "Invalid email or password. Please try again.";
      setError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <div>
        <Input
          aria-label="Email"
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <div>
        <Input
          aria-label="Password"
          id="password"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      <div className="-mt-3 text-right md:mt-0">
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:underline md:text-lg"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="h-12 w-full rounded-lg text-base font-normal md:h-14 md:rounded-xl md:text-xl"
      >
        {isSubmitting ? "Logging in..." : "Login"}
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
