"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends Omit<
  React.ComponentProps<"input">,
  "type"
> {
  wrapperClassName?: string;
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(({ className, wrapperClassName, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className={cn("relative flex items-center w-full", wrapperClassName)}>
      <Input
        type={showPassword ? "text" : "password"}
        className={cn("pr-11", className)}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setShowPassword((prev) => !prev)}
        className="absolute right-3.5 flex items-center justify-center text-muted-foreground/70 hover:text-foreground focus-visible:outline-none transition-colors"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <EyeOff className="size-5 shrink-0" strokeWidth={1.8} />
        ) : (
          <Eye className="size-5 shrink-0" strokeWidth={1.8} />
        )}
      </button>
    </div>
  );
});

PasswordInput.displayName = "PasswordInput";
