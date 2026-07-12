import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";

type LogoProps = ComponentPropsWithoutRef<typeof Link> & {
  label?: string;
};

function Logo({
  className,
  label = "Clario",
  href = "/",
  ...props
}: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    >
      <span className="flex size-8 items-center justify-center rounded-full bg-foreground text-background">
        C
      </span>
      <span>{label}</span>
    </Link>
  );
}

export { Logo };
