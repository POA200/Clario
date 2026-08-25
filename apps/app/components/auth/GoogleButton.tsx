"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

import { Button } from "@/components/ui/button";

function GoogleGIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
      <path
        fill="#EA4335"
        d="M12 10.2v3.95h5.49c-.24 1.27-.96 2.35-2.03 3.07l3.28 2.55c1.91-1.76 3.01-4.35 3.01-7.42 0-.72-.06-1.41-.18-2.08H12Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.28-2.55c-.9.61-2.06.97-3.34.97-2.57 0-4.75-1.74-5.53-4.08L3.09 16.5A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#4A90E2"
        d="M6.47 13.9A5.9 5.9 0 0 1 6.16 12c0-.66.12-1.29.31-1.9L3.09 7.5A10 10 0 0 0 2 12c0 1.62.39 3.16 1.09 4.5l3.38-2.6Z"
      />
      <path
        fill="#FBBC05"
        d="M12 5.98c1.47 0 2.8.5 3.83 1.49l2.87-2.87C16.96 2.98 14.7 2 12 2a10 10 0 0 0-8.91 5.5l3.38 2.6c.78-2.34 2.96-4.12 5.53-4.12Z"
      />
    </svg>
  );
}

export function GoogleButton() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleClick() {
    if (isSubmitting) return;

    setIsSubmitting(true);
    const result = await signIn("google", {
      callbackUrl: "/dashboard",
      redirect: false,
    });

    if (result?.url) {
      window.location.assign(result.url);
      return;
    }

    setIsSubmitting(false);
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="h-12 w-full rounded-lg text-base font-normal"
      onClick={() => void handleClick()}
      disabled={isSubmitting}
    >
      <span className="inline-flex items-center gap-2">
        <GoogleGIcon />
        <span>
          {isSubmitting ? "Connecting to Google..." : "Continue with Google"}
        </span>
      </span>
    </Button>
  );
}
