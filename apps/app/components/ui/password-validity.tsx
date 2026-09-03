"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordValidityProps {
  password: string;
  confirmPassword?: string;
  minLength?: number;
  className?: string;
  showMatch?: boolean;
}

export function PasswordValidityIndicator({
  password,
  confirmPassword,
  minLength = 8,
  className,
  showMatch = false,
}: PasswordValidityProps) {
  if (!password && (!showMatch || !confirmPassword)) {
    return null;
  }

  const hasMinLength = password.length >= minLength;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  const passwordsMatch =
    showMatch && confirmPassword !== undefined && confirmPassword.length > 0
      ? password === confirmPassword
      : null;

  // Calculate strength score
  let score = 0;
  if (hasMinLength) score += 1;
  if (hasLetter) score += 1;
  if (hasNumber) score += 1;
  if (hasSpecial) score += 1;
  if (password.length >= 12) score += 1;

  const strengthLabel = score <= 1 ? "Weak" : score <= 3 ? "Fair" : "Strong";

  const strengthColor =
    score <= 1
      ? "bg-rose-500 text-rose-500"
      : score <= 3
        ? "bg-amber-500 text-amber-500"
        : "bg-emerald-500 text-emerald-500";

  const barPercent = Math.min(100, Math.max(15, (score / 4) * 100));

  const rules = [
    {
      label: `At least ${minLength} characters`,
      valid: hasMinLength,
    },
    {
      label: "Contains at least one letter",
      valid: hasLetter,
    },
    {
      label: "Contains at least one number",
      valid: hasNumber,
    },
  ];

  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-muted/30 p-3.5 space-y-3 text-xs animate-in fade-in-50 duration-200",
        className,
      )}
    >
      {/* Strength Bar */}
      {password.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-medium">
            <span className="text-muted-foreground">Password strength:</span>
            <span className={cn("font-semibold", strengthColor.split(" ")[1])}>
              {strengthLabel}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                strengthColor.split(" ")[0],
              )}
              style={{ width: `${barPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Rules list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
        {rules.map((rule) => (
          <div
            key={rule.label}
            className={cn(
              "flex items-center gap-1.5 transition-colors text-[11px]",
              rule.valid
                ? "text-emerald-600 dark:text-emerald-400 font-medium"
                : "text-muted-foreground",
            )}
          >
            {rule.valid ? (
              <Check className="size-3.5 shrink-0 text-emerald-500" />
            ) : (
              <span className="size-1.5 rounded-full bg-muted-foreground/50 mx-1 shrink-0" />
            )}
            <span>{rule.label}</span>
          </div>
        ))}

        {showMatch &&
          confirmPassword !== undefined &&
          confirmPassword.length > 0 && (
            <div
              className={cn(
                "flex items-center gap-1.5 transition-colors text-[11px]",
                passwordsMatch
                  ? "text-emerald-600 dark:text-emerald-400 font-medium"
                  : "text-rose-500 font-medium",
              )}
            >
              {passwordsMatch ? (
                <Check className="size-3.5 shrink-0 text-emerald-500" />
              ) : (
                <X className="size-3.5 shrink-0 text-rose-500" />
              )}
              <span>
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </span>
            </div>
          )}
      </div>
    </div>
  );
}
