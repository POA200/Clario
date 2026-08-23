"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    void email;
    void password;
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

      <div className="-mt-3 text-right md:-mt-4">
        <Link
          href="/forgot-password"
          className="text-sm text-primary hover:underline md:text-lg"
        >
          Forgot password?
        </Link>
      </div>

      <Button
        type="submit"
        className="h-12 w-full rounded-lg text-base font-normal md:h-[90px] md:rounded-xl md:text-3xl"
      >
        Login
      </Button>
    </form>
  );
}
