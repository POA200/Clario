"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Authentication will be connected later.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <span className="text-xl">✓</span>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Check your inbox</h2>

          <p className="text-sm leading-6 text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{email}</span>,
            we&apos;ll send you a password reset link.
          </p>
        </div>

        <Link href="/login" className={cn(buttonVariants(), "w-full")}>
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label
          htmlFor="forgot-email"
          className="text-sm font-medium text-foreground"
        >
          Email
        </label>

        <Input
          id="forgot-email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
      </div>

      <Button type="submit" className="w-full">
        Send reset link
      </Button>

      <div className="text-center">
        <Link
          href="/login"
          className="text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </form>
  );
}
